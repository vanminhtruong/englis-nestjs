/**
 * "Remember me" storage for the login form.
 *
 * The password is never kept as plain text. It is encrypted with an AES-GCM key that is
 * generated in this browser as NON-EXTRACTABLE (the raw key bytes can never be read back,
 * not even by this app's own code) and both live in IndexedDB on this device only.
 * Nothing here is sent to any server, and no device identifiers are collected.
 */
const DB_NAME = 'vocabmaster-auth'
const STORE = 'vault'
const RECORD_ID = 'remembered-login'

interface VaultRecord {
  id: string
  key: CryptoKey
  iv: Uint8Array
  data: ArrayBuffer
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function run<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const request = action(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(request.result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function saveRememberedLogin(email: string, password: string): Promise<void> {
  if (!window.crypto?.subtle || !window.indexedDB) return
  const db = await openDb()
  try {
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
      'encrypt',
      'decrypt',
    ])
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const data = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(JSON.stringify({ email, password }))
    )
    const record: VaultRecord = { id: RECORD_ID, key, iv, data }
    await run(db, 'readwrite', (store) => store.put(record))
  } finally {
    db.close()
  }
}

/** Returns the saved password only if it belongs to the given email. */
export async function loadRememberedPassword(email: string): Promise<string | null> {
  if (!window.crypto?.subtle || !window.indexedDB) return null
  const db = await openDb()
  try {
    const record = (await run(db, 'readonly', (store) => store.get(RECORD_ID))) as
      | VaultRecord
      | undefined
    if (!record) return null
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: record.iv as unknown as BufferSource },
      record.key,
      record.data
    )
    const saved = JSON.parse(new TextDecoder().decode(plain)) as {
      email?: string
      password?: string
    }
    return saved.email === email && saved.password ? saved.password : null
  } catch {
    return null
  } finally {
    db.close()
  }
}

export async function clearRememberedLogin(): Promise<void> {
  if (!window.indexedDB) return
  const db = await openDb()
  try {
    await run(db, 'readwrite', (store) => store.delete(RECORD_ID))
  } finally {
    db.close()
  }
}
