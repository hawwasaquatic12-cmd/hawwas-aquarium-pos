Hawwas Aquarium — POS (Firebase-ready)

Isi paket:
- package.json
- index.html
- src/
  - main.jsx
  - App.jsx
  - PosApp.jsx
  - PosIkan.jsx
  - firebaseConfig.js (placeholder)
  - styles.css

Langkah menjalankan lokal:
1. Ekstrak folder.
2. Jalankan: `npm install`
3. Jalankan dev server: `npm run dev`
4. Buka alamat yang tampil (mis. http://localhost:5173)

Menambahkan Firebase (multi-user & cloud):
1. Buka https://console.firebase.google.com, buat project baru (mis. hawwas-aquarium)
2. Aktifkan Authentication → Sign-in method → Email/Password
3. Aktifkan Firestore Database (Start in test mode sementara)
4. Di Project Settings -> Add app -> Web app -> Salin konfigurasi firebaseConfig
5. Ganti file `src/firebaseConfig.js` dengan data Anda (isi nilai yang REPLACE)
6. Deploy ke Vercel (lihat langkah di chat sebelumnya) atau jalankan lokal

Catatan:
- Versi ini bekerja offline (localStorage) jika Firebase belum disetup.
- Untuk cetak struk ke printer thermal lewat Bluetooth/USB, gunakan fitur print dari browser saat jendela struk muncul atau minta saya tambahkan integrasi ESC/POS library.

Kontak: Hawwas Aquarium - 082282147465
