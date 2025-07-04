import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import type { Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCHbsvc49is65GVOok7sNjRv-9tOoULyBQ',
  authDomain: 'ibibes-tracker.firebaseapp.com',
  projectId: 'ibibes-tracker',
  storageBucket: 'ibibes-tracker.firebasestorage.app',
  messagingSenderId: '759000525369',
  appId: '1:759000525369:web:f34c4596e3a4296d3f3be8',
  measurementId: 'G-SVS6EEL6MR',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Firestore & Storage instances
const db: Firestore = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence once (only before db is used)
enableIndexedDbPersistence(db).catch((err: unknown) => {
  if (err instanceof Error && 'code' in err) {
    const error = err as { code: string };
    if (error.code === 'failed-precondition') {
      console.warn('🔥 Persistence failed due to multiple open tabs.');
    } else if (error.code === 'unimplemented') {
      console.warn('🚫 This browser does not support IndexedDB persistence.');
    } else {
      console.error('❌ Unexpected Firestore persistence error:', error);
    }
  }
});

export { db, storage, auth, googleProvider };
