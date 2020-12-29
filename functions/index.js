const functions = require("firebase-functions");
const { db, storage } = require("./admin");

// TODO: Think about REST API on cloud functions and only db snapshots on client

exports.onPlaceDelete = functions.firestore
  .document("places/{id}")
  .onDelete(async (snapshot) => {
    snapshot.data().photos.forEach(async (photo) => {
      await storage.bucket().file(photo.fileName).delete();
    });

    const query = db.collection("ratings").where("placeId", "==", snapshot.id);
    const docs = await query.get();
    docs.forEach(async (doc) => {
      await db.doc(`/ratings/${doc.id}`).delete();
    });
  });
