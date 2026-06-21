import fallbackQuotes from './quotes.json';

export interface Quote {
  text: string;
  author: string;
}

let recentIndices: number[] = [];
let dbFetchAttempted = false;

export async function fetchQuote(): Promise<Quote> {
  // Sync quotes from DB to local storage ONLY ONCE per reload
  if (!dbFetchAttempted) {
    dbFetchAttempted = true;
    try {
      const res = await fetch('/api/quotes', { 
        cache: 'no-store',
        signal: AbortSignal.timeout(3000) 
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.quotes && data.quotes.length > 0) {
          // Clean up the authors and structure them
          const cleanedQuotes = data.quotes.map((q: any) => ({
            text: q.text,
            author: (q.author || 'Unknown').replace(', type.fit', '')
          }));
          localStorage.setItem('dashboard_cached_quotes', JSON.stringify(cleanedQuotes));
        }
      }
    } catch (err) {
      console.warn('Quote sync failed, will rely on local cache or fallback JSON');
    }
  }

  // Retrieve quotes from localStorage cache, fallback to robust JSON
  let sourceArray: Quote[] = [];
  try {
    const cached = localStorage.getItem('dashboard_cached_quotes');
    if (cached) {
      sourceArray = JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Cache corrupted, using fallback');
  }

  if (!sourceArray || sourceArray.length === 0) {
    sourceArray = fallbackQuotes as Quote[];
  }

  // Pick a random quote avoiding immediate repeats
  let randomIndex = Math.floor(Math.random() * sourceArray.length);
  const maxRecent = Math.min(20, Math.floor(sourceArray.length / 2));
  
  let attempts = 0;
  while (recentIndices.includes(randomIndex) && attempts < 10) {
    randomIndex = Math.floor(Math.random() * sourceArray.length);
    attempts++;
  }
  
  recentIndices.push(randomIndex);
  if (recentIndices.length > maxRecent) {
    recentIndices.shift(); // Remove oldest
  }

  const q = sourceArray[randomIndex];
  
  return {
    text: q.text || 'Keep pushing forward.',
    author: (q.author || 'Unknown').replace(', type.fit', ''), 
  };
}
