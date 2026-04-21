const DB_NAME = 'low-sai-demo-room-images';
const DB_VERSION = 1;
const STORE_NAME = 'roomImages';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
    tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction error'));
  });
}

export async function saveDemoRoomImage(roomId, fileOrBlob) {
  if (!roomId) throw new Error('roomId is required');
  if (!fileOrBlob) throw new Error('fileOrBlob is required');

  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put(fileOrBlob, roomId);
  await txDone(tx);
  db.close();
}

export async function getDemoRoomImage(roomId) {
  if (!roomId) throw new Error('roomId is required');

  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const req = tx.objectStore(STORE_NAME).get(roomId);
  const result = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  await txDone(tx);
  db.close();
  return result;
}

export async function deleteDemoRoomImage(roomId) {
  if (!roomId) throw new Error('roomId is required');

  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(roomId);
  await txDone(tx);
  db.close();
}

export async function clearAllDemoRoomImages() {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
  await txDone(tx);
  db.close();
}

