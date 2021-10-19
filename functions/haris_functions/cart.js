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
        //   console.log(decodedToken.uid);


        //   req.body.userid = decodedToken.uid;
        //   req.body.token = decodedToken.uid;
        req.body.token = req.body.userid;

        return next();
    } catch (err) {
        functions.logger.error(err);
        req.body.userid = "";
        return res.json({ "message": "token not verified", "error": err });
    }
}






app.post('/AddToCart', async (req, res) => {
    r = { "type": req.body.type, "category": req.body.category, "courseid": req.body.courseid, "subjectid": req.body.subjectid, "index": Date.now() }
    if (req.body.category === "Courses" && req.body.type === "degree") {
        const degreeecourse = await db.collection("Degree_Courses").doc(req.body.courseid).get();
        r.degreeecourse = degreeecourse.data();
    }
    db.collection("Users").doc(req.body.userid).collection("Cart").add(r)
        .then(just => {
            return res.json(true);
        })
        .catch(err => {
            res.status(400).json(false);
            return functions.logger.error(err);
        })
})


app.post('/ViewCart', async (req, res) => {
    cartData = [];
    db.collection("Users").doc(req.body.userid).collection("Cart").get()
        .then(just => {
            let promise = []
            just.forEach(doc => {
                r = {};
                r = doc.data();
                r.id = doc.id;
                cartData.push(r)
                console.log(`==${doc.data().category}==`)
                console.log("ash1")

                if (doc.data().category === "Mock_Test") {
                    console.log("ash2")

                    promise.push(db.collection("Mock_Test").doc(doc.data().courseid).get())
                }
                else if (doc.data().category === "Study_Materials") {
                    console.log("ash3")

                    promise.push(db.collection("Study_Materials").doc(doc.data().courseid).get())
                }
                else if (doc.data().category === "Courses") {
                    console.log("ash")
                    if (doc.data().type === "net") {
                        promise.push(db.collection("Net").doc(doc.data().courseid).get())
                    }
                    else if (doc.data().type === "degree") {
                        promise.push(db.collection("Degree_Courses").doc(doc.data().courseid).collection("Subject").doc(doc.data().subjectid).get())
                    }
                    else if (doc.data().type === "Skilled_Courses") {
                        console.log("Skilled_Courses")
                        promise.push(db.collection("Skilled_Courses").doc(doc.data().courseid).get())
                    }
                    else if (doc.data().type === "Courses") {
                        promise.push(db.collection("Courses").doc(doc.data().courseid).get())
                    }

                }
            })
            console.log(cartData)
            return Promise.all(promise)
        })
        .then(snap => {
            totalPrice = 0;
            totalTax = 0;
            total = 0;
            // console.log(snap.size)
            let indextodelete = [];
            snap.forEach((doc, index) => {
                // console.log(index)
                if (!doc.exists) {
                    console.log(index)
                    console.log(cartData[index].id)
                    db.collection("Users").doc(req.body.userid).collection("Cart").doc(cartData[index].id).delete();
                    indextodelete.push(index);
                    //cartData.splice(index,1);
                }
                else {
                    console.log(doc.data())
                    totalPrice += (Number(doc.data().Price) - (Number(doc.data().Price) * 0.18));
                    totalTax += Number(doc.data().Price) * 0.18;
                    total += Number(doc.data().Price);
                    cartData[index] = { ...cartData[index], ...doc.data() }
                }

            })
            for (let index = indextodelete.length; index > 0; index--) {
                cartData.splice(indextodelete[index], 1);
            }
            return res.json({ cartData, totalPrice, totalTax, total });
        })
        .catch(err => {
            res.status(400).json(false);
            return functions.logger.error(err);
        })
})



app.post('/DeleteFromCart', async (req, res) => {
    cartData = [];
    db.collection("Users").doc(req.body.userid).collection("Cart").doc(req.body.docid).delete()
        .then(just => {
            return res.json(true);
        })
        .catch(err => {
            res.status(400).json(false);
            return functions.logger.error(err);
        })
});



app.post('/ViewOffers', async (req, res) => {
    db.collection("Users").doc(req.body.userid).collection("Cart").get()
        .then(just => {
            let promise = []
            just.forEach(doc => {
                r = {};
                r = doc.data();
                r.id = doc.id;
                cartData.push(r)
                console.log(`==${doc.data().category}==`)
                console.log("ash1")

                if (doc.data().category === "Mock_Test") {
                    console.log("ash2")

                    promise.push(db.collection("Mock_Test").doc(doc.data().courseid).get())
                }
                else if (doc.data().category === "Study_Materials") {
                    console.log("ash3")

                    promise.push(db.collection("Study_Materials").doc(doc.data().courseid).get())
                }
                else if (doc.data().category === "Courses") {
                    console.log("ash")
                    if (doc.data().type === "net") {
                        promise.push(db.collection("Net").doc(doc.data().courseid).get())
                    }
                    else if (doc.data().type === "degree") {
                        promise.push(db.collection("Degree_Courses").doc(doc.data().courseid).collection("Subject").doc(doc.data().subjectid).get())
                    }
                    else if (doc.data().type === "Skilled_Courses") {
                        console.log("Skilled_Courses")
                        promise.push(db.collection("Skilled_Courses").doc(doc.data().courseid).get())
                    }
                    else if (doc.data().type === "Courses") {
                        promise.push(db.collection("Courses").doc(doc.data().courseid).get())
                    }

                }
            })
            console.log(cartData)
            return Promise.all(promise)
        })
});


function ViewOffers() {
    let cartData = [], combotype = { "mock": [], "study": [], "net": [], "skilled": [], "course": [], "degree": [] };
    db.collection("Users").doc(req.body.userid).collection("Cart").get()
        .then(just => {
            let individualpromise = []
            just.forEach(doc => {
                r = {};
                r = doc.data();
                r.id = doc.id;
                cartData.push(r)
                if (doc.data().type === "degree" && doc.data().category === "Courses") {
                    individualpromise.push(db.collection("Offers").where("Papers", "array-contains", doc.data().subjectid).where("Active", "==", true).where("ExpireDate", ">=", nowdate()).where("OfferType", "==", "Individual").get())
                }
                else {
                    individualpromise.push(db.collection("Offers").where("Papers", "array-contains", doc.data().courseid).where("Active", "==", true).where("ExpireDate", ">=", nowdate()).where("OfferType", "==", "Individual").get())
                }





                if (doc.data().category === "Mock_Test") {
                    combotype.mock.push(doc.data().courseid);


                    promise.push(db.collection("Mock_Test").doc(doc.data().courseid).get())
                }
                else if (doc.data().category === "Study_Materials") {
                    console.log("ash3")
                    db.collection("Offers").where("Papers", "array-contains", doc.data().courseid).where("Active", "==", true).where("ExpireDate", ">=", nowdate()).where("OfferType", "==", "Individual").get()

                    promise.push(db.collection("Study_Materials").doc(doc.data().courseid).get())
                }
                else if (doc.data().category === "Courses") {
                    console.log("ash")
                    if (doc.data().type === "net") {
                        db.collection("Offers").where("Papers", "array-contains", doc.data().courseid).where("Active", "==", true).where("ExpireDate", ">=", nowdate()).where("OfferType", "==", "Individual").get()

                        promise.push(db.collection("Net").doc(doc.data().courseid).get())
                    }
                    else if (doc.data().type === "degree") {
                        db.collection("Offers").where("Papers", "array-contains", doc.data().subjectid).where("Active", "==", true).where("ExpireDate", ">=", nowdate()).where("OfferType", "==", "Individual").get()

                        promise.push(db.collection("Degree_Courses").doc(doc.data().courseid).collection("Subject").doc(doc.data().subjectid).get())
                    }
                    else if (doc.data().type === "Skilled_Courses") {
                        promise.push(db.collection("Skilled_Courses").doc(doc.data().courseid).get())
                    }
                    else if (doc.data().type === "Courses") {
                        promise.push(db.collection("Courses").doc(doc.data().courseid).get())
                    }

                }
            })
            console.log(promise)
            return Promise.all(promise)
        })
}



exports.cart = functions.https.onRequest(app);


cartData = [
    {
        "courseid": "0FYRYMZcFB35OqDT4Z3Z",
        "category": "Courses",
        "type": "net",
        "index": 1619014184082,
        "subjectid": "",
        "id": "9mOqp1vffAnV1WHwg8z4",
        "Name": "Paper1",
        "Details": [
            "arshu"
        ],
        "mock_flag": true,
        "Active": true,
        "Index": "1",
        "Price": "9124"
    },
    {
        "courseid": "0FYRYMZcFB35OqDT4Z3Z",
        "subjectid": "",
        "index": 1617919429999,
        "category": "Courses",
        "type": "net",
        "id": "AEwI8GDhuqsLhKhoMIOc",
        "Active": true,
        "Price": "9124",
        "Name": "Paper1",
        "mock_flag": true,
        "Index": "1",
        "Details": [
            "arshu"
        ]
    },
    {
        "category": "Courses",
        "type": "net",
        "courseid": "0FYRYMZcFB35OqDT4Z3Z",
        "subjectid": "",
        "index": 1619014208022,
        "id": "F12slAgbUhrvzcZP0EXA",
        "mock_flag": true,
        "Name": "Paper1",
        "Price": "9124",
        "Active": true,
        "Details": [
            "arshu"
        ],
        "Index": "1"
    }
]






function nowdate() {

    let today = new Date();
    let currentOffset = today.getTimezoneOffset();
    let ISTOffset = 330;
    today = new Date(today.getTime() + (ISTOffset + currentOffset) * 60000);

    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }


    today = yyyy + '-' + mm + '-' + dd;//`${day}, ${dd} ${mm} ${yyyy}` //
    return today;
}

exports.DeleteCartAndAddPoints = functions.firestore
    .document('Orders/{docid}')
    .onUpdate(async (snap, context) => {

        const newValue = snap.after.data();

        if (newValue.Status === "Issued" || newValue.Status === "error") {
            return 0
        }

        if (newValue.Status === "Paid") {
            if (newValue.points > 0) {
                await db.collection("Users").doc(newValue.User.UserId).get()
                    .then(snap => {
                        const Referal = {};
                        if (snap.data().Referal.Score !== undefined) {
                            Referal.Score = 0;
                        }
                        else {
                            Referal.Score = snap.data().Referal.Score - newValue.points;
                        }
                        return db.collection("Users").doc(newValue.User.UserId).update({ Referal });
                    })
                    .catch(err => {
                        return functions.logger.error(err);
                    })
            }
            await db.collection("Users").doc(newValue.User.UserId).collection("Cart").get()
                .then(snap => {
                    const promise = [];
                    snap.forEach(doc => {
                        promise.push(db.collection("Users").doc(newValue.User.UserId).collection("Cart").doc(doc.id).delete())
                    });
                    return Promise.all(promise);
                })
                .catch(err => {
                    return functions.logger.error(err);
                })

            return 0
        }
    });