import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./firebase-service-account.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "stall_qr",
});

const db = admin.firestore();
const bucket = admin.storage().bucket("stall_qr");

export { db, bucket };
