const functions = require("firebase-functions");

var admin = require("firebase-admin");

const db = admin.firestore();

let express = require('express');
let cors = require('cors');
const { waitForTick } = require("pdf-lib");

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


//mock test
let mock = express();
mock.use(cors({ origin: true }));
mock.use(cold_start);
// mock.use(decodeIDToken);

// mock.post('/List', async (req, res) => {
//     let type = String(req.body.type);
//     let ref = await db.collection('Mock_Test').where('type', '==', type).get();

//     let data = [];
//     let temp = {};
//     let promises = [];
//     let id = [];
//     if (type === 'net') {
//         ref.forEach(doc => {
//             promises.push(db.collection("Net").doc(doc.data().Paper_Id).get());
//             id.push(ref.id)
//         })
//         await Promise.all(promises).then(net => {
//             let index = 0;
//             net.forEach((element) => {
//                 let l = element.data().Details.length;
//                 let descrip = '';
//                 if (l > 1) {
//                     descrip = element.data().Details[0] + ' and ' + element.data().Details[1];
//                 } else if (l === 1) {
//                     descrip = element.data().Details[0];
//                 }
//                 temp = {
//                     'docid': element.id,
//                     'subjectname': element.data().Name,
//                     'description': descrip,
//                     'isenrolled': false
//                 }
//                 console.log(temp)
//                 index += 1;
//                 data.push(temp)
//             });
//             return console.log("Yss");
//         }).catch(e => console.log(e));
//     } else if (type === 'degree_course') {
//         ref.forEach(doc => {
//             promises.push(db.collection("Degree_Courses").doc(doc.data().Paper_Id).get());
//             id.push(ref.id)
//         })
//         await Promise.all(promises).then(net => {
//             let index = 0;
//             net.forEach((element) => {
//                 let l = element.data().details.length;
//                 let descrip = '';
//                 if (l > 1) {
//                     descrip = element.data().details[0] + ' and ' + element.data().details[1];
//                 } else if (l === 1) {
//                     descrip = element.data().details[0];
//                 }
//                 temp = {
//                     'docid': element.id,
//                     'subjectname': element.data().Name,
//                     'description': descrip,
//                     'isenrolled': false
//                 }
//                 console.log(temp)
//                 index += 1;
//                 data.push(temp)
//             });
//             return console.log("Yss");
//         }).catch(e => console.log(e));
//     } else if (type === 'Skilled_Courses') {
//         ref.forEach(doc => {
//             promises.push(db.collection("Skilled_Courses").doc(doc.data().Paper_Id).get());
//             id.push(ref.id)
//         })
//         await Promise.all(promises).then(net => {
//             let index = 0;
//             net.forEach((element) => {
//                 let l = element.data().Details.length;
//                 let descrip = '';
//                 if (l > 1) {
//                     descrip = element.data().Details[0] + ' and ' + element.data().Details[1];
//                 } else if (l === 1) {
//                     descrip = element.data().Details[0];
//                 }
//                 temp = {
//                     'docid': element.id,
//                     'subjectname': element.data().Name,
//                     'description': descrip,
//                     'isenrolled': false
//                 }
//                 console.log(temp)
//                 index += 1;
//                 data.push(temp)
//             });
//             return console.log("Yss");
//         }).catch(e => console.log(e));
//     } else if (type === 'Courses') {
//         ref.forEach(doc => {
//             promises.push(db.collection("Courses").doc(doc.data().Paper_Id).get());
//             id.push(ref.id)
//         })
//         await Promise.all(promises).then(net => {
//             let index = 0;
//             net.forEach((element) => {
//                 let l = element.data().Details.length;
//                 let descrip = '';
//                 if (l > 1) {
//                     descrip = element.data().Details[0] + ' and ' + element.data().Details[1];
//                 } else if (l === 1) {
//                     descrip = element.data().Details[0];
//                 }
//                 temp = {
//                     'docid': element.id,
//                     'subjectname': element.data().Name,
//                     'description': descrip,
//                     'isenrolled': false
//                 }
//                 console.log(temp)
//                 index += 1;
//                 data.push(temp)
//             });
//             return console.log("Yss");
//         }).catch(e => console.log(e));
//     }


//     res.json(data);
// })

mock.post('/List', async (req, res) => {
    let type = String(req.body.type);
    let ref = await db.collection('Mock_Test').where('type', '==', type).get();
    let promises1 = [];
    let promise2 = [];
    ref.forEach(element => {
        promises1.push(db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(element.id).get());
        promise2.push(db.collection('Users').doc(req.body.userid).collection('Cart').where('type', '==', type).where('courseid', '==', element.id).get())
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

    let demo_promise = [];
    ref.forEach((element) => {
        demo_promise.push(db.collection('Mock_Test').doc(element.id).collection('Tests').where('demo', '==', true).where('mock_active', '==', true).get());
        temp = {
            'docid': element.id,
            'subjectname': element.data().name,
            'price': element.data().Price,
            'isenrolled': enrolled[count],
            'isdemo': false
        }
        console.log(temp)
        data.push(temp);
        count += 1;
    });

    //incart
    let cart_datas = await Promise.all(promise2);
    let i = 0;
    cart_datas.forEach(datas => {
        if (datas.docs[0] !== undefined) {
            data[i].incart = true;
        } else {
            data[i].incart = false;
        }
        i += 1;
    })

    const Demo_res = await Promise.all(demo_promise);
    let push_offset = 1;
    Demo_res.forEach((doc, index) => {
        if (doc.docs[0] !== undefined) {
            temp = {
                'docid': data[index + push_offset - 1].docid,
                'subjectname': data[index + push_offset - 1].subjectname,
                'price': data[index + push_offset - 1].price,
                'isenrolled': data[index + push_offset - 1].isenrolled,
                'incart': false,
                'isdemo': true
            }
            data.splice(index + push_offset, 0, temp);
            push_offset += 1;
        }
    })

    // let push_offset = 1;
    // for (j = 0; j < data.length; j++) {
    //     console.log(data[j].docid)
    //     const demo = await db.collection('Mock_Test').doc(data[j].docid).collection('Tests').where('demo', '==', true).where('mock_active', '==', true).get();
    //     if (demo.docs[0].data() !== undefined) {
    //         temp = {
    //             'docid': data[j].id,
    //             'subjectname': data[j].name,
    //             'price': data[j].Price,
    //             'isenrolled': data[j].isenrolled,
    //             'ismock': true
    //         }
    //         data.splice(j + push_offset, 0, temp);
    //         push_offset += 1;
    //     }
    // }

    res.json(data);
})


mock.post('/ViewInfo', async (req, res) => {
    let paper = await db.collection('Mock_Test').doc(req.body.docid).get();
    let type = req.body.type;
    if (type === 'net') {
        let ref = await db.collection('Net').doc(paper.data().Paper_Id).get();
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
        let ref = await db.collection('Degree_Courses').doc(paper.data().Paper_Id).get();
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
        let ref = await db.collection('Skilled_Courses').doc(paper.data().Paper_Id).get();
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
        let ref = await db.collection('Courses').doc(paper.data().Paper_Id).get();
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

mock.post('/ViewNote', async (req, res) => {
    // let ref1 = await db.collection('Mock_Test').where('Paper_Id', '==', req.body.docid).get();
    // let id = ref1.docs[0].id;
    // console.log(id)
    let ref;
    if (req.body.isdemo) {
        ref = await db.collection('Mock_Test').doc(req.body.docid).collection('Tests').where('demo', '==', true).where('mock_active', '==', true).orderBy('index').get();
    } else {
        ref = await db.collection('Mock_Test').doc(req.body.docid).collection('Tests').where('demo', '==', false).where('mock_active', '==', true).orderBy('index').get();
    }
    let data = [];
    let temp = {};

    ref.forEach(note => {
        temp = {
            "mockid": req.body.docid,
            "testid": note.id,
            "notename": note.data().name
        }
        console.log(temp)
        data.push(temp);
    })
    res.json(data);
})

mock.post('/ViewMock', async (req, res) => {
    let data = [];
    let sub = await db.collection('Mock_Test').doc(req.body.mockid).collection('Tests').doc(req.body.testid).get();
    let exam = sub.data().Exam;
    let temp = {};
    let range = 0;
    let para = '';
    let ParaImgUrl = '';
    exam.forEach(que => {
        if (que.Type === 'Question') {
            if (range === 0) {
                temp = {
                    'Paragraph': '',
                    'ParaImgUrl': '',
                    'ImgUrl': que.ImgUrl,
                    'Question': que.Data,
                    'Options': shuffle(que.Options),
                    'Answer': que.Answer
                }
            } else {
                temp = {
                    'Paragraph': para,
                    'ParaImgUrl': ParaImgUrl,
                    'ImgUrl': que.ImgUrl,
                    'Question': que.Data,
                    'Options': shuffle(que.Options),
                    'Answer': que.Answer
                }
                range -= 1;
            }
            data.push(temp);
        } else if (que.Type === 'Paragrah') {
            range = que.Range;
            para = que.Data;
            ParaImgUrl = que.ImgUrl;
        }
    })
    // let List_send = {
    //     "ListOfQuiz": {
    //         "Data": data
    //     }
    // }
    res.json(data);
})

exports.MockTest = functions.https.onRequest(mock)

//link : https://console.firebase.google.com/v1/r/project/estudo-admin/firestore/indexes?create_composite=Ckpwcm9qZWN0cy9lc3R1ZG8tYWRtaW4vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL1Rlc3RzL2luZGV4ZXMvXxABGg8KC21vY2tfYWN0aXZlEAEaCQoFaW5kZXgQARoMCghfX25hbWVfXxAB

// associated supporting functions
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}