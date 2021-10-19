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


let net = express();
net.use(cors({ origin: true }));
net.use(cold_start);
// net.use(decodeIDToken);

net.post('/List', async (req, res) => {
    let data = [];
    let net_data = await db.collection('Net').where('Active', '==', true).orderBy('Index').get();
    let temp = {};
    net_data.forEach(net => {
        temp = {
            "docid": net.id,
            "image_url": "https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/Screenshot%20(106).png?alt=media",
            "name": net.data().Name,
            "description": net.data().Details[0]
        };
        data.push(temp);
    });
    res.json(data);
});

net.post('/View', async (req, res) => {
    let userid = req.body.userid;
    let net = await db.collection('Net').doc(req.body.docid).get();
    let cart = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'net').where('courseid', '==', req.body.docid).get();

    let enrolled;
    let mycourse = await db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(req.body.docid).get();
    console.log(mycourse.data())
    if (mycourse.data() === undefined) {
        enrolled = false;
    } else {
        enrolled = true;
    }
    let descr = net.data().Details;
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
    let temp = {
        "docid": net.id,
        "isenrolled": enrolled,
        "Mrp": net.data().Price,
        "CourseDescription": arr
    };

    if (cart.docs[0] !== undefined) {
        temp.incart = true;
    } else {
        temp.incart = false;
    }
    res.json(temp);
});


net.post('/SubList', async (req, res) => {
    let data = [];
    let sub_data = await db.collection('Net').doc(req.body.docid).collection('Subject').where('active', '==', true).orderBy('index').get();
    let temp = {};
    let count = 1;
    let enrolled;
    let mycourse = await db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(req.body.docid).get();
    console.log(mycourse.data())
    if (mycourse.data() === undefined) {
        enrolled = false;
    } else {
        enrolled = true;
    }
    sub_data.forEach((sub) => {
        temp = {
            "docid": req.body.docid,
            "subid": sub.id,
            "isenrolled": enrolled,
            "image_url": "https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/Screenshot%20(106).png?alt=media",
            "subjectname": sub.data().name,
            "subjectnumber": "Subject " + `${count}`
        }
        data.push(temp);
        count += 1;
    });
    res.json(data);
});

net.post('/SubView', async (req, res) => {
    let data = [];
    let sub_data = await db.collection('Net').doc(req.body.docid).collection('Subject').doc(req.body.subid).collection('Topic').where('active', '==', true).orderBy('index').get();
    let promises = [];
    sub_data.forEach(element => {
        promises.push(db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(req.body.docid).collection('Viewed_Topics').doc(element.id).get());
    });
    let lock = await Promise.all(promises);
    let lock_array = [];
    let progress_array = [];
    lock.forEach(element => {
        if (element.data() === undefined) {
            lock_array.push(false);
            progress_array.push(0);
        } else {
            lock_array.push(true);
            if (element.data().progress !== undefined) {
                progress_array.push(element.data().progress);
            } else {
                progress_array.push(0);
            }
        }
    });
    let temp = {};
    let count = 1;
    sub_data.forEach((sub) => {
        temp = {
            "docid": req.body.docid,
            "subid": req.body.subid,
            "topicid": sub.id,
            "image_url": sub.data().ImgUrl,
            "video_url": sub.data().VideoUrl,
            "chaptername": sub.data().TopicName,
            "chapternumber": "Chapter " + `${count}`,
            "progress": progress_array[count - 1]
        }
        data.push(temp);
        count += 1;
    });
    res.json(data);
})


net.post('/TopicView', async (req, res) => {

    let sub = await db.collection('Net').doc(req.body.docid).collection('Subject').doc(req.body.subid).collection('Topic').doc(req.body.topicid).get();
    let mycourse = await db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(req.body.docid).collection('Viewed_Topics').doc(req.body.topicid).get();
    let current_position = '00:00:00';
    if (mycourse.data() !== undefined) {
        if (mycourse.data().current_position !== undefined) {
            current_position = mycourse.data().current_position;
        }
    }
    let data = {
        "docid": req.body.docid,
        "subid": req.body.subid,
        "topicid": req.body.topicid,
        'VideoUrl': sub.data().VideoUrl,
        'quizavailable': sub.data().mock_active,
        'Video': [],
        'current_position': current_position
    };

    let units = sub.data().Units;
    let unit_array = [];
    let temp = {};
    let num = 1;
    units.forEach(unit => {
        if (unit.type === 'Unit') {
            const arr = unit.UnitTime.split(':');
            const seconds = (Number(arr[0]) * 3600) + (Number(arr[1]) * 60) + Number(arr[2]);
            temp = {
                "UnitName": unit.UnitName,
                "UnitSeeker": seconds,
                "Number": num,
                "Type": unit.type
            }
        } else if (unit.type === 'Note') {
            temp = {
                "UnitName": unit.UnitName,
                "UnitSeeker": unit.PdfUrl,
                "Number": num,
                "Type": unit.type
            }
        }
        unit_array.push(temp);
        num += 1;
    })
    data.Video = unit_array;
    res.json(data);
})

net.post('/VideoProgress', async (req, res) => {
    const total_length = req.body.total_length;
    const current_position = req.body.current_position;
    let progress = (Number(current_position) / Number(total_length)) * 100;
    if (progress === NaN) {
        progress = 0;
    } console.log(progress);


    db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(req.body.docid).collection('Viewed_Topics').doc(req.body.topicid).set({
        total_length: total_length,
        current_position: current_position,
        progress: progress,
        viewed: true
    }, { merge: true }).then(() => {
        return res.json({ "message": "sucess" });
    }).catch(e => {
        res.json({ "message": "failed" });
    });
})


net.post('/TopicMock', async (req, res) => {
    let data = [];
    let sub = await db.collection('Net').doc(req.body.docid).collection('Subject').doc(req.body.subid).collection('Topic').doc(req.body.topicid).get();
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


net.post('/PreviewList', async (req, res) => {
    let data = [];
    let sub_data = await db.collection('Net').doc(req.body.docid).collection('Preview').where('active', '==', true).orderBy('index').get();
    let temp = {};
    let count = 1;
    sub_data.forEach((sub) => {
        temp = {
            "docid": req.body.docid,
            "previewid": sub.id,
            "image_url": sub.data().ImgUrl,
            "video_url": sub.data().videourl,
            "chaptername": sub.data().topic,
            // "chapternumber": "Chapter " + `${count}`
        }
        data.push(temp);
        count += 1;
    });
    res.json(data);
})


net.post('/PreviewView', async (req, res) => {

    let sub = await db.collection('Net').doc(req.body.docid).collection('Preview').doc(req.body.previewid).get();
    let data = {
        "docid": req.body.docid,
        "previewid": req.body.previewid,
        'VideoUrl': sub.data().videourl,
    };
    let units = sub.data().Units;
    let unit_array = [];
    let temp = {};
    let num = 1;
    units.forEach(unit => {
        if (unit.type === 'Unit') {
            const arr = unit.UnitTime.split(':');
            const seconds = (Number(arr[0]) * 3600) + (Number(arr[1]) * 60) + Number(arr[2]);
            temp = {
                "UnitName": unit.UnitName,
                "UnitSeeker": seconds,
                "Number": num,
                "Type": unit.type
            }
        } else if (unit.type === 'Note') {
            temp = {
                "UnitName": unit.UnitName,
                "UnitSeeker": unit.PdfUrl,
                "Number": num,
                "Type": unit.type
            }
        }
        unit_array.push(temp);
        num += 1;
    })
    data.Video = unit_array;
    res.json(data);
})


exports.Net = functions.https.onRequest(net);





// link : https://console.firebase.google.com/v1/r/project/estudo-admin/firestore/indexes?create_composite=Ckhwcm9qZWN0cy9lc3R1ZG8tYWRtaW4vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL05ldC9pbmRleGVzL18QARoKCgZBY3RpdmUQARoJCgVJbmRleBABGgwKCF9fbmFtZV9fEAE
// link : https://console.firebase.google.com/v1/r/project/estudo-admin/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9lc3R1ZG8tYWRtaW4vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL1N1YmplY3QvaW5kZXhlcy9fEAEaCgoGYWN0aXZlEAEaCQoFaW5kZXgQARoMCghfX25hbWVfXxAB
// link : https://console.firebase.google.com/v1/r/project/estudo-admin/firestore/indexes?create_composite=Ckpwcm9qZWN0cy9lc3R1ZG8tYWRtaW4vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL1RvcGljL2luZGV4ZXMvXxABGgoKBmFjdGl2ZRABGgkKBWluZGV4EAEaDAoIX19uYW1lX18QAQ
// link : https://console.firebase.google.com/v1/r/project/estudo-admin/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9lc3R1ZG8tYWRtaW4vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL1ByZXZpZXcvaW5kZXhlcy9fEAEaCgoGYWN0aXZlEAEaCQoFaW5kZXgQARoMCghfX25hbWVfXxAB

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