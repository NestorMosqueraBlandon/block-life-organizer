
import { CalendarBlock } from '../types/calendar';

const DB_NAME = 'CalendarDB';
const DB_VERSION = 1;
const STORE_NAME = 'calendarBlocks';

interface DBCalendarBlock extends CalendarBlock {
  createdAt: number;
  updatedAt: number;
}

class CalendarDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('category', 'category', { unique: false });
        }
      };
    });
  }

  async addBlock(block: CalendarBlock): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const dbBlock: DBCalendarBlock = {
      ...block,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(dbBlock);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateBlock(block: CalendarBlock): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(block.id);

      getRequest.onsuccess = () => {
        const existingBlock = getRequest.result;
        const updatedBlock: DBCalendarBlock = {
          ...block,
          createdAt: existingBlock?.createdAt || Date.now(),
          updatedAt: Date.now()
        };

        const putRequest = store.put(updatedBlock);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteBlock(blockId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(blockId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllBlocks(): Promise<CalendarBlock[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const blocks = request.result.map((dbBlock: DBCalendarBlock) => {
          const { createdAt, updatedAt, ...block } = dbBlock;
          return block as CalendarBlock;
        });
        resolve(blocks);
      };
    });
  }

  async getBlocksByDateRange(startDate: string, endDate: string): Promise<CalendarBlock[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('date');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const blocks = request.result.map((dbBlock: DBCalendarBlock) => {
          const { createdAt, updatedAt, ...block } = dbBlock;
          return block as CalendarBlock;
        });
        resolve(blocks);
      };
    });
  }
}

export const calendarDB = new CalendarDB();
