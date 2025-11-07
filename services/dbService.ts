let db: IDBDatabase;

const DB_NAME = 'AI-AccountingDB';
const DB_VERSION = 1;
const STORES = [
  'companyDetails',
  'ledgers',
  'ledgerGroups',
  'units',
  'stockGroups',
  'stockItems',
  'vouchers'
];

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      });
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      console.log('Database initialized successfully');
      resolve(true);
    };

    request.onerror = (event) => {
      console.error('Database error:', (event.target as IDBOpenDBRequest).error);
      reject(false);
    };
  });
};

export const saveData = <T>(storeName: string, data: T[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('DB not initialized');
      return reject('DB not initialized');
    }
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Clear the store before writing new data
    store.clear();

    // Add all new data
    data.forEach(item => {
      store.put(item);
    });

    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (event) => {
      console.error(`Error saving to ${storeName}:`, (event.target as IDBTransaction).error);
      reject();
    };
  });
};


export const loadData = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('DB not initialized');
      return reject('DB not initialized');
    }
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error(`Error loading from ${storeName}:`, (event.target as IDBRequest).error);
      reject();
    };
  });
};
