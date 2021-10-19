const functions = require('firebase-functions');
const admin = require("firebase-admin");


const db = admin.firestore();

Razorpay = require('razorpay');
const razorPayAccount = require('../razorPayAccount.json')
var instance = new Razorpay(razorPayAccount);


var express = require('express');
var cors = require('cors');



var order = express();
order.use(cors({ origin: true }));
order.post('/OrderView', async (req, res) => {
  const order = await db.collection('Orders').doc(req.body.order_id).get();
  res.json(order.data());
})

exports.Order = functions.https.onRequest(order);



var app = express();
app.use(cors({ origin: true }));



app.use(decodeIDToken);

async function decodeIDToken(req, res, next) {
  functions.logger.log(req.body)

  if (req.body.blahblah === "blahblah") {
    return res.json("coldstart")
  }

  // const idToken = req.body.token;

  try {
    // const decodedToken = await admin.auth().verifyIdToken(idToken);


    // req.body.userid = decodedToken.uid;
    req.body.token = req.body.userid//decodedToken.uid;

    return next();
  } catch (err) {
    functions.logger.error(err);
    req.body.userid = "";
    return res.json({ "message": "token not verified", "error": err });
  }
}

app.post('/viewPrice', async (req, res) => {
  cartData = []
  db.collection("Users").doc(req.body.userid).collection("Cart").get()
    .then(just => {
      let promise = []
      just.forEach(doc => {
        r = {};
        r = doc.data();
        r.id = doc.id;
        cartData.push(r)

        if (doc.data().category === "Mock_Test") {

          promise.push(db.collection("Mock_Test").doc(doc.data().courseid).get())
        }
        else if (doc.data().category === "Study_Materials") {

          promise.push(db.collection("Study_Materials").doc(doc.data().courseid).get())
        }
        else if (doc.data().category === "Courses") {
          if (doc.data().type === "net") {
            promise.push(db.collection("Net").doc(doc.data().courseid).get())
          }
          else if (doc.data().type === "degree") {
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
      return Promise.all(promise)
    })
    .then(async snap => {
      totalPrice = 0;
      totalTax = 0;
      total = 0;
      snap.forEach((doc, index) => {
        //totalPrice += (Number(doc.data().Price) - (Number(doc.data().Price) * 0.18));
        // totalTax += Number(doc.data().Price) * 0.18;
        total += Number(doc.data().Price);
        cartData[index] = { ...cartData[index], ...doc.data() }
      })


      const coupons = req.body.appliedCoupons;
      const combo = [];
      const indi = [];
      const number = [];
      const applied_papers = [];
      // let index_haris = 0
      coupons.forEach((doc, index) => {
        if (doc.offertype === 'Combo') {
          combo.push({ ...doc, couponsIndex: index, discount_price: 0, });
        }
        if (doc.offertype === 'Individual') {
          indi.push({ ...doc, couponsIndex: index, discount_price: 0, });
        }
        if (doc.offertype === 'Numbered') {
          number.push({ ...doc, couponsIndex: index, discount_price: 0, });
        }
        coupons[index].appliedFor = [];

        // index_haris += 1;
      })

      let discount_price = 0;
      combo.forEach(coupon => {
        if (coupon.type === 'net') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid)) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'skilled') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid)) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        }
        else if (coupon.type === 'course') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid)) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'study') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid)) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'mock') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid)) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'degree') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.subjectid)) {
              applied_papers.push(data.subjectid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        }
      })

      indi.forEach(coupon => {
        if (coupon.type === 'net') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid) && (!applied_papers.includes(data.courseid))) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'skilled') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid) && (!applied_papers.includes(data.courseid))) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        }
        else if (coupon.type === 'course') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid) && (!applied_papers.includes(data.courseid))) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'study') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid) && (!applied_papers.includes(data.courseid))) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'mock') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid) && (!applied_papers.includes(data.courseid))) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'degree') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.subjectid) && (!applied_papers.includes(data.subjectid))) {
              applied_papers.push(data.subjectid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        }
      })


      number.forEach(coupon => {
        cartData.forEach(data => {
          if (coupon.degreeid === data.courseid && (!applied_papers.includes(data.subjectid))) {
            applied_papers.push(data.subjectid);
            discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
            coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
            coupons[coupon.couponsIndex].appliedFor.push(data);
          }
        })
      })

      total = (Number(total) - discount_price);
      totalPrice = total - (Number(total) * 0.18);
      totalPrice = Math.round(totalPrice * 100) / 100;

      totalTax += Number(total) * 0.18;
      totalTax = Math.round(totalTax * 100) / 100;

      discount_price = Math.round(discount_price * 100) / 100;

      return res.json({ totalPrice, totalTax, total, discount_price });
    }).catch(err => {
      functions.logger.error(err);
      return res.status(400).json(false);
    })
})

app.post('/OrderGeneration', async (req, res) => {
  if (await coupon_check(req.body.appliedCoupons, req.body.userid)) {
    res.status(300).json(false);
  }
  const points = Number(req.body.availedpoints);
  const UserData = await db.collection("Users").doc(req.body.userid).get();
  let user_point = 0
  if (UserData.data().Referal === undefined) {
    user_point = 0;
  } else {
    user_point = UserData.data().Referal.Score;
  }
  if (points > user_point) {
    res.status(300).json(false);
  }

  let errorarray = [];
  OrderData = {};
  OrderData.Link = "";
  OrderData.index = Date.now();

  OrderData.OrderIssueDate = nowdate();

  OrderData.User = {};

  OrderData.User.contact = req.body.contact;
  OrderData.User.email = req.body.email;
  OrderData.User.name = req.body.name;
  OrderData.User.userid = req.body.userid;



  OrderData.User.Contact = req.body.contact.replace(" ", "").replace("&", "");
  OrderData.User.Email = req.body.email.replace(" ", "").replace("&", "");
  OrderData.User.UserName = req.body.name.replace(" ", "").replace("&", "");
  OrderData.User.UserId = req.body.userid;
  // OrderData.User.Address=req.body.address;




  const validatePhoneNumber = require('validate-phone-number-node-js');
  const resultphoneno = validatePhoneNumber.validate(OrderData.User.Contact);
  var validator = require("email-validator");
  const resultemail = validator.validate(OrderData.User.Email);
  if (resultphoneno === false || resultemail === false) {
    errorarray.push({
      "place": 0,
      "Msg": "Invalid Credentials",
      "couponvalid": "",
    });
    return res.json({
      "link": "",
      "errorarray": errorarray,
    })
  }

  OrderData.Status = "Issued";

  cartData = []
  db.collection("Users").doc(req.body.userid).collection("Cart").get()
    .then(just => {
      let promise = []
      just.forEach(doc => {
        r = {};
        r = doc.data();
        r.id = doc.id;
        cartData.push(r)

        if (doc.data().category === "Mock_Test") {

          promise.push(db.collection("Mock_Test").doc(doc.data().courseid).get())
        }
        else if (doc.data().category === "Study_Materials") {

          promise.push(db.collection("Study_Materials").doc(doc.data().courseid).get())
        }
        else if (doc.data().category === "Courses") {
          if (doc.data().type === "net") {
            promise.push(db.collection("Net").doc(doc.data().courseid).get())
          }
          else if (doc.data().type === "degree") {
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
      return Promise.all(promise)
    })
    .then(async snap => {
      let totalPrice = 0;
      let totalTax = 0;
      let total = 0;
      snap.forEach((doc, index) => {
        //totalPrice += (Number(doc.data().Price) - (Number(doc.data().Price) * 0.18));
        // totalTax += Number(doc.data().Price) * 0.18;
        total += Number(doc.data().Price);
        cartData[index] = { ...cartData[index], ...doc.data() }
      })


      const coupons = req.body.appliedCoupons;
      const combo = [];
      const indi = [];
      const number = [];
      const applied_papers = [];
      coupons.forEach((doc, index) => {
        if (doc.offertype === 'Combo') {
          combo.push({ ...doc, couponsIndex: index, discount_price: 0, });
        }
        if (doc.offertype === 'Individual') {
          indi.push({ ...doc, couponsIndex: index, discount_price: 0, });
        }
        if (doc.offertype === 'Numbered') {
          number.push({ ...doc, couponsIndex: index, discount_price: 0, });
        }
        coupons[index].appliedFor = [];

        // index_haris += 1;
      })


      let discount_price = 0;
      combo.forEach(coupon => {
        if (coupon.type === 'net') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid)) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'skilled') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid)) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        }
        else if (coupon.type === 'course') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid)) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'study') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid)) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'mock') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid)) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'degree') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.subjectid)) {
              applied_papers.push(data.subjectid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        }
      })

      indi.forEach(coupon => {
        if (coupon.type === 'net') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid) && (!applied_papers.includes(data.courseid))) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'skilled') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid) && (!applied_papers.includes(data.courseid))) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        }
        else if (coupon.type === 'course') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid) && (!applied_papers.includes(data.courseid))) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'study') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid) && (!applied_papers.includes(data.courseid))) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'mock') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.courseid) && (!applied_papers.includes(data.courseid))) {
              applied_papers.push(data.courseid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        } else if (coupon.type === 'degree') {
          cartData.forEach(data => {
            if (coupon.papers.includes(data.subjectid) && (!applied_papers.includes(data.subjectid))) {
              applied_papers.push(data.subjectid);
              discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
              coupons[coupon.couponsIndex].appliedFor.push(data);
            }
          })
        }
      })

      number.forEach(coupon => {
        cartData.forEach(data => {
          if (coupon.degreeid === data.courseid && (!applied_papers.includes(data.subjectid))) {
            applied_papers.push(data.subjectid);
            discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
            coupons[coupon.couponsIndex].discount_price += (Number(data.Price) * Number(coupon.discount)) / 100;
            coupons[coupon.couponsIndex].appliedFor.push(data);
          }
        })
      })

      total = (Number(total) - discount_price - points);
      totalPrice = total - (Number(total) * 0.18);
      totalTax += Number(total) * 0.18;

      OrderData.Item = cartData;
      OrderData.points = points;
      OrderData.Amount = total;
      OrderData.coupons = coupons;
      OrderData.discount_price = discount_price;
      //Order Recipt No.

      let OrderRecieptInfo = await db.collection("Orders").doc("Order_Info").get()
      db.doc("Orders/Order_Info").update({ OrderNo: admin.firestore.FieldValue.increment(1) })
      OrderData.OrderNo = OrderRecieptInfo.data().OrderNo;

      if ((Number(total) - discount_price) <= points) {
        OrderData.OrderRecieptId = `ES-003-Points-${OrderData.OrderNo}`;
      } else {
        OrderData.OrderRecieptId = `ES-003-${OrderData.OrderNo}`;
      }


      var options = {
        amount: OrderData.Amount * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: OrderData.OrderRecieptId,
        payment_capture: '1',
      };
      if ((Number(total) - discount_price) <= points) {
        OrderData.ID = `ES_Points_${OrderData.OrderNo}`;
        OrderData.Cart = true;
        OrderData.Link = `https://estudo-admin.web.app/payment/Bill-v2.html?a=${OrderData.ID}`;
        OrderData.Status = 'Paid';
        OrderData.Date = nowdate();
        await db.collection("Orders").doc(OrderData.ID).set(OrderData);

        let Referal = await db.collection('Users').doc(OrderData.User.userid).get();
        let points = OrderData.points;
        if (points === undefined) {
          points = 0;
        }
        let ref_temp = Referal.data().Referal.Score;
        if (ref_temp === undefined) {
          ref_temp = 0;
        }
        let ref = {};
        ref.Score = Number(ref_temp) - Number(points);
        await db.collection('Users').doc(OrderData.User.userid).update({
          Referal: ref
        });

        let CartData = OrderData.Item;

        for (let index = 0; index < CartData.length; index++) {
          r = {};
          r = CartData[index];
          r.date = nowdate();

          if (CartData[index].category === "Courses" && CartData[index].type === "degree") {
            setMyCourse(OrderData.User.UserId, CartData[index].subjectid, r)
            report(OrderData.User.UserId, OrderData, r, OrderData.ID)
          }
          else {
            setMyCourse(OrderData.User.UserId, CartData[index].courseid, r)
            report(OrderData.User.UserId, OrderData, r, OrderData.ID)
          }


          if (CartData[index].category === "Courses" && CartData[index].type === "net") {
            getFreeMockTest(OrderData.User.UserId, CartData[index].courseid, r)
          }
        }

        db.collection("Users").doc(OrderData.User.UserId).collection("Cart").get()
          .then(snap => {
            snap.forEach(doc => {
              db.collection("Users").doc(OrderData.User.UserId).collection("Cart").doc(doc.id).delete()
            })
            return 0;
          })
          .catch(err => {
            return functions.logger.error(err);
          })


        // await res.writeHead(200, { 'Content-Type': 'text/html' });
        // await res.write(`<!DOCTYPE html>
        // <html>
        // <head>
        // <meta name="viewport" content="width=device-width, initial-scale=1">
        // <style>
        // /* Center the loader */
        // #loader {
        //   position: absolute;
        //   left: 50%;
        //   top: 50%;
        //   z-index: 1;
        //   width: 150px;
        //   height: 150px;
        //   margin: -75px 0 0 -75px;
        //   border: 16px solid #f3f3f3;
        //   border-radius: 50%;
        //   border-top: 16px solid #3498db;
        //   width: 120px;
        //   height: 120px;
        //   -webkit-animation: spin 2s linear infinite;
        //   animation: spin 2s linear infinite;
        // }

        // @-webkit-keyframes spin {
        //   0% { -webkit-transform: rotate(0deg); }
        //   100% { -webkit-transform: rotate(360deg); }
        // }

        // @keyframes spin {
        //   0% { transform: rotate(0deg); }
        //   100% { transform: rotate(360deg); }
        // }

        // /* Add animation to "page content" */
        // .animate-bottom {
        //   position: relative;
        //   -webkit-animation-name: animatebottom;
        //   -webkit-animation-duration: 1s;
        //   animation-name: animatebottom;
        //   animation-duration: 1s
        // }

        // @-webkit-keyframes animatebottom {
        //   from { bottom:-100px; opacity:0 } 
        //   to { bottom:0px; opacity:1 }
        // }

        // @keyframes animatebottom { 
        //   from{ bottom:-100px; opacity:0 } 
        //   to{ bottom:0; opacity:1 }
        // }

        // #myDiv {
        //   display: none;
        //   text-align: center;
        // }
        // </style>
        // </head>
        // <body onload="myFunction()" style="margin:0;">

        // <div id="loader"></div>

        // <button  id="selfclick" onclick="test()"  style="display: none;">clickme</button>



        //   <script>

        //   document.addEventListener('DOMContentLoaded', function() {

        //     location.replace("https://estudo-admin.web.app/payment/Bill-v2.html?a=${order_id}");
        //     setTimeout(function(){ var pagebutton= document.getElementById("selfclick");
        //     pagebutton.click(); }, 5000);
        //   })
        //     function test(){
        //       invokeCSharpAction("success");
        //     }
        // </script>
        // </body>
        // </html>
        // `);
        //   await res.end();
        //   return 0;
        res.json({
          "errorarray": errorarray,
          "link": OrderData.Link,
        })

      } else {
        instance.orders.create(options, (err, order) => {

          if (err !== null) {
            functions.logger.error(err);
            res.send("Error")
          }
          else {

            OrderData.ID = order.id;
            OrderData.Cart = true;
            OrderData.Link = `https://estudo-admin.web.app/Admin/examples/paytestpage.html?order_id=${order.id}&email=${OrderData.User.Email}&contact=${OrderData.User.Contact}&name=${OrderData.User.UserName}`;
            db.collection("Orders").doc(order.id).set(OrderData);

            res.json({
              "errorarray": errorarray,
              "link": OrderData.Link,
            })

          }

        })
      }


      return 0;
    })
    .catch(err => {
      res.status(400).json(false);
      return functions.logger.error(err);
    })









});


async function coupon_check(appliedCoupons, userid) {
  //Check
  let Data_Res = {};
  Data_Res.appliedCoupons = appliedCoupons;

  let data = [...appliedCoupons]
  console.log(data);


  const net_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'net').where('category', '==', 'Courses').get();
  const skilled_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'Skilled_Courses').where('category', '==', 'Courses').get();
  const life_style_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'Courses').where('category', '==', 'Courses').get();
  const mock_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'net').where('category', '==', 'Mock_Test').get();
  const study_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'net').where('category', '==', 'Study_Materials').get();
  const degree_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'degree').get();
  let check_flag = false;


  Data_Res.appliedCoupons.forEach(coupon => {
    if (check_flag === true) return;
    if (coupon.type === 'net') {
      if (coupon.offertype === 'Combo') {
        let index = 0;
        data.forEach(offer => {
          if (offer.docid === coupon.docid) return;
          if (offer.type === 'net' && offer.offertype === 'Combo') {
            let net_flag = false;
            coupon.papers.forEach(id => {
              if (offer.papers.includes(id)) {
                net_flag = true;
              }
            })
            if (net_flag) {
              check_flag = true;
            }
          } else if (offer.type === 'net' && offer.offertype === 'Individual') {
            let odd_ids = [];
            offer.papers.forEach(id => {
              if (!coupon.papers.includes(id)) {
                odd_ids.push(id);
              }
            })
            let net_flag = true;
            net_data.forEach(data => {
              if (odd_ids.includes(data.data().courseid)) {
                net_flag = false;
              }
            })
            if (net_flag) {
              check_flag = true;
            }
          }
          index += 1;
        })
      } else {
        let index = 0;
        data.forEach(offer => {
          if (offer.docid === coupon.docid) return;
          if (offer.type === 'net' && offer.offertype === 'Combo') {
            let net_flag = false;
            coupon.papers.forEach(id => {
              if (offer.papers.includes(id)) {
                net_flag = true;
              }
            })
            if (net_flag) {
              check_flag = true;
            }
          } else if (offer.type === 'net' && offer.offertype === 'Individual') {
            let odd_ids = [];
            offer.papers.forEach(id => {
              if (!coupon.papers.includes(id)) {
                odd_ids.push(id);
              }
            })
            let net_flag = true;
            net_data.forEach(data => {
              if (odd_ids.includes(data.data().courseid)) {
                net_flag = false;
              }
            })
            if (net_flag) {
              check_flag = true;
            }
          }
          index += 1;
        })
      }
    } else if (coupon.type === 'skilled') {
      let index = 0;
      data.forEach(offer => {
        if (offer.docid === coupon.docid) return;
        if (offer.type === 'skilled' && offer.offertype === 'Combo') {
          let net_flag = false;
          coupon.papers.forEach(id => {
            if (offer.papers.includes(id)) {
              net_flag = true;
            }
          })
          if (net_flag) {
            check_flag = true;
          }
        } else if (offer.type === 'skilled' && offer.offertype === 'Individual') {
          let odd_ids = [];
          offer.papers.forEach(id => {
            if (!coupon.papers.includes(id)) {
              odd_ids.push(id);
            }
          })
          let net_flag = true;
          skilled_data.forEach(data => {
            if (odd_ids.includes(data.data().courseid)) {
              net_flag = false;
            }
          })
          if (net_flag) {
            check_flag = true;
          }
        }
        index += 1;
      })
    } else if (coupon.type === 'course') {
      let index = 0;
      data.forEach(offer => {
        if (offer.docid === coupon.docid) return;
        if (offer.type === 'course' && offer.offertype === 'Combo') {
          let net_flag = false;
          coupon.papers.forEach(id => {
            if (offer.papers.includes(id)) {
              net_flag = true;
            }
          })
          if (net_flag) {
            check_flag = true;
          }
        } else if (offer.type === 'course' && offer.offertype === 'Individual') {
          let odd_ids = [];
          offer.papers.forEach(id => {
            if (!coupon.papers.includes(id)) {
              odd_ids.push(id);
            }
          })
          let net_flag = true;
          life_style_data.forEach(data => {
            if (odd_ids.includes(data.data().courseid)) {
              net_flag = false;
            }
          })
          if (net_flag) {
            check_flag = true;
          }
        }
        index += 1;
      })
    } else if (coupon.type === 'mock') {
      let index = 0;
      data.forEach(offer => {
        if (offer.docid === coupon.docid) return;
        if (offer.type === 'mock' && offer.offertype === 'Combo') {
          let net_flag = false;
          coupon.papers.forEach(id => {
            if (offer.papers.includes(id)) {
              net_flag = true;
            }
          })
          if (net_flag) {
            check_flag = true;
          }
        } else if (offer.type === 'mock' && offer.offertype === 'Individual') {
          let odd_ids = [];
          offer.papers.forEach(id => {
            if (!coupon.papers.includes(id)) {
              odd_ids.push(id);
            }
          })
          let net_flag = true;
          mock_data.forEach(data => {
            if (odd_ids.includes(data.data().courseid)) {
              net_flag = false;
            }
          })
          if (net_flag) {
            check_flag = true;
          }
        }
        index += 1;
      })
    } else if (coupon.type === 'study') {
      console.log("Chech study entered")
      let index = 0;
      data.forEach(offer => {
        if (offer.docid === coupon.docid) return;
        if (offer.type === 'study' && offer.offertype === 'Combo') {
          let net_flag = false;
          coupon.papers.forEach(id => {
            if (offer.papers.includes(id)) {
              net_flag = true;
            }
          })
          console.log(net_flag);
          if (net_flag) {
            check_flag = true;
          }
        } else if (offer.type === 'study' && offer.offertype === 'Individual') {
          let odd_ids = [];
          offer.papers.forEach(id => {
            if (!coupon.papers.includes(id)) {
              odd_ids.push(id);
            }
          })
          let net_flag = true;
          study_data.forEach(data => {
            if (odd_ids.includes(data.data().courseid)) {
              net_flag = false;
            }
          })
          if (net_flag) {
            check_flag = true;
          }
        }
        index += 1;
      })
    } else if (coupon.type === 'degree') {
      if (coupon.offertype === 'Combo' || coupon.offertype === 'Individual') {
        console.log("Chech study entered")
        let index = 0;
        data.forEach(offer => {
          if (offer.docid === coupon.docid) return;
          if (offer.type === 'degree' && offer.offertype === 'Combo' && offer.degreeid === coupon.degreeid) {
            let net_flag = false;
            coupon.papers.forEach(id => {
              if (offer.papers.includes(id)) {
                net_flag = true;
              }
            })
            console.log(net_flag);
            if (net_flag) {
              check_flag = true;
            }
          } else if (offer.type === 'degree' && offer.offertype === 'Individual' && offer.degreeid === coupon.degreeid) {
            let odd_ids = [];
            offer.papers.forEach(id => {
              if (!coupon.papers.includes(id)) {
                odd_ids.push(id);
              }
            })
            let net_flag = true;
            study_data.forEach(data => {
              if (odd_ids.includes(data.data().courseid)) {
                net_flag = false;
              }
            })
            if (net_flag) {
              check_flag = true;
            }
          } else if (offer.type === 'degree' && offer.offertype === 'Numbered' && offer.degreeid === coupon.degreeid) {
            if (coupon.offertype === 'Combo') {
              let count = 0;
              degree_data.forEach(doc => {
                if (doc.data().courseid === coupon.degreeid) {
                  count += 1;
                }
              })
              if ((count - coupon.papers.length) < offer.subjectcount) {
                check_flag = true;
              }
            } else {
              let count = 0;
              degree_data.forEach(doc => {
                if (doc.data().courseid === coupon.degreeid && coupon.papers.includes(doc.data().subjectid)) {
                  count += 1;
                }
              })
              if ((count - coupon.papers.length) < offer.subjectcount) {
                check_flag = true;
              }
            }
          }
          index += 1;
        })
      } else {
        console.log("Chech study entered")
        let index = 0;
        data.forEach(offer => {
          if (offer.docid === coupon.docid) return;
          if (offer.type === 'degree' && offer.offertype === 'Combo' && offer.degreeid === coupon.degreeid) {
            let count = 0;
            degree_data.forEach(doc => {
              if (doc.data().courseid === offer.degreeid) {
                count += 1;
              }
            })
            if ((count - offer.papers.length) < coupon.subjectcount) {
              check_flag = true;
            }
          } else if (offer.type === 'degree' && offer.offertype === 'Individual' && offer.degreeid === coupon.degreeid) {
            let count = 0;
            degree_data.forEach(doc => {
              if (doc.data().courseid === offer.degreeid && offer.papers.includes(doc.data().subjectid)) {
                count += 1;
              }
            })
            if ((count - offer.papers.length) < coupon.subjectcount) {
              check_flag = true;
            }
          } else if (offer.type === 'degree' && offer.offertype === 'Numbered' && offer.degreeid === coupon.degreeid) {
            let count = 0;
            degree_data.forEach(doc => {
              if (doc.data().courseid === offer.degreeid) {
                count += 1;
              }
            })
            if (count < (offer.subjectcount + coupon.subjectcount)) {
              check_flag = true;
            }
          }
          index += 1;
        })
      }
    }
  })
  return check_flag;
}




exports.payment = functions.https.onRequest(app);







var url = require('url');


exports.paymentcomplete = functions.runWith({ "timeoutSeconds": 300, memory: '512MB' }).https.onRequest(async (req, res) => {
  if (req.body.blahblah === "blahblah") {
    res.json({ "blahblah": "blahblah" });
    return;
  }

  flag = 0;
  var url_parts = url.parse(req.url, true).query;
  order_id = url_parts.order_id;

  if (req.body.error !== undefined || req.body === {}) {
    await db.collection("Orders").doc(order_id).update({ "Status": "error" });
    flag = 0;
  }
  else if (req.body.razorpay_order_id !== undefined || req.body.razorpay_payment_id !== undefined) {
    payment_id = req.body.razorpay_payment_id;
    order_id = req.body.razorpay_order_id;

    payment_data = await instance.payments.fetch(payment_id)
    order_data = await instance.orders.fetch(order_id)
    sever_data = await db.doc(`Orders/${order_id}`).get();
    Amount_Payable = sever_data.data().Amount * 100;
    if (order_data.status === "paid" && order_data.amount === order_data.amount_paid && order_data.amount_due === 0 && Amount_Payable === order_data.amount_paid) {
      flag = 1;

      db.doc(`Orders/${order_id}`).update({ "Status": "Paid", "razorpay_payment_id": payment_id, "Date": nowdate() });
    }
    else {
      await db.collection("Orders").doc(order_id).update({ "Status": "error" });
      flag = 0;
    }
  }
  else {
    await db.collection("Orders").doc(order_id).update({ "Status": "error" });
    flag = 0;
  }

  if (url_parts.callback_url === "false") {
    flag = 0;

  }

  if (flag === 0) {
    order_data = await instance.orders.fetch(order_id)
    sever_data = await db.doc(`Orders/${order_id}`).get();
    Amount_Payable = sever_data.data().Amount * 100;
    if (order_data.status === "paid" && order_data.amount === order_data.amount_paid && order_data.amount_due === 0 && Amount_Payable === order_data.amount_paid) {
      flag = 1;

      await db.doc(`Orders/${order_id}`).update({ "Status": "Paid", "razorpay_payment_id": "", "Date": nowdate() });
    }

  }







  if (flag === 1) {
    const OrderData = await db.collection('Orders').doc(req.body.razorpay_order_id).get();
    let Referal = await db.collection('Users').doc(OrderData.data().User.userid).get();
    let points = OrderData.data().points;
    if (points === undefined) {
      points = 0;
    }
    let ref_temp = Referal.data().Referal.Score;
    if (ref_temp === undefined) {
      ref_temp = 0;
    }
    let ref = {};
    ref.Score = Number(ref_temp) - Number(points);
    await db.collection('Users').doc(OrderData.data().User.userid).update({
      Referal: ref
    });


    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
      <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
      /* Center the loader */
      #loader {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 1;
        width: 150px;
        height: 150px;
        margin: -75px 0 0 -75px;
        border: 16px solid #f3f3f3;
        border-radius: 50%;
        border-top: 16px solid #3498db;
        width: 120px;
        height: 120px;
        -webkit-animation: spin 2s linear infinite;
        animation: spin 2s linear infinite;
      }
      
      @-webkit-keyframes spin {
        0% { -webkit-transform: rotate(0deg); }
        100% { -webkit-transform: rotate(360deg); }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Add animation to "page content" */
      .animate-bottom {
        position: relative;
        -webkit-animation-name: animatebottom;
        -webkit-animation-duration: 1s;
        animation-name: animatebottom;
        animation-duration: 1s
      }
      
      @-webkit-keyframes animatebottom {
        from { bottom:-100px; opacity:0 } 
        to { bottom:0px; opacity:1 }
      }
      
      @keyframes animatebottom { 
        from{ bottom:-100px; opacity:0 } 
        to{ bottom:0; opacity:1 }
      }
      
      #myDiv {
        display: none;
        text-align: center;
      }
      </style>
      </head>
      <body onload="myFunction()" style="margin:0;">
      
      <div id="loader"></div>
      
      <button  id="selfclick" onclick="test()"  style="display: none;">clickme</button>

      
      
        <script>
          
        document.addEventListener('DOMContentLoaded', function() {
            
          location.replace("https://estudo-admin.web.app/payment/Bill-v2.html?a=${order_id}");
          setTimeout(function(){ var pagebutton= document.getElementById("selfclick");
          pagebutton.click(); }, 5000);
        })
          function test(){
            invokeCSharpAction("success");
          }
      </script>
      </body>
      </html>
      `);


    res.end();













  }
  else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
      <html>
      <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
      /* Center the loader */
      #loader {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 1;
        width: 150px;
        height: 150px;
        margin: -75px 0 0 -75px;
        border: 16px solid #f3f3f3;
        border-radius: 50%;
        border-top: 16px solid #3498db;
        width: 120px;
        height: 120px;
        -webkit-animation: spin 2s linear infinite;
        animation: spin 2s linear infinite;
      }
      
      @-webkit-keyframes spin {
        0% { -webkit-transform: rotate(0deg); }
        100% { -webkit-transform: rotate(360deg); }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Add animation to "page content" */
      .animate-bottom {
        position: relative;
        -webkit-animation-name: animatebottom;
        -webkit-animation-duration: 1s;
        animation-name: animatebottom;
        animation-duration: 1s
      }
      
      @-webkit-keyframes animatebottom {
        from { bottom:-100px; opacity:0 } 
        to { bottom:0px; opacity:1 }
      }
      
      @keyframes animatebottom { 
        from{ bottom:-100px; opacity:0 } 
        to{ bottom:0; opacity:1 }
      }
      
      #myDiv {
        display: none;
        text-align: center;
      }
      </style>
      </head>
      <body onload="myFunction()" style="margin:0;">
      
      <div id="loader"></div>
      <button  id="selfclick" onclick="test()"  style="display: none;">clickme</button>

      
      
        <script>
          
        document.addEventListener('DOMContentLoaded', function() {
            
          location.replace("https://estudo-admin.web.app/payment/BillFail.html");
          setTimeout(function(){ var pagebutton= document.getElementById("selfclick");
          pagebutton.click(); }, 5000);
        })
          function test(){
            invokeCSharpAction("fail");
          }
      </script>
      </body>
      </html>
      `);


    res.end();
  }
})










exports.OrderToMyCourese = functions.firestore
  .document('Orders/{docid}')
  .onUpdate((snap, context) => {

    const newValue = snap.after.data();
    let CartData = newValue.Item;


    if (newValue.Status === "Issued" || newValue.Status === "error") {
      return 0
    }


    if (newValue.Status === "Paid") {
      for (let index = 0; index < CartData.length; index++) {
        r = {};
        r = CartData[index];
        r.date = nowdate();

        if (CartData[index].category === "Courses" && CartData[index].type === "degree") {
          setMyCourse(newValue.User.UserId, CartData[index].subjectid, r)
          report(newValue.User.UserId, newValue, r, context.params.docid)
        }
        else {
          setMyCourse(newValue.User.UserId, CartData[index].courseid, r)
          report(newValue.User.UserId, newValue, r, context.params.docid)
        }


        if (CartData[index].category === "Courses" && CartData[index].type === "net") {
          getFreeMockTest(newValue.User.UserId, CartData[index].courseid, r)
        }


      }
      db.collection("Users").doc(newValue.User.UserId).collection("Cart").get()
        .then(snap => {
          snap.forEach(doc => {
            db.collection("Users").doc(newValue.User.UserId).collection("Cart").doc(doc.id).delete()
          })
          return 0;
        })
        .catch(err => {
          return functions.logger.error(err);
        })
      return 0
    }







    return 0



  });






async function setMyCourse(userid, docid, contentdata) {

  await db.collection("Users").doc(userid).collection("Mycourse").doc(docid).set(contentdata);


}
//new
async function report(userid, order, contentdata, orderid) {
  let report = contentdata;
  report.userid = userid;
  report.order_id = orderid;
  const coupons = order.coupons;
  let points = order.points;
  if (points === undefined) {
    points = 0;
  }
  points = Number(points);
  points /= order.Item.length;
  let type = '';
  if (contentdata.category === 'Courses') {
    if (contentdata.type === 'Skilled_Courses') {
      type = 'skilled';
    } else if (contentdata.type === 'Courses') {
      type = 'course';
    } else {
      type = contentdata.type;
    }
  } else if (contentdata.category === 'Study_Materials') {
    type = 'study';
  } else if (contentdata.category === 'Mock_Test') {
    type = 'mock';
  }
  coupons.forEach(coupon => {
    console.log("entered coupon report")
    console.log(`coupon.type : ${coupon.type}`);
    console.log(`type : ${type}`)
    if (coupon.type === type) {
      if (type === 'net') {
        console.log("net coupon report")
        coupon.appliedFor.forEach(data => {
          if (data.courseid === contentdata.courseid) {
            report.Price = Number(report.Price) - ((Number(report.Price) * Number(coupon.discount)) / 100);
            // report.Price = Math.round(report.Price * 100) / 100;
            report.coupon = coupon;
          }
        })
      } else if (type === 'degree') {
        console.log("degree coupon report")
        coupon.appliedFor.forEach(data => {
          if (data.courseid === contentdata.degreeid && data.subjectid === contentdata.subjectid) {
            report.Price = Number(report.Price) - ((Number(report.Price) * Number(coupon.discount)) / 100);
            // report.Price = Math.round(report.Price * 100) / 100;
            report.coupon = coupon;
          }
        })
      } else if (type === 'skilled') {
        console.log("skilled coupon report")
        coupon.appliedFor.forEach(data => {
          if (data.courseid === contentdata.courseid) {
            report.Price = Number(report.Price) - ((Number(report.Price) * Number(coupon.discount)) / 100);
            // report.Price = Math.round(report.Price * 100) / 100;
            report.coupon = coupon;
          }
        })
      } else if (type === 'course') {
        console.log("course coupon report")
        coupon.appliedFor.forEach(data => {
          if (data.courseid === contentdata.courseid) {
            report.Price = Number(report.Price) - ((Number(report.Price) * Number(coupon.discount)) / 100);
            // report.Price = Math.round(report.Price * 100) / 100;
            report.coupon = coupon;
          }
        })
      } else if (type === 'mock') {
        console.log("mock coupon report")
        coupon.appliedFor.forEach(data => {
          if (data.courseid === contentdata.courseid) {
            report.Price = Number(report.Price) - ((Number(report.Price) * Number(coupon.discount)) / 100);
            // report.Price = Math.round(report.Price * 100) / 100;
            report.coupon = coupon;
          }
        })
      } else if (type === 'study') {
        console.log("study coupon report")
        coupon.appliedFor.forEach(data => {
          if (data.courseid === contentdata.courseid) {
            report.Price = Number(report.Price) - ((Number(report.Price) * Number(coupon.discount)) / 100);
            // report.Price = Math.round(report.Price * 100) / 100;
            report.coupon = coupon;
          }
        })
      }
    }
  })
  report.Price -= Number(points);
  report.Price = Math.round(report.Price * 100) / 100;
  if (Number(report.Price) < 0) {
    report.Price = 0;
  }
  await db.collection('Reports').add(report);
}



async function getFreeMockTest(userid, docid, contentdata) {
  db.collection("Mock_Test").where("Paper_Id", "==", docid).get()
    .then(snap => {
      if (snap.size > 0) {
        testr = {}
        testr = snap[0].data();
        testr.date = contentdata.date;
        testr.category = "Mock_Test";
        testr.subjectid = null;
        testr.courseid = snap.docs[0].id;
        testr.type = "net";
        return db.collection("Users").doc(userid).collection("Mycourse").doc(snap.docs[0].id).set();
      }
      return 0
    })
    .catch(err => {
      return functions.logger.error(err);
    })
}

exports.CreateBill = functions.runWith({ "timeoutSeconds": 300, memory: '512MB' }).firestore
  .document('Orders/{order_id}')
  .onUpdate(async (change, context) => {
    const data = change.after.data();
    const previousData = change.before.data();


    if (data.Status === previousData.Status) {
      return null;
    }
    else if (data.Status === "Paid") {

      const puppeteer = require('puppeteer');
      const os = require('os');
      const path = require('path');
      const { Storage } = require('@google-cloud/storage');
      const storage = new Storage();

      __dirname = path.join(os.tmpdir(), context.params.order_id + ".pdf");
      let browser = await puppeteer.launch({ headless: true });
      let page = await browser.newPage();
      await page.goto(`https://estudo-admin.web.app/payment/Bill-v2.html?a=${context.params.order_id}`);
      await page.waitFor(4000)
      await page.pdf({ path: __dirname })
      const destBucket = storage.bucket("gs://estudo-admin.appspot.com");
      destBucket.upload(__dirname, {
        destination: `BillsV2/${context.params.order_id}`,
        metadata: { contentType: "application/pdf" }
      })
      await db.collection("Orders").doc(context.params.order_id).update({ "BillUrl": `https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/BillsV2%2F${context.params.order_id}?alt=media` })
      await page.close();
      return await browser.close();

    }

  })














function nowdate() {

  let d = new Date();
  let weekday = new Array(7);
  weekday[0] = "Sun";
  weekday[1] = "Mon";
  weekday[2] = "Tue";
  weekday[3] = "Wed";
  weekday[4] = "Thur";
  weekday[5] = "Fri";
  weekday[6] = "Sat";







  let today = new Date();
  let currentOffset = today.getTimezoneOffset();
  let ISTOffset = 330;
  today = new Date(today.getTime() + (ISTOffset + currentOffset) * 60000);

  let day = weekday[today.getDay()]
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }

  if (mm < 10) {
    mm = '0' + mm;
  }


  today = yyyy + '/' + mm + '/' + dd;//`${day}, ${dd} ${mm} ${yyyy}` //
  return today;
}