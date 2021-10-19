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

//previous year que papers
let que = express();
que.use(cors({ origin: true }));
que.use(cold_start);
// que.use(decodeIDToken);

que.post('/List', async (req, res) => {
    let type = String(req.body.type);
    let ref = await db.collection('Previous_Year').where('type', '==', type).get();
    let promises1 = [];
    ref.forEach(element => {
        promises1.push(db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(element.id).get());
    });
    let mycourses = await Promise.all(promises1);
    let enrolled = [];
    mycourses.forEach(element => {
        if (element.data() === undefined) {
            enrolled.push(false);
        } else {
            enrolled.push(true);
        }
    });
    let count = 0;
    let data = [];
    let temp = {};
    let promises = [];
    if (type === 'net') {
        ref.forEach(doc => {
            promises.push(db.collection("Net").doc(doc.id).get());
        })
        let net = await Promise.all(promises);
        net.forEach((element) => {
            let l = element.data().Details.length;
            let descrip = '';
            if (l > 1) {
                descrip = element.data().Details[0] + ' and ' + element.data().Details[1];
            } else if (l === 1) {
                descrip = element.data().Details[0];
            }
            temp = {
                'docid': element.id,
                'subjectname': element.data().Name,
                'description': descrip,
                'isenrolled': enrolled[count]
            }
            data.push(temp);
            count += 1;
        });

    } else if (type === 'degree_course') {
        ref.forEach(doc => {
            promises.push(db.collection("Degree_Courses").doc(doc.id).get());
        })
        let net = await Promise.all(promises);
        net.forEach((element) => {
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
                'isenrolled': enrolled[count]
            }
            data.push(temp);
            count += 1;
        });

    } else if (type === 'Skilled_Courses') {
        ref.forEach(doc => {
            promises.push(db.collection("Skilled_Courses").doc(doc.id).get());
        })
        let net = await Promise.all(promises);
        net.forEach((element) => {
            let l = element.data().Details.length;
            let descrip = '';
            if (l > 1) {
                descrip = element.data().Details[0] + ' and ' + element.data().Details[1];
            } else if (l === 1) {
                descrip = element.data().Details[0];
            }
            temp = {
                'docid': element.id,
                'subjectname': element.data().Name,
                'description': descrip,
                'isenrolled': enrolled[count]
            }
            data.push(temp);
            count += 1;
        });
    } else if (type === 'Courses') {
        ref.forEach(doc => {
            promises.push(db.collection("Courses").doc(doc.id).get());
        })
        let net = await Promise.all(promises);
        net.forEach((element) => {
            let l = element.data().Details.length;
            let descrip = '';
            if (l > 1) {
                descrip = element.data().Details[0] + ' and ' + element.data().Details[1];
            } else if (l === 1) {
                descrip = element.data().Details[0];
            }
            temp = {
                'docid': element.id,
                'subjectname': element.data().Name,
                'description': descrip,
                'isenrolled': enrolled[count]
            }
            data.push(temp);
            count += 1;
        });
    }

    res.json(data);
})

que.post('/ViewInfo', async (req, res) => {
    let type = req.body.type;
    if (type === 'net') {
        let ref = await db.collection('Net').doc(req.body.docid).get();
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
    } else if (type === 'degree_course') {
        let ref = await db.collection('Degree_Courses').doc(req.body.docid).get();
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
    } else if (type === 'Skilled_Courses') {
        let ref = await db.collection('Skilled_Courses').doc(req.body.docid).get();
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
    } else if (type === 'Courses') {
        let ref = await db.collection('Courses').doc(req.body.docid).get();
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
    }
})

que.post('/ViewNote', async (req, res) => {
    let ref = await db.collection('Previous_Year').doc(req.body.docid).collection('Question').where('active', '==', true).orderBy('index').get();
    let data = [];
    let temp = {};

    ref.forEach(note => {
        temp = {
            "notename": note.data().Subjects[0].Name,
            "link": note.data().Subjects[0].PdfUrl
        }
        data.push(temp);
    })
    res.json(data);
})

exports.PreviousYear = functions.https.onRequest(que);

//link : https://console.firebase.google.com/v1/r/project/estudo-admin/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9lc3R1ZG8tYWRtaW4vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL1F1ZXN0aW9uL2luZGV4ZXMvXxABGgoKBmFjdGl2ZRABGgkKBWluZGV4EAEaDAoIX19uYW1lX18QAQ
