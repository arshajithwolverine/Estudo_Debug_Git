//Discussion Forum


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

let discussion = express();
discussion.use(cors({ origin: true }));
// discussion.use(decodeIDToken);
discussion.use(cold_start);

discussion.post('/AddQuery', async (req, res) => {
    let userid = req.body.userid;
    let query = req.body.query;
    let date = req.body.date;
    let docid = req.body.docid;

    let user = await db.collection('Users').doc(userid).get();

    db.collection('Discussion').doc(docid).collection('Query').add({
        userid: userid,
        username: user.data().name,
        query: query,
        date: date,
        paperid: docid,
        comments: 0
    }).then(async doc => {
        // await db.collection('Discussion').doc(docid).collection('Query').doc(doc.id).collection('Comments').doc('Info').set({
        // });
        return res.json({ "message": "sucess" });
    }).catch(error => {
        res.json({ "message": "failed" });
        console.log(error)
    })
})

discussion.post('/QueryList', async (req, res) => {
    let ref = await db.collection('Discussion').doc(req.body.docid).collection('Query').orderBy('date', 'desc').get();
    let data = [];
    let temp = {};

    ref.forEach(element => {
        temp = {
            "userid": element.data().userid,
            "username": element.data().username,
            "paperid": element.data().paperid,
            "queryid": element.id,
            "date": element.data().date,
            "query": element.data().query,
            "comments": element.data().comments
        }
        data.push(temp);
    });

    res.json(data);
})


discussion.post('/CommentAdd', async (req, res) => {
    let paperid = req.body.paperid;
    let queryid = req.body.queryid;
    let comment = req.body.comment;
    let date = req.body.date;
    let userid = req.body.userid;
    let user = await db.collection('Users').doc(userid).get();
    let username = user.data().name;

    db.collection('Discussion').doc(paperid).collection('Query').doc(queryid).collection('Comments').add({
        userid: userid,
        username: username,
        comment: comment,
        date: date
    }).then(async doc => {
        await db.collection('Discussion').doc(paperid).collection('Query').doc(queryid).update('comments', admin.firestore.FieldValue.increment(1));
        return res.json({ "message": "sucess" });
    }).catch(e => {
        res.json({ "message": "failed" });
        console.log(e);
    })
})


discussion.post('/CommentList', async (req, res) => {
    let paperid = req.body.paperid;
    let queryid = req.body.queryid;


    let ref = await db.collection('Discussion').doc(paperid).collection('Query').doc(queryid).collection('Comments').orderBy('date', 'desc').get();
    let data = [];
    let temp = {};

    ref.forEach(element => {
        temp = {
            "userid": element.data().userid,
            "username": element.data().username,
            "paperid": paperid,
            "queryid": queryid,
            "commentid": element.id,
            "date": element.data().date,
            "comment": element.data().comment
        }
        data.push(temp);
    });

    res.json(data);
})


exports.Discussion = functions.https.onRequest(discussion);