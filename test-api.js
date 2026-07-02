const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

async function test() {
  const secret = 'anand_productive_dashboard_secret_key_2026';
  const token = jwt.sign({ userId: '6a4539365611cae679d9b55f', username: 'Anand kumar' }, secret);
  
  const res = await fetch('http://localhost:3000/api/store', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const json = await res.json();
  console.log('GET /api/store response:', JSON.stringify(json, null, 2));
}

test();
