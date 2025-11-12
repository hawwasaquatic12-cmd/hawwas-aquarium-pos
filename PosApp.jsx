import React, { useState, useEffect } from 'react';
import PosIkan from './PosIkan';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn('Firebase not initialized - running in local mode', e);
}

export default function PosApp(){
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('local');
  useEffect(()=>{
    if (auth) {
      setMode('firebase');
      onAuthStateChanged(auth, u => setUser(u));
    } else {
      setMode('local');
    }
  },[]);

  return (
    <div>
      <div className='pos-container'>
        <div className='pos-left'><h2>Kasir</h2></div>
        <div className='pos-right'><PosIkan mode={mode} userEmail={user?.email} /></div>
      </div>
      <div className='footer-note'>Mode: {mode} — Untuk online ganti src/firebaseConfig.js dengan konfigurasi Firebase Anda.</div>
    </div>
  )
}
