import clientPromise from '@/lib/mongodb';

export async function deleteInactiveUsers() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // 90 days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    // 1. Find all users who haven't explicitly logged in recently
    const usersWithOldLogins = await db.collection('User')
      .find({ lastLogin: { $lt: cutoffDate } })
      .project({ _id: 1 })
      .toArray();

    if (usersWithOldLogins.length === 0) return 0;
    
    const potentialInactiveIds = usersWithOldLogins.map(u => u._id.toString());

    // 2. Out of these users, find anyone who IS actually active (dashboard updated recently)
    const activeStores = await db.collection('DashboardStorage')
      .find({ 
        userId: { $in: potentialInactiveIds },
        updatedAt: { $gte: cutoffDate } 
      })
      .project({ userId: 1 })
      .toArray();

    const activeUserIds = new Set(activeStores.map(s => s.userId));

    // 3. Filter out the active ones
    const finalIdsToDelete = potentialInactiveIds.filter(id => !activeUserIds.has(id));

    if (finalIdsToDelete.length === 0) return 0;

    const { ObjectId } = require('mongodb');
    const finalObjectIds = finalIdsToDelete.map(id => {
      try { return new ObjectId(id); } catch { return id; }
    });

    // Delete everything related to these users
    await Promise.all([
      db.collection('User').deleteMany({ _id: { $in: finalObjectIds } }),
      db.collection('DashboardStorage').deleteMany({ userId: { $in: finalIdsToDelete } }),
      db.collection('HealthRecord').deleteMany({ userId: { $in: finalIdsToDelete } }),
      db.collection('Friendship').deleteMany({
        $or: [
          { senderId: { $in: finalIdsToDelete } },
          { receiverId: { $in: finalIdsToDelete } }
        ]
      }),
      db.collection('Feedback').deleteMany({ userId: { $in: finalIdsToDelete } })
    ]);

    console.log(`Cleaned up ${finalIdsToDelete.length} inactive users.`);
    return finalIdsToDelete.length;
  } catch (error) {
    console.error('Error cleaning up inactive users:', error);
    return 0;
  }
}
