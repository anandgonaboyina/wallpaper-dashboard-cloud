import { MongoClient } from 'mongodb';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('Failed to set custom DNS servers:', err);
}

const uri = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/productivedashboard';
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not found, falling back to local mongodb://127.0.0.1:27017/productivedashboard');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
