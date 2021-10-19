const functions = require('firebase-functions');
const admin = require("firebase-admin");

// admin.initializeApp();

const db = admin.firestore();


var express = require('express');
var cors = require('cors');

var app = express();
app.use(cors({ origin: true }));



app.use(decodeIDToken);

async function decodeIDToken(req, res, next) {
    functions.logger.log(req.body)

    if (req.body.blahblah === "blahblah") {
        return res.json("coldstart")
    }

    const idToken = req.body.token;

    try {
        //   const decodedToken = await admin.auth().verifyIdToken(idToken);
        //   functions.logger.log(decodedToken.uid);


        //   req.body.userid = decodedToken.uid;
        //   req.body.token = decodedToken.uid;
        req.body.token = req.body.userid;

        return next();
    } catch (err) {
        functions.logger.log(err);
        req.body.userid = "";
        return res.json({ "message": "token not verified", "error": err });
    }
}




app.post('/ViewNET', async (req, res) => {
    data = {}
    data.courses = [];
    data.mockTests = [];
    data.studyMaterials = [];
    db.collection("Users").doc(req.body.userid).collection("Mycourse").where("type", "==", "net").get()
        .then(just => {
            just.forEach(doc => {
                r = {};
                if (doc.data().category === "Mock_Test") {
                    r.docid = doc.data().courseid;
                    r.subjectname = doc.data().name;
                    r.price = doc.data().Price;
                    r.isenrolled = true;
                    data.mockTests.push(r);
                }
                else if (doc.data().category === "Study_Materials") {
                    r.docid = doc.data().courseid;
                    r.subjectname = doc.data().Name;
                    r.description = doc.data().details.join(" ");
                    r.price = doc.data().Price;
                    r.isenrolled = true;
                    data.studyMaterials.push(r);
                }
                else if (doc.data().category === "Courses") {
                    r.docid = doc.data().courseid;
                    r.name = doc.data().Name;
                    r.description = doc.data().Details.join(" ");
                    r.isenrolled = true;
                    data.courses.push(r)
                }
            })
            return res.json(data);
        })
        .catch(err => {
            res.status(400).json(false);
            return functions.logger.log(err);
        })
})


app.post('/ViewDegree', async (req, res) => {

    data = {}
    data.courses = [];
    data.mockTests = [];
    data.studyMaterials = [];
    db.collection("Users").doc(req.body.userid).collection("Mycourse").where("type", "==", "degree").get()
        .then(just => {
            let fordegreeids = [];
            just.forEach(doc => {
                r = {};
                if (doc.data().category === "Mock_Test") {
                    r.docid = doc.data().courseid;
                    r.subjectname = doc.data().name;
                    r.price = doc.data().Price;
                    r.isenrolled = true;
                    data.mockTests.push(r);
                }
                else if (doc.data().category === "Study_Materials") {
                    r.docid = doc.data().courseid;
                    r.subjectname = doc.data().Name;
                    r.description = doc.data().Details.join(" ");
                    r.price = doc.data().Price;
                    r.isenrolled = true;
                    data.studyMaterials.push(r);
                }
                else if (doc.data().category === "Courses") {
                    if (fordegreeids.indexOf(doc.data().courseid) === -1) {
                        fordegreeids.push(doc.data().courseid)
                        r.docid = doc.data().courseid;
                        r.name = doc.data().degreeecourse.Name;
                        r.description = doc.data().degreeecourse.details.join(" ");
                        r.subjects = [{
                            "docid": doc.data().courseid,
                            "subid": doc.data().subjectid,
                            "isenrolled": true,
                            "Mrp": doc.data().Price,
                            "subjectname": doc.data().name,
                            "subjectnumber": "Subject 1"

                        }]
                        data.courses.push(r)


                    }
                    else {
                        data.courses[fordegreeids.indexOf(doc.data().courseid)].subjects.push({
                            "docid": doc.data().courseid,
                            "subid": doc.data().subjectid,
                            "isenrolled": true,
                            "Mrp": doc.data().Price,
                            "subjectname": doc.data().name,
                            "subjectnumber": "Subject " + (data.courses[fordegreeids.indexOf(doc.data().courseid)].subjects.length + 1),

                        })//.push(r)
                    }

                }
            })
            return res.json(data);
        })
        .catch(err => {
            res.status(400).json(false);
            return functions.logger.log(err);
        })


})





app.post('/ViewCertificate', async (req, res) => {
    data = {}
    data.courses = [];
    data.mockTests = [];
    data.studyMaterials = [];
    db.collection("Users").doc(req.body.userid).collection("Mycourse").where("type", "==", "Skilled_Courses").get()
        .then(just => {
            just.forEach(doc => {
                r = {};
                if (doc.data().category === "Mock_Test") {
                    r.docid = doc.data().courseid;
                    r.subjectname = doc.data().name;
                    r.price = doc.data().Price;
                    r.isenrolled = true;
                    data.mockTests.push(r);
                }
                else if (doc.data().category === "Study_Materials") {
                    r.docid = doc.data().courseid;
                    r.subjectname = doc.data().Name;
                    r.description = doc.data().details.join(" ");
                    r.price = doc.data().Price;
                    r.isenrolled = true;
                    data.studyMaterials.push(r);
                }
                else if (doc.data().category === "Courses") {
                    r.docid = doc.data().courseid;
                    r.name = doc.data().Name;
                    r.description = doc.data().Details.join(" ");
                    r.isenrolled = true;
                    data.courses.push(r)
                }
            })
            return res.json(data);
        })
        .catch(err => {
            res.status(400).json(false);
            return functions.logger.log(err);
        })
})


app.post('/ViewLife', async (req, res) => {
    data = {}
    data.courses = [];
    data.mockTests = [];
    data.studyMaterials = [];
    db.collection("Users").doc(req.body.userid).collection("Mycourse").where("type", "==", "Courses").get()
        .then(just => {
            just.forEach(doc => {
                r = {};
                if (doc.data().category === "Mock_Test") {
                    r.docid = doc.data().courseid;
                    r.subjectname = doc.data().name;
                    r.price = doc.data().Price;
                    r.isenrolled = true;
                    data.mockTests.push(r);
                }
                else if (doc.data().category === "Study_Materials") {
                    r.docid = doc.data().courseid;
                    r.subjectname = doc.data().Name;
                    r.description = doc.data().details.join(" ");
                    r.price = doc.data().Price;
                    r.isenrolled = true;
                    data.studyMaterials.push(r);
                }
                else if (doc.data().category === "Courses") {
                    r.docid = doc.data().courseid;
                    r.name = doc.data().Name;
                    r.description = doc.data().Details.join(" ");
                    r.isenrolled = true;
                    data.courses.push(r)
                }
            })
            return res.json(data);
        })
        .catch(err => {
            res.status(400).json(false);
            return functions.logger.log(err);
        })
})





exports.mycourse = functions.https.onRequest(app);



// [
//     {
//         "docid": "USwDH3yiWCPWFY0S3gv1",
//         "image_url": "https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/Screenshot%20(106).png?alt=media",
//         "name": "BBA",
//         "description": "arshu"
//     },
//     {
//         "docid": "rnqKW6PqsyTF8zkdvjbp",
//         "image_url": "https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/Screenshot%20(106).png?alt=media",
//         "name": "test",
//         "description": "lalaa"
//     }
// ]




// [
//     {
//         "docid": "USwDH3yiWCPWFY0S3gv1",
//         "subid": "IEqpTJ4NSh9zLO1BEt0j",
//         "Mrp": 120,
//         "image_url": "https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/Screenshot%20(106).png?alt=media",
//         "subjectname": "Test ###",
//         "subjectnumber": "Subject 1"
//     },
//     {
//         "docid": "USwDH3yiWCPWFY0S3gv1",
//         "subid": "fYmEmsefXcwVigWnQWar",
//         "isenrolled": false,
//         "Mrp": 150,
//         "image_url": "https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/Screenshot%20(106).png?alt=media",
//         "subjectname": "Basic Numerical Skills",
//         "subjectnumber": "Subject 2"
//     }
// ]