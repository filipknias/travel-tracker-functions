const admin = require("firebase-admin");

admin.initializeApp({
  storageBucket: "travel-tracker-fc10f.appspot.com",
});

const db = admin.firestore();
const storage = admin.storage();

module.exports = { admin, db, storage };
