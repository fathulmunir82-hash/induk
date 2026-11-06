import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import configJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: configJson.apiKey,
  authDomain: configJson.authDomain,
  projectId: configJson.projectId,
  storageBucket: configJson.storageBucket,
  messagingSenderId: configJson.messagingSenderId,
  appId: configJson.appId,
  databaseId: configJson.firestoreDatabaseId || '(default)'
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app, configJson.firestoreDatabaseId || '(default)');
export const storage = getStorage(app);

export const SCHOOL_INFO = {
  nama: 'UPTD SDN RAJASINGA 2',
  npsn: '20215757',
  alamat: 'Desa Rajasinga, Kecamatan Terisi, Kabupaten Indramayu, Jawa Barat',
  desa: 'Rajasinga',
  kecamatan: 'Terisi',
  kabupaten: 'Indramayu',
  provinsi: 'Jawa Barat',
  operator: 'FATHUL MUNIR',
  kepalaSekolah: 'Dra. Hj. Siti Nurhayati, M.Pd.',
  nipKepalaSekolah: '19680512 199303 2 005'
};
