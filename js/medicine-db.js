/*
 * Local database for storing medicine entries and dose logs using IndexedDB.
 * Offline-first medicine repository.
 * Database: "medicine-tracker"
 * Stores: "medicines", "dose_logs"
 */

(function () {
  const DB_NAME = 'medicine-tracker';
  const MEDICINES_STORE = 'medicines';
  const LOGS_STORE = 'dose_logs';
  const DB_VERSION = 2;
  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(MEDICINES_STORE)) {
          const store = db.createObjectStore(MEDICINES_STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('created_at', 'created_at', { unique: false });
        }
        if (!db.objectStoreNames.contains(LOGS_STORE)) {
          const logStore = db.createObjectStore(LOGS_STORE, { keyPath: 'id', autoIncrement: true });
          logStore.createIndex('medicine_id', 'medicine_id', { unique: false });
          logStore.createIndex('logged_at', 'logged_at', { unique: false });
        }
      };
      request.onsuccess = function (event) {
        resolve(event.target.result);
      };
      request.onerror = function (event) {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
    return dbPromise;
  }

  function addMedicine(record) {
    return openDB().then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDICINES_STORE, 'readwrite');
        const store = tx.objectStore(MEDICINES_STORE);
        record.created_at = new Date().toISOString();
        const request = store.add(record);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
      });
    });
  }

  function getAllMedicines() {
    return openDB().then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDICINES_STORE, 'readonly');
        const store = tx.objectStore(MEDICINES_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (e) => reject(e.target.error);
      });
    });
  }

  function archiveMedicine(id) {
    return openDB().then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDICINES_STORE, 'readwrite');
        const store = tx.objectStore(MEDICINES_STORE);
        const getRequest = store.get(Number(id));
        getRequest.onsuccess = () => {
          const medicine = getRequest.result;
          if (!medicine) {
            reject(new Error('Medicine not found'));
            return;
          }
          medicine.archived = true;
          const updateRequest = store.put(medicine);
          updateRequest.onsuccess = () => resolve(medicine);
          updateRequest.onerror = (event) => reject(event.target.error);
        };
        getRequest.onerror = (event) => reject(event.target.error);
        tx.onerror = (event) => reject(event.target.error);
      });
    });
  }

  function restoreMedicine(id) {
    return openDB().then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDICINES_STORE, 'readwrite');
        const store = tx.objectStore(MEDICINES_STORE);
        const getRequest = store.get(Number(id));
        getRequest.onsuccess = () => {
          const medicine = getRequest.result;
          if (!medicine) {
            reject(new Error('Medicine not found'));
            return;
          }
          medicine.archived = false;
          const updateRequest = store.put(medicine);
          updateRequest.onsuccess = () => resolve(medicine);
          updateRequest.onerror = (event) => reject(event.target.error);
        };
        getRequest.onerror = (event) => reject(event.target.error);
        tx.onerror = (event) => reject(event.target.error);
      });
    });
  }

  function clearAllData() {
    return openDB().then((db) => new Promise((resolve, reject) => {
      const tx = db.transaction([MEDICINES_STORE, LOGS_STORE], 'readwrite');
      tx.objectStore(MEDICINES_STORE).clear();
      tx.objectStore(LOGS_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Could not clear medicine data'));
      tx.onabort = () => reject(tx.error || new Error('Could not clear medicine data'));
    }));
  }

  function logDose(medicine) {
    return openDB().then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(LOGS_STORE, 'readwrite');
        const store = tx.objectStore(LOGS_STORE);
        const logEntry = {
          medicine_id: medicine.id || null,
          medicine_name: medicine.name,
          dosage: medicine.dosage || '',
          logged_at: new Date().toISOString(),
          timestamp_label: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date_label: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
        };
        const request = store.add(logEntry);
        request.onsuccess = () => resolve({ id: request.result, ...logEntry });
        request.onerror = (e) => reject(e.target.error);
      });
    });
  }

  function getTodayDoses() {
    return openDB().then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(LOGS_STORE, 'readonly');
        const store = tx.objectStore(LOGS_STORE);
        const request = store.getAll();
        request.onsuccess = () => {
          const allLogs = request.result || [];
          const todayDateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
          const todayLogs = allLogs.filter(log => log.date_label === todayDateStr);
          resolve(todayLogs);
        };
        request.onerror = (e) => reject(e.target.error);
      });
    });
  }

  function getAllDoseLogs() {
    return openDB().then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(LOGS_STORE, 'readonly');
        const store = tx.objectStore(LOGS_STORE);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (e) => reject(e.target.error);
      });
    });
  }

  window.MedicineDB = {
    init: openDB,
    addMedicine,
    getAllMedicines,
    archiveMedicine,
    restoreMedicine,
    clearAllData,
    logDose,
    getTodayDoses,
    getAllDoseLogs
  };
})();
