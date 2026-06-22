import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function calculateAndAwardBadges() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // 1. Fetch users to get their lastBadgeAwarded dates
    const users = await db.collection('User').find({}, {
      projection: { password: 0, email: 0 }
    }).toArray();

    // 2. Fetch stores to calculate rankings
    const stores = await db.collection('DashboardStorage').find({}, {
      projection: { userId: 1, history: 1, data: 1 }
    }).toArray();

    // Reconstruct history per user
    const userHistories: Record<string, Record<string, number>> = {};
    stores.forEach(store => {
      let history = {};
      if (store.history) {
        history = store.history;
      } else if (store.data && typeof store.data === 'string') {
        try {
          const parsed = JSON.parse(store.data);
          if (parsed.history) history = parsed.history;
        } catch (e) {}
      } else if (store.data && store.data.history) {
        history = store.data.history;
      }
      userHistories[store.userId] = history;
    });

    const getLocalDateString = (d: Date) => {
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().split('T')[0];
    };

    const todayDate = new Date();
    const todayStr = getLocalDateString(todayDate);
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(todayDate); d.setDate(d.getDate() - i); return getLocalDateString(d);
    });
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date(todayDate); d.setDate(d.getDate() - i); return getLocalDateString(d);
    });

    // Compute stats for all users
    const stats = users.map(u => {
      const uIdStr = u._id.toString();
      const history = userHistories[uIdStr] || {};
      
      return {
        id: uIdStr,
        user: u,
        todayFocused: history[todayStr] || 0,
        last7DaysFocused: last7Days.reduce((acc, date) => acc + (history[date] || 0), 0),
        last30DaysFocused: last30Days.reduce((acc, date) => acc + (history[date] || 0), 0),
      };
    });

    // Helper to award badge
    const checkAndAward = async (filter: 'today' | 'week' | 'month', cooldownDays: number, minMinutes: number) => {
      const sortKey = filter === 'today' ? 'todayFocused' : filter === 'week' ? 'last7DaysFocused' : 'last30DaysFocused';
      
      const sorted = [...stats].sort((a, b) => b[sortKey] - a[sortKey]);
      const winner = sorted[0];

      // Strict Threshold: Ignore if the winner doesn't meet the minimum focus time
      if (!winner || winner[sortKey] < minMinutes) return;

      const lastAwardedStr = winner.user.lastBadgeAwarded?.[filter];
      let canAward = true;

      if (lastAwardedStr) {
        // We use string dates like 'YYYY-MM-DD' to represent when it was awarded
        const lastAwardedDate = new Date(lastAwardedStr);
        // Normalize today to start of day for accurate day-diff
        const todayNormalized = new Date(todayStr); 
        
        const diffTime = Math.abs(todayNormalized.getTime() - lastAwardedDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays < cooldownDays) {
          canAward = false;
        }
      }

      if (canAward) {
        // Award badge
        const incQuery: Record<string, number> = {};
        incQuery[`badges.${filter}`] = 1;
        
        const setQuery: Record<string, string> = {};
        setQuery[`lastBadgeAwarded.${filter}`] = todayStr;

        await db.collection('User').updateOne(
          { _id: new ObjectId(winner.id) },
          { 
            $inc: incQuery,
            $set: setQuery
          }
        );
      }
    };

    await Promise.all([
      checkAndAward('today', 1, 6 * 60),            // 1 day cooldown, minimum 6 hours
      checkAndAward('week', 7, 7 * 6 * 60),         // 7 days cooldown, minimum 42 hours (7 * 6)
      checkAndAward('month', 30, 30 * 6 * 60)       // 30 days cooldown, minimum 180 hours (30 * 6)
    ]);

  } catch (error) {
    console.error('Failed to calculate badges automatically:', error);
  }
}
