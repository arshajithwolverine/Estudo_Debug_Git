//notifications


const functions = require('firebase-functions');

var admin = require("firebase-admin");

const db = admin.firestore();

//express portion
var express = require('express');
var cors = require('cors');

//token verifcation
async function decodeIDToken(req, res, next) {
    const idToken = req.body.token;
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log(decodedToken.uid);
        req.body.userid = decodedToken.uid;
        return next();
    } catch (err) {
        console.log(err);
        res.json({ "message": "token not verified", "error": err });
    }
    return console.log('Decode Completed');
}
function cold_start(req, res, next) {
    if (req.body.blahblah === "blahblah") {
        return res.json("coldstart")
    } else {
        next();
    }
}

let notification = express();
notification.use(cors({ origin: true }));
notification.use(cold_start);
// notification.use(decodeIDToken);

notification.post('/List', async (req, res) => {
    let notifications = await db.collection('Notification').orderBy('Index').limit(15).get();
    let data = [];
    let temp = {};
    notifications.forEach(notification => {
        temp = {
            "docid": notification.id,
            "name": notification.data().Name,
            "notification": notification.data().Notification
        }
        data.push(temp);
    });
    res.json(data);
})

notification.post('/WriteSeen', async (req, res) => {
    const Seen = await db.collection("Notification").orderBy("Order", "desc").limit(1).get();
    if (Seen.size > 0) {
        db.collection("Notification").doc(Seen.docs[0].id).collection("Seen").doc(req.body.userid).set({ "index": Date.now() })
            .then(snap => {
                return res.json(true);
            })
            .catch(err => {
                functions.logger.error(err);
                return res.status(300).json(false);
            })
    }
    else {
        return res.json(true);
    }
})



notification.post('/SeenOrUnseen', async (req, res) => {
    const userid = req.body.userid;
    const data = await db.collection('Notification').orderBy('Order', 'desc').limit(1).get();
    const seenData = await db.collection('Notification').doc(data.docs[0].id).collection('Seen').doc(userid).get();
    if (seenData.exists) {
        res.json(false);
    } else {
        res.json(true);
    }
})


exports.Notification = functions.https.onRequest(notification);