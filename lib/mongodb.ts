import { MongoClient } from 'mongodb';

// Helper to resolve mongodb+srv URIs using DNS-over-HTTPS (DoH)
// to bypass local UDP port 53/SRV blocking (e.g. on college WiFi)
async function resolveMongoSrv(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) {
    return uri;
  }

  console.log('Resolving mongodb+srv URI via DNS-over-HTTPS (DoH) to bypass local DNS blocks...');
  try {
    const urlStr = uri.replace(/^mongodb\+srv:\/\//, 'http://');
    const parsed = new URL(urlStr);
    const credentials = parsed.username ? `${parsed.username}:${parsed.password}@` : '';
    const host = parsed.hostname;
    const pathname = parsed.pathname;
    const searchParams = new URLSearchParams(parsed.search);

    // 1. Resolve SRV record
    let srvAnswer = null;
    const srvUrlCf = `https://cloudflare-dns.com/dns-query?name=_mongodb._tcp.${host}&type=SRV`;
    const srvUrlGg = `https://dns.google/resolve?name=_mongodb._tcp.${host}&type=SRV`;

    try {
      const res = await fetch(srvUrlCf, { headers: { 'accept': 'application/dns-json' } });
      const data = await res.json();
      if (data.Answer && data.Answer.length > 0) {
        srvAnswer = data.Answer;
      }
    } catch (err) {
      console.warn('Cloudflare DoH SRV resolution failed, trying Google...', err instanceof Error ? err.message : err);
    }

    if (!srvAnswer) {
      try {
        const res = await fetch(srvUrlGg);
        const data = await res.json();
        if (data.Answer && data.Answer.length > 0) {
          srvAnswer = data.Answer;
        }
      } catch (err) {
        console.warn('Google DoH SRV resolution failed...', err instanceof Error ? err.message : err);
      }
    }

    if (!srvAnswer || srvAnswer.length === 0) {
      throw new Error(`Failed to resolve SRV records for ${host} using DNS-over-HTTPS`);
    }

    const hosts = srvAnswer.map((ans: any) => {
      const parts = ans.data.trim().split(/\s+/);
      const port = parts[parts.length - 2];
      let hostname = parts[parts.length - 1];
      if (hostname.endsWith('.')) {
        hostname = hostname.slice(0, -1);
      }
      return `${hostname}:${port}`;
    });

    // 2. Resolve TXT record for options
    let txtAnswer = null;
    const txtUrlCf = `https://cloudflare-dns.com/dns-query?name=${host}&type=TXT`;
    const txtUrlGg = `https://dns.google/resolve?name=${host}&type=TXT`;

    try {
      const res = await fetch(txtUrlCf, { headers: { 'accept': 'application/dns-json' } });
      const data = await res.json();
      if (data.Answer && data.Answer.length > 0) {
        txtAnswer = data.Answer;
      }
    } catch (err) {
      console.warn('Cloudflare DoH TXT resolution failed, trying Google...', err instanceof Error ? err.message : err);
    }

    if (!txtAnswer) {
      try {
        const res = await fetch(txtUrlGg);
        const data = await res.json();
        if (data.Answer && data.Answer.length > 0) {
          txtAnswer = data.Answer;
        }
      } catch (err) {
        console.warn('Google DoH TXT resolution failed...', err instanceof Error ? err.message : err);
      }
    }

    let txtOptions = '';
    if (txtAnswer && txtAnswer.length > 0) {
      const rawData = txtAnswer[0].data;
      txtOptions = rawData.replace(/^"|"$/g, '');
    }

    // 3. Construct new URI
    const resolvedParams = new URLSearchParams(txtOptions);
    for (const [key, value] of searchParams.entries()) {
      resolvedParams.set(key, value);
    }
    resolvedParams.set('ssl', 'true');

    const finalUri = `mongodb://${credentials}${hosts.join(',')}${pathname}?${resolvedParams.toString()}`;
    console.log('Successfully resolved to standard connection string:', finalUri.replace(/:[^@:]+@/, ':****@'));
    return finalUri;
  } catch (error) {
    console.error('DoH resolution error, falling back to original URI:', error);
    return uri;
  }
}

const uri = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/productivedashboard';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not found, falling back to local mongodb://127.0.0.1:27017/productivedashboard');
}

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

// Helper to create and connect MongoClient
const connectClient = async () => {
  console.log('Connecting to MongoDB...');
  const resolvedUri = await resolveMongoSrv(uri);
  client = new MongoClient(resolvedUri, options);
  return client.connect();
};

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = connectClient();
}

export default clientPromise;
