import admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT as string
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
