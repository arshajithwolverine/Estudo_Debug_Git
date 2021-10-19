//Courses


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

let banner = express();
banner.use(cors({ origin: true }));
// banner.use(decodeIDToken);
banner.use(cold_start);

banner.post('/List', async (req, res) => {

    let homeflag = req.body.homepage;
    let type = req.body.type;
    let data = [];
    let temp = {};

    if (homeflag === true) {
        let ref = await db.collection('Banners').where('inside', '==', type).where('Active', '==', true).orderBy('Index').get();
        ref.forEach(doc => {
            temp = {
                "docid": doc.data().DocId,
                "type": doc.data().Type,
                "imageurl": doc.data().ImgUrl
            }
            data.push(temp);
        })
    } else {
        let ref = await db.collection('Banners').where('inside', '==', type).where('Active', '==', true).orderBy('Index').get();
        ref.forEach(doc => {
            temp = {
                "docid": doc.data().DocId,
                "type": doc.data().Type,
                "imageurl": doc.data().ImgUrl
            }
            data.push(temp);
        })
    }
    res.json(data);
})

banner.post('/IOSList', async (req, res) => {

    let homeflag = req.body.homepage;
    let type = req.body.type;
    let data = [];
    let temp = {};

    if (homeflag === true) {
        let ref = await db.collection('Banners_IOS').where('inside', '==', type).where('Active', '==', true).orderBy('Index').get();
        ref.forEach(doc => {
            temp = {
                "docid": doc.data().DocId,
                "type": doc.data().Type,
                "imageurl": doc.data().ImgUrl
            }
            data.push(temp);
        })
    } else {
        let ref = await db.collection('Banners_IOS').where('inside', '==', type).where('Active', '==', true).orderBy('Index').get();
        ref.forEach(doc => {
            temp = {
                "docid": doc.data().DocId,
                "type": doc.data().Type,
                "imageurl": doc.data().ImgUrl
            }
            data.push(temp);
        })
    }
    res.json(data);
})

exports.Banner = functions.https.onRequest(banner);




// link : https://console.firebase.google.com/v1/r/project/estudo-admin/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9lc3R1ZG8tYWRtaW4vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL0Jhbm5lcnMvaW5kZXhlcy9fEAEaCgoGQWN0aXZlEAEaCgoGaW5zaWRlEAEaCQoFSW5kZXgQARoMCghfX25hbWVfXxAB
