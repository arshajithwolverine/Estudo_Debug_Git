//Skilled Courses


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

let skilled = express();
skilled.use(cors({ origin: true }));
skilled.use(cold_start);
// skilled.use(decodeIDToken);


skilled.post('/List', async (req, res) => {
    let userid = req.body.userid;
    let data = [];
    let net_data = await db.collection('Skilled_Courses').where('Active', '==', true).orderBy('Index').get();
    let temp = {};

    let all_degree_topics = [];
    let promises = [];

    net_data.forEach(degree => {
        all_degree_topics.push(db.collection('Skilled_Courses').doc(degree.id).collection('Topic').get());
        promises.push(db.collection('Users').doc(userid).collection('Mycourse').doc(degree.id).collection('Viewed_Topics').get());
        temp = {
            "docid": degree.id,
            "image_url": "https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/Screenshot%20(106).png?alt=media",
            "name": degree.data().Name,
            "description": degree.data().Details[0]
        };
        data.push(temp);
    });
    let all_degree = await Promise.all(all_degree_topics);
    let viewed = await Promise.all(promises);
    let view_array = [];
    let count = 0;
    viewed.forEach(topics => {
        if (topics.docs[0] !== undefined) {
            let temp = [];
            for (i = 0; i < topics.docs.length; i++) {
                temp.push(topics.docs[i].id);
            }
            view_array.push(temp);
        } else {
            view_array.push(false);
        }
        count += 1;
    })
    count = 0;
    all_degree.forEach(topics => {
        if (view_array[count] !== false) {
            let temp = [];
            for (i = 0; i < topics.docs.length; i++) {
                temp.push(topics.docs[i].id);
            }
            let isfinished = true;
            for (i = 0; i < temp.length; i++) {
                if (!view_array[count].includes(temp[i])) {
                    isfinished = false;
                }
            }
            view_array[count] = isfinished;
        }
        count += 1;
    })
    count = 0;
    data.forEach(doc => {
        data[count].isfinished = view_array[count];
    })


    res.json(data);
});

skilled.post('/View', async (req, res) => {
    let net = await db.collection('Skilled_Courses').doc(req.body.docid).get();
    let mycourses = await db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(req.body.docid).get();
    let cart = await db.collection('Users').doc(req.body.userid).collection('Cart').where('type', '==', 'Skilled_Courses').where('courseid', '==', req.body.docid).get();




    // let descrp = [];
    // for (i = 0; i < 5; i++) {
    //     descrp.push("Description Pending");
    // }
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
        "Mrp": net.data().Price,
        "CourseDescription": arr
    };
    if (mycourses.data() !== undefined) {
        temp.isenrolled = true;
        let skilled_topics = await db.collection('Skilled_Courses').doc(req.body.docid).collection('Topic').get();
        let viewed_topics = await db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(req.body.docid).collection('Viewed_Topics').get();
        let skilled_topic_ids = [];
        let viewed_topic_ids = [];
        skilled_topics.forEach(topic => {
            skilled_topic_ids.push(topic.id);
        });
        viewed_topics.forEach(topic => {
            viewed_topic_ids.push(topic.id);
        })
        let isfinished = true;
        for (i = 0; i < skilled_topic_ids.length; i++) {
            if (!viewed_topic_ids.includes(skilled_topic_ids[i])) {
                isfinished = false;
            }
        }
        if (viewed_topic_ids.length = 0) {
            isfinished = false;
        }
        temp.isfinished = isfinished;
    } else {
        temp.isenrolled = false;
        temp.isfinished = false;

    }
    if (cart.docs[0] !== undefined) {
        temp.incart = true;
    } else {
        temp.incart = false;
    }
    temp.iscert = net.data().Certificate_Flag;
    res.json(temp);
});

skilled.post('/SubList', async (req, res) => {
    let data = [];
    let sub_data = await db.collection('Skilled_Courses').doc(req.body.docid).collection('Topic').where('active', '==', true).orderBy('index').get();

    let temp = {};
    let visited_modules = [];
    sub_data.forEach((sub) => {
        let module = sub.data().module;
        if (module === undefined) {
            module = 0;
        }
        console.log(module)
        console.log(visited_modules);
        if (module === 0 && (!visited_modules.includes(module))) {
            visited_modules.push(module);
            temp = {
                "docid": req.body.docid,
                "moduleid": module,
                "name": `Module 0`
            }
            if (sub.data().module_name !== undefined) {
                temp.name = sub.data().module_name;
            }
            if (sub.data().ModuleUrl === undefined) {
                temp.image_url = "https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/error.png?alt=media"
            } else {
                temp.image_url = sub.data().ModuleUrl;
            }
            data.push(temp)
        } else if (module !== 0 && (!visited_modules.includes(module))) {
            visited_modules.push(module);
            temp = {
                "docid": req.body.docid,
                "moduleid": module,
                "name": `Module ${module}`,
            }
            if (sub.data().module_name !== undefined) {
                temp.name = sub.data().module_name;
            }
            if (sub.data().ModuleUrl === undefined) {
                temp.image_url = "https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/error.png?alt=media"
            } else {
                temp.image_url = sub.data().ModuleUrl;
            }
            data.push(temp)
        }
    });
    res.json(data);
});

skilled.post('/SubView', async (req, res) => {
    let data = [];
    let sub_data = await db.collection('Skilled_Courses').doc(req.body.docid).collection('Topic').where('active', '==', true).orderBy('index').get();
    let enrolled = false;
    let mycourses = await db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(req.body.docid).get();
    if (mycourses.data() !== undefined) {
        enrolled = true;
    }
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
    console.log(progress_array);

    let temp = {};
    let count = 1;
    sub_data.forEach((sub) => {
        if (Number(req.body.moduleid) === 0) {
            if (sub.data().module === undefined) {
                temp = {
                    "docid": req.body.docid,
                    "index": count,
                    "topicid": sub.id,
                    "isenrolled": enrolled,
                    "image_url": sub.data().ImgUrl,
                    "video_url": sub.data().VideoUrl,
                    "chaptername": sub.data().TopicName,
                    "chapternumber": "Chapter " + `${count}`,
                    "viewed": lock_array[count - 1],
                    "progress": progress_array[count - 1]
                }
                data.push(temp);
            } else if (sub.data().module === Number(req.body.moduleid)) {
                temp = {
                    "docid": req.body.docid,
                    "index": count,
                    "topicid": sub.id,
                    "isenrolled": enrolled,
                    "image_url": sub.data().ImgUrl,
                    "video_url": sub.data().VideoUrl,
                    "chaptername": sub.data().TopicName,
                    "chapternumber": "Chapter " + `${count}`,
                    "viewed": lock_array[count - 1],
                    "progress": progress_array[count - 1]
                }
                data.push(temp);
            }
        } else {
            if (sub.data().module === Number(req.body.moduleid)) {
                temp = {
                    "docid": req.body.docid,
                    "index": count,
                    "topicid": sub.id,
                    "isenrolled": enrolled,
                    "image_url": sub.data().ImgUrl,
                    "video_url": sub.data().VideoUrl,
                    "chaptername": sub.data().TopicName,
                    "chapternumber": "Chapter " + `${count}`,
                    "viewed": lock_array[count - 1],
                    "progress": progress_array[count - 1]
                }
                data.push(temp);
            }
        }
        count += 1;
    });
    res.json(data);
})


skilled.post('/TopicView', async (req, res) => {

    let sub = await db.collection('Skilled_Courses').doc(req.body.docid).collection('Topic').doc(req.body.topicid).get();
    let mycourse = await db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(req.body.docid).collection('Viewed_Topics').doc(req.body.topicid).get();
    let current_position = '00:00:00';
    if (mycourse.data() !== undefined) {
        if (mycourse.data().current_position !== undefined) {
            current_position = mycourse.data().current_position;
        }
    }
    let data = {
        "docid": req.body.docid,
        "topicid": req.body.topicid,
        'VideoUrl': sub.data().VideoUrl,
        'quizavailable': sub.data().mock_active,
        'Video': [],
        'current_position': current_position
    };

    let units = sub.data().Units;
    let downloadable = sub.data().Downloadable_Activity;
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
    downloadable.forEach(unit => {
        if (unit.type === 'Note') {
            temp = {
                "UnitName": unit.UnitName,
                "UnitSeeker": unit.PdfUrl,
                "Number": num,
                "Type": 'downloadable',
                "Extension": `.${unit.Extension}`
            }
        }
        unit_array.push(temp);
        num += 1;
    })
    data.Video = unit_array;
    res.json(data);
})


skilled.post('/TopicMock', async (req, res) => {
    let data = [];
    let sub = await db.collection('Skilled_Courses').doc(req.body.docid).collection('Topic').doc(req.body.topicid).get();
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


skilled.post('/ViewUpdate', async (req, res) => {
    db.collection('Users').doc(req.body.userid).collection('Mycourse').doc(req.body.docid).collection('Viewed_Topics').doc(req.body.topicid).set({
        viewed: true
    }).then(() => {
        return res.json({ "message": "sucess" });
    }).catch(e => {
        res.json({ "message": "failed" });
    });
})
//new
skilled.post('/VideoProgress', async (req, res) => {
    const total_length = req.body.total_length;
    const current_position = req.body.current_position;
    let progress = (Number(current_position) / Number(total_length)) * 100;
    if (progress === NaN) {
        progress = 0;
    }
    console.log(progress);


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


skilled.post('/PreviewList', async (req, res) => {
    let data = [];
    let sub_data = await db.collection('Skilled_Courses').doc(req.body.docid).collection('Preview').where('active', '==', true).orderBy('index').get();
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


skilled.post('/PreviewView', async (req, res) => {

    let sub = await db.collection('Skilled_Courses').doc(req.body.docid).collection('Preview').doc(req.body.previewid).get();
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

exports.SkilledCourse = functions.https.onRequest(skilled);



// link : https://console.firebase.google.com/v1/r/project/estudo-admin/firestore/indexes?create_composite=ClRwcm9qZWN0cy9lc3R1ZG8tYWRtaW4vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL1NraWxsZWRfQ291cnNlcy9pbmRleGVzL18QARoKCgZBY3RpdmUQARoJCgVJbmRleBABGgwKCF9fbmFtZV9fEAE




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


