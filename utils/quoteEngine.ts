export interface Quote {
  text: string;
  author: string;
}

let recentIndices: number[] = [];

export async function fetchQuote(): Promise<Quote> {
  // Always attempt to fetch fresh quotes if online (this is only called every ~30 mins)
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch('/api/quotes', { 
        cache: 'no-store',
        signal: AbortSignal.timeout(5000) 
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
      console.warn('Quote sync failed, relying on local cache');
    }
  }

  // Retrieve quotes from localStorage cache
  let sourceArray: Quote[] = [];
  try {
    const cached = localStorage.getItem('dashboard_cached_quotes');
    if (cached) {
      sourceArray = JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Quote cache corrupted');
  }

  if (!sourceArray || sourceArray.length === 0) {
    // Ultimate fallback if DB fails and cache is empty
    return {
      text: "The future depends on what you do today.",
      author: "Mahatma Gandhi"
    };
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
