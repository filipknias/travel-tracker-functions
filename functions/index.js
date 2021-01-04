const functions = require("firebase-functions");
const { admin, db, storage } = require("./admin");

// Cloud Functions
exports.onPlaceDelete = functions.firestore
  .document("places/{id}")
  .onDelete(async (snapshot) => {
    snapshot.data().photos.forEach(async (photo) => {
      await storage.bucket().file(photo.fileName).delete();
    });
    storage.bucket().upload;
    const query = db.collection("ratings").where("placeId", "==", snapshot.id);
    const docs = await query.get();
    docs.forEach(async (doc) => {
      await db.doc(`/ratings/${doc.id}`).delete();
    });
  });

exports.onRatingAdd = functions.firestore
  .document("ratings/{id}")
  .onCreate(async (snapshot) => {
    const placeDoc = db.collection("places").doc(snapshot.data().placeId);
    const ratingAvg = await calculateRatingAvg(snapshot.data().placeId);

    await placeDoc.update({
      commentCount: admin.firestore.FieldValue.increment(1),
      ratingAvg,
    });
  });

exports.onRatingDelete = functions.firestore
  .document("ratings/{id}")
  .onDelete(async (snapshot) => {
    const placeDoc = db.collection("places").doc(snapshot.data().placeId);
    const ratingAvg = await calculateRatingAvg(snapshot.data().placeId);

    await placeDoc.update({
      commentCount: admin.firestore.FieldValue.increment(-1),
      ratingAvg,
    });
  });

const calculateRatingAvg = async (placeId) => {
  const query = db.collection("ratings").where("placeId", "==", placeId);
  const docs = await query.get();

  const ratings = [];
  docs.forEach((doc) => {
    ratings.push(doc.data());
  });

  const ratingsSum = ratings.reduce((total, value) => {
    return total + value.rate;
  }, 0);
  const ratingAvg = ratingsSum / ratings.length;

  return ratingAvg;
};
