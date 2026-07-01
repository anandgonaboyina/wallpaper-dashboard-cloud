export const saveWallpaperToDB = (key: string, file: File | Blob) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve(false);
    
    const request = indexedDB.open('WallpaperDB', 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains('wallpapers')) {
        db.createObjectStore('wallpapers');
      }
    };
    request.onsuccess = (e) => {
      const db = (e.target as any).result;
      const tx = db.transaction('wallpapers', 'readwrite');
      const store = tx.objectStore('wallpapers');
      store.put(file, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
};

export const getWallpaperFromDB = (key: string): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve(null);

    const request = indexedDB.open('WallpaperDB', 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains('wallpapers')) {
        db.createObjectStore('wallpapers');
      }
    };
    request.onsuccess = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains('wallpapers')) return resolve(null);
      
      const tx = db.transaction('wallpapers', 'readonly');
      const store = tx.objectStore('wallpapers');
      const getReq = store.get(key);
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => reject(getReq.error);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteWallpaperFromDB = (key: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve(false);

    const request = indexedDB.open('WallpaperDB', 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains('wallpapers')) {
        db.createObjectStore('wallpapers');
      }
    };
    request.onsuccess = (e) => {
      const db = (e.target as any).result;
      if (!db.objectStoreNames.contains('wallpapers')) return resolve(true);

      const tx = db.transaction('wallpapers', 'readwrite');
      const store = tx.objectStore('wallpapers');
      store.delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
};
