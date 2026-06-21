const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://127.0.0.1:27017/productivedashboard');
  try {
    await client.connect();
    const db = client.db();

    // Seed dedicated Roadmap collection
    const existing = await db.collection('Roadmap').countDocuments();
    if (existing === 0) {
      await db.collection('Roadmap').insertMany([
        { title: 'AI Voice Input', description: 'Voice-driven AI system to add tasks, deadlines, and notes hands-free.', status: 'planned', priority: 1, createdAt: new Date() },
        { title: 'Mobile App (Android/iOS)', description: 'Native mobile app to sync and view your dashboard from anywhere.', status: 'planned', priority: 2, createdAt: new Date() },
        { title: 'Collaborative Workspaces', description: 'Share and work on tasks and timetables with friends in real-time.', status: 'in_progress', priority: 3, createdAt: new Date() },
        { title: 'Smart Deadline AI Suggestions', description: 'AI-powered suggestions for breaking deadlines into smaller milestones.', status: 'planned', priority: 4, createdAt: new Date() }
      ]);
      console.log('Seeded 4 roadmap items!');
    } else {
      console.log('Roadmap already has', existing, 'items.');
    }

    // Mark existing feedback as added_to_roadmap for testing
    await db.collection('Feedback').updateMany({}, { $set: { status: 'added_to_roadmap' } });
    console.log('Marked all feedback as added_to_roadmap for testing.');

    const items = await db.collection('Roadmap').find().toArray();
    items.forEach(i => console.log(' -', i.title, '|', i.status));
  } finally {
    await client.close();
  }
}

run();
