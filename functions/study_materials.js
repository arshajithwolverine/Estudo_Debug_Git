const functions = require("firebase-functions");

var admin = require("firebase-admin");

const db = admin.firestore();

let express = require('express');
let cors = require('cors');

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

//common api's
let study = express();
study.use(cors({ origin: true }));
study.use(cold_start);
// study.use(decodeIDToken);

study.post('/List', async (req, res) => {
    let type = String(req.body.type);
    let ref = await db.collection('Study_Materials').where('type', '==', type).orderBy('index').get();
    let data = [];
    let temp = {};
    let promises = [];
    let promises2 = [];
    ref.forEach(element => {
        promises.push(db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(element.id).get());
        promises2.push(db.collection('Users').doc(req.body.userid).collection('Cart').where('type', '==', type).where('courseid', '==', element.id).get());
    });
    let mycourses = await Promise.all(promises);
    let enrolled = [];
    mycourses.forEach(element => {
        if (element.data() === undefined) {
            enrolled.push(false);
        } else {
            enrolled.push(true);
        }
    });
    let count = 0;
    ref.forEach(element => {
        let l = element.data().details.length;
        let descrip = '';
        if (l > 1) {
            descrip = element.data().details[0] + ' and ' + element.data().details[1];
        } else if (l === 1) {
            descrip = element.data().details[0];
        }
        temp = {
            'docid': element.id,
            'subjectname': element.data().Name,
            'description': descrip,
            'isenrolled': enrolled[count],
            'price': element.data().Price
        }
        data.push(temp);
        count += 1;
    });

    let i = 0;
    let cart_datas = await Promise.all(promises2);
    cart_datas.forEach(datas => {
        if (datas.docs[0] !== undefined) {
            data[i].incart = true;
        } else {
            data[i].incart = false;
        }
        i += 1;
    })
    res.json(data);
})

study.post('/ViewInfo', async (req, res) => {
    let ref = await db.collection('Study_Materials').doc(req.body.docid).get();
    let descr = ref.data().Details;
    let temp1 = { heading: '', points: [] };
    let flag = 0;
    let arr = [];
    descr.forEach(info => {
        if (info.includes('*')) {
            if (flag != 0) {
                arr.push(temp1);
                temp1 = { heading: '', points: [] };
            }
            temp1.heading = info.split('*')[1];
        } else {
            temp1.points.push(info);
            if (flag === descr.length - 1) {
                arr.push(temp1);
                temp1 = { heading: '', points: [] };
            }
        }
        flag += 1;
    })
    let data = {
        'CourseDescription': arr
    }
    res.json(data);
})

study.post('/ViewNote', async (req, res) => {
    let ref = await db.collection('Study_Materials').doc(req.body.docid).get();
    let data = [];
    let temp = {};
    ref.data().Subjects.forEach(note => {
        temp = {
            "notename": note.Name,
            "link": note.PdfUrl
        }
        data.push(temp);
    })
    res.json(data);
})

exports.StudyMaterial = functions.https.onRequest(study);