const functions = require('firebase-functions');

var admin = require("firebase-admin");

const db = admin.firestore();


var express = require('express');
var cors = require('cors');

let test = express();
test.use(cors({ origin: true }));

test.post('/mock', async (req, res) => {
    await db.collection('Mock_Test').doc('paper1').set({
        Paper_Id: 'paper1',
        Price: 4999,
        active: true,
        name: 'UGC-NET PAPER 1',
        'type': 'net',
        index: 0
    })
    let mock_info = await db.collection('MockTest').doc('Mock_Info').get();
    let promise1 = [];
    mock_info.data().Subjects[0].Exam.forEach(exam => {
        promise1.push(db.collection('MockTest').doc(exam.docid).get());
    });
    let demo = await Promise.all(promise1);
    // let count1 = 0;
    demo.forEach((doc, index) => {
        db.collection('Mock_Test').doc('paper1').collection('Tests').add({
            Exam: doc.data().Exam,
            index: index,
            mock_active: true,
            demo: true,
            name: mock_info.data().Subjects[0].Exam[index].name
        });
        // count1 += 1;
    })

    let promise2 = [];
    mock_info.data().Subjects[1].Exam.forEach(exam => {
        promise2.push(db.collection('MockTest').doc(exam.docid).get());
    });
    let demo2 = await Promise.all(promise2);
    // let count2 = 0;
    demo2.forEach((doc, index) => {
        db.collection('Mock_Test').doc('paper1').collection('Tests').add({
            Exam: doc.data().Exam,
            index: index,
            mock_active: true,
            demo: false,
            name: mock_info.data().Subjects[1].Exam[index].name
        });
        // count2 += 1;
    })
    res.json({ "message": "success" })

})


test.post('/user', async (req, res) => {
    let users = await db.collection('User').get();
    let count = 0;
    users.forEach(user => {
        let temp = {
            Referal_Id: '',
            location: ''
        };

        if (user.data().DOB !== undefined) {
            temp.dob = dob(user.data().DOB);
        } else {
            temp.dob = '';
        }
        if (user.data().Email !== undefined) {
            temp.email = user.data().Email;
        } else {
            temp.email = '';
        }
        if (user.data().Gender !== undefined) {
            temp.gender = user.data().Gender;
        } else {
            temp.gender = '';
        }
        if (user.data().Name !== undefined) {
            temp.name = user.data().Name;
        } else {
            temp.name = '';
        }
        if (user.data().PhoneNo !== undefined) {
            temp.phonenumber = user.data().PhoneNo;
        } else {
            temp.phonenumber = '';
        }

        db.collection('Users').doc(user.id).set(temp)
        count += 1;
        // console.log(count)
    })
    res.json("success")
})

test.post('/makeadmin', async (req, res) => {
    admin.auth().setCustomUserClaims('wCGOcwGYTmcHHUMu4oYE9kFdPIX2', { admin: true }).then(() => {
        console.log("Made admin")
        res.json("success")
    });
})

test.post('/demo', async (req, res) => {
    let mocks = await db.collection('Mock_Test').doc('paper1').collection('Tests').get();
    mocks.forEach(mock => {
        if (mock.data().demo === undefined) {
            db.collection('Mock_Test').doc('paper1').collection('Tests').doc(mock.id).update({
                demo: false
            });
        }
    })
    res.json({
        "message": "success"
    })
})


exports.Integration = functions.https.onRequest(test);

function dob(string) {
    let datas = string.split('-');
    let year = datas[0];
    let month = datas[1];
    let day = '';
    // console.log(day, month, year)
    // console.log(datas[2].length)
    let flag = 1;
    for (i = 0; i < datas[2].length; i++) {
        // console.log(datas[2][i])
        if (datas[2][i] === 'T') {
            flag = 0;
        }
        if (flag !== 0) {
            day += String(datas[2][i]);
        }
    }
    if (Number(month) == 1) {
        month = 'Jan';
    } else if (Number(month) == 2) {
        month = 'Feb';
    } else if (Number(month) == 3) {
        month = 'Mar';
    } else if (Number(month) == 4) {
        month = 'Apl';
    } else if (Number(month) == 5) {
        month = 'May';
    } else if (Number(month) == 6) {
        month = 'Jun';
    } else if (Number(month) == 7) {
        month = 'Jul';
    } else if (Number(month) == 8) {
        month = 'Aug';
    } else if (Number(month) == 9) {
        month = 'Sep';
    } else if (Number(month) == 10) {
        month = 'Oct';
    } else if (Number(month) == 11) {
        month = 'Nov';
    } else if (Number(month) == 12) {
        month = 'Dec';
    }

    let day_out = `${day} ${month} ${year}`;
    console.log(day_out);
    return day_out;
}