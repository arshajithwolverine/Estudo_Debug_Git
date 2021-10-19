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

let cert = express();
cert.use(cors({ origin: true }));
// cert.use(decodeIDToken);


cert.post('/View', async (req, res) => {
    let userid = req.body.userid;
    let courseid = req.body.courseid;

    let my_course = await db.collection('Users').doc(userid).collection('Mycourse').doc(courseid).get();
    let certurl = my_course.data().CertificateUrl;
    if (certurl !== undefined) {
        return res.json({
            'message': 'success',
            'CertUrl': certurl
        })
    } else {
        return res.json({
            'message': 'Certificate not issued yet!',
            'CertUrl': ''
        })
    }

})

cert.post('/List', async (req, res) => {
    let userid = req.body.userid;
    let my_course = await db.collection('Users').doc(userid).collection('Mycourse').where('HasCert', '==', true).get();

    let data = [];
    // let promises = [];
    my_course.forEach(course => {
        // promises.push(db.collection(`${course.data().type}`).doc(course.id).get());
        let temp = {
            'CertUrl': course.data().CertificateUrl,
            'Name': course.data().Name,
            'Details': `Certificate Issued on ${course.data().CertIssuedDate} `
        }
        data.push(temp);
    });

    // let course_data = await Promise.all(promises);
    // let count = 0;
    // course_data.forEach(course => {
    //     data[count].Name = course.data().Name;

    //     count += 1;
    // })

    res.json(data);

})


exports.Certificate = functions.https.onRequest(cert);