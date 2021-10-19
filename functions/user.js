//User


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

let user = express();
user.use(cors({ origin: true }));
user.use(cold_start);
// user.use(decodeIDToken);


user.post('/SignUp', async (req, res) => {
    let userid = req.body.userid;
    let name = req.body.name;
    let email = req.body.emailid;
    let phone = req.body.phonenumber;
    let referalid = req.body.referalid;
    let ref_userid;

    if (referalid === undefined || referalid === '') {
        ref_userid = '';
    } else {
        let ref_user = await db.collection('Users').where('Referal_Code', '==', referalid).get();
        ref_userid = ref_user.docs[0].id;
    }
    console.log(ref_userid);

    db.collection('Users').doc(userid).set({
        name: name,
        email: email,
        phonenumber: phone,
        Referal_Id: ref_userid
    }).then(doc => {
        return res.json({
            "message": "successful"
        });
    }).catch(error => {
        console.log(error);
        return res.json({
            "message": "failed"
        })
    });
})

user.post('/EditProfile', async (req, res) => {
    let userid = req.body.userid;
    let name = req.body.name;
    let emailid = req.body.emailid
    let phonenumber = req.body.phonenumber
    let dob = req.body.dob;
    let gender = req.body.gender;
    let location = req.body.location;

    db.collection('Users').doc(userid).update({
        name: name,
        email: emailid,
        phonenumber: phonenumber,
        dob: dob,
        gender: gender,
        location: location
    }).then(doc => {
        return res.json({ "message": "sucess" });
    }).catch(e => {
        res.json({ "message": "failed" });
    });
})


user.post('/ViewProfile', async (req, res) => {
    let userid = req.body.userid;
    let data = await db.collection('Users').doc(userid).get();
    let temp = {};

    temp.userid = userid
    temp.name = data.data().name;
    temp.emailid = data.data().email;
    if (data.data().dob === undefined) {
        temp.dob = "";
    } else {
        temp.dob = data.data().dob;
    }
    if (data.data().gender === undefined) {
        temp.gender = "";
    } else {
        temp.gender = data.data().gender;
    }
    if (data.data().location === undefined) {
        temp.location = "";
    } else {
        temp.location = data.data().location;
    }
    if (data.data().phonenumber === undefined) {
        temp.phonenumber = "";
    } else {
        temp.phonenumber = data.data().phonenumber;
    }

    res.json(temp);
})

user.post('/Register', async (req, res) => {
    const userid = req.body.userid;
    const user_data = await db.collection('Users').doc(userid).get();
    if (user_data.data().name === undefined && user_data.data().email === undefined) {
        res.json(false);
    } else {
        res.json(true);
    }

})


exports.User = functions.https.onRequest(user);