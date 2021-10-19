//Coupons


const functions = require('firebase-functions');

var admin = require("firebase-admin");

const db = admin.firestore();

//express portion
var express = require('express');
var cors = require('cors');
const { cart } = require('./haris_functions/cart');

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

let coupon = express();
coupon.use(cors({ origin: true }));
// coupon.use(decodeIDToken);
coupon.use(cold_start)

coupon.post('/List', async (req, res) => {
    let userid = req.body.userid;
    let appliedCoupons = req.body.appliedCoupons;


    if (appliedCoupons.length === 0) {
        //First Time

        const offers = await db.collection('Offers').where('Active', '==', true).where('ExpireDate', '>=', exp_nowdate()).get();
        console.log(offers.size)
        let Net_Promises_Combo = [];
        let Net_Promises_Indi = [];
        let Mock_Promises_Combo = [];
        let Mock_Promises_Indi = [];
        let Study_Promises_Combo = [];
        let Study_Promises_Indi = [];
        let Degree_Promises_Combo = [];
        let Degree_Promises_Indi = [];
        let Degree_Promises_Num = [];
        offers.forEach(offer => {
            if (offer.data().Type === 'net' || offer.data().Type === 'skilled' || offer.data().Type === 'course') {
                let conv_type = 'net';
                if (offer.data().Type === 'skilled') {
                    conv_type = 'Skilled_Courses'
                } else if (offer.data().Type === 'course') {
                    conv_type = 'Courses';
                }
                if (offer.data().OfferType === 'Combo') {
                    Net_Promises_Combo.push(db.collection('Users').doc(userid).collection('Cart').where('type', '==', conv_type).where('category', '==', 'Courses').where('courseid', 'in', offer.data().Papers).get())
                } else {
                    Net_Promises_Indi.push(db.collection('Users').doc(userid).collection('Cart').where('type', '==', conv_type).where('category', '==', 'Courses').where('courseid', 'in', offer.data().Papers).get());
                }
            } else if (offer.data().Type === 'mock') {
                if (offer.data().OfferType === 'Combo') {
                    Mock_Promises_Combo.push(db.collection('Users').doc(userid).collection('Cart').where('category', '==', 'Mock_Test').where('courseid', 'in', offer.data().Papers).get())
                } else {
                    Mock_Promises_Indi.push(db.collection('Users').doc(userid).collection('Cart').where('category', '==', 'Mock_Test').where('courseid', 'in', offer.data().Papers).get());
                }
            } else if (offer.data().Type === 'study') {
                if (offer.data().OfferType === 'Combo') {
                    Study_Promises_Combo.push(db.collection('Users').doc(userid).collection('Cart').where('category', '==', 'Study_Materials').where('courseid', 'in', offer.data().Papers).get())
                } else {
                    Study_Promises_Indi.push(db.collection('Users').doc(userid).collection('Cart').where('category', '==', 'Study_Materials').where('courseid', 'in', offer.data().Papers).get());
                }
            } else if (offer.data().Type === 'degree') {
                if (offer.data().OfferType === 'Combo') {
                    Degree_Promises_Combo.push(db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'degree').where('courseid', '==', offer.data().Degree_Id).where('subjectid', 'in', offer.data().Papers).get())
                } else if (offer.data().OfferType === 'Individual') {
                    Degree_Promises_Indi.push(db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'degree').where('courseid', '==', offer.data().Degree_Id).where('subjectid', 'in', offer.data().Papers).get());
                } else if (offer.data().OfferType === 'Numbered') {
                    Degree_Promises_Num.push(db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'degree').where('courseid', '==', offer.data().Degree_Id).get());
                }
            }
        })
        let data = [];
        let temp = {};

        const Net_Data_Combo = await Promise.all(Net_Promises_Combo);
        const Net_Data_Indi = await Promise.all(Net_Promises_Indi);
        const Mock_Data_Combo = await Promise.all(Mock_Promises_Combo);
        const Mock_Data_Indi = await Promise.all(Mock_Promises_Indi);
        const Study_Data_Combo = await Promise.all(Study_Promises_Combo);
        const Study_Data_Indi = await Promise.all(Study_Promises_Indi);
        const Degree_Data_Combo = await Promise.all(Degree_Promises_Combo);
        const Degree_Data_Indi = await Promise.all(Degree_Promises_Indi);
        const Degree_Data_Num = await Promise.all(Degree_Promises_Num);
        // Net_Data_Combo.forEach(doc => {
        //     console.log(doc.docs[0].data());
        // })
        let net_combo_count = 0;
        let net_indi_count = 0;
        let mock_combo_count = 0;
        let mock_indi_count = 0;
        let study_combo_count = 0;
        let study_indi_count = 0;
        let degree_combo_count = 0;
        let degree_indi_count = 0;
        let degree_num_count = 0;

        let index = 0;
        offers.forEach((offer) => {
            if (offer.data().Type === 'net' || offer.data().Type === 'skilled' || offer.data().Type === 'course') {
                if (offer.data().OfferType === 'Combo') {
                    console.log('combo entered')
                    if (Net_Data_Combo[net_combo_count] !== undefined) {
                        // console.log(Net_Data_Combo[net_combo_count].docs.length)
                        // let combo_flag = true;
                        // Net_Data_Combo[net_combo_count].docs.forEach(doc => {
                        //     if (doc === undefined) {
                        //         combo_flag = false;
                        //     }
                        // })
                        if (Net_Data_Combo[net_combo_count].docs.length === offer.data().Papers.length) { //&& combo_flag
                            temp = {
                                "docid": offer.id,
                                "title": offer.data().Name,
                                "description": offer.data().Description,
                                "imageurl": offer.data().ImgUrl,
                                "couponcode": offer.data().CouponCode,
                                "discount": offer.data().Discount,
                                "type": offer.data().Type,
                                "offertype": offer.data().OfferType,
                                "papers": offer.data().Papers,
                                "isapplied": false,
                                "index": index
                            }
                            data.push(temp);
                            index += 1;

                        }
                    }

                    net_combo_count += 1;
                } else {
                    console.log('Indi Entered')
                    if (Net_Data_Indi[net_indi_count] !== undefined) {
                        if (Net_Data_Indi[net_indi_count].docs[0] !== undefined) {
                            temp = {
                                "docid": offer.id,
                                "title": offer.data().Name,
                                "description": offer.data().Description,
                                "imageurl": offer.data().ImgUrl,
                                "couponcode": offer.data().CouponCode,
                                "discount": offer.data().Discount,
                                "type": offer.data().Type,
                                "offertype": offer.data().OfferType,
                                "papers": offer.data().Papers,
                                "isapplied": false,
                                "index": index
                            }
                            // console.log(temp)
                            data.push(temp);
                            index += 1;

                        }
                    }
                    net_indi_count += 1;
                }
            } else if (offer.data().Type === 'mock') {
                if (offer.data().OfferType === 'Combo') {
                    console.log('mock combo entered')
                    if (Mock_Data_Combo[mock_combo_count] !== undefined) {
                        // console.log(Net_Data_Combo[net_combo_count].docs.length)
                        // let combo_flag = true;
                        // Net_Data_Combo[net_combo_count].docs.forEach(doc => {
                        //     if (doc === undefined) {
                        //         combo_flag = false;
                        //     }
                        // })
                        if (Mock_Data_Combo[mock_combo_count].docs.length === offer.data().Papers.length) { //&& combo_flag
                            temp = {
                                "docid": offer.id,
                                "title": offer.data().Name,
                                "description": offer.data().Description,
                                "imageurl": offer.data().ImgUrl,
                                "couponcode": offer.data().CouponCode,
                                "discount": offer.data().Discount,
                                "type": offer.data().Type,
                                "offertype": offer.data().OfferType,
                                "papers": offer.data().Papers,
                                "isapplied": false,
                                "index": index
                            }
                            data.push(temp);
                            index += 1;

                        }
                    }

                    mock_combo_count += 1;
                } else {
                    console.log('Mock Indi Entered')
                    if (Mock_Data_Indi[mock_indi_count] !== undefined) {
                        if (Mock_Data_Indi[mock_indi_count].docs[0] !== undefined) {
                            temp = {
                                "docid": offer.id,
                                "title": offer.data().Name,
                                "description": offer.data().Description,
                                "imageurl": offer.data().ImgUrl,
                                "couponcode": offer.data().CouponCode,
                                "discount": offer.data().Discount,
                                "type": offer.data().Type,
                                "offertype": offer.data().OfferType,
                                "papers": offer.data().Papers,
                                "isapplied": false,
                                "index": index
                            }
                            // console.log(temp)
                            data.push(temp);
                            index += 1;

                        }
                    }
                    mock_indi_count += 1;
                }
            } else if (offer.data().Type === 'study') {
                if (offer.data().OfferType === 'Combo') {
                    console.log('study combo entered')
                    if (Study_Data_Combo[study_combo_count] !== undefined) {
                        // console.log(Net_Data_Combo[net_combo_count].docs.length)
                        // let combo_flag = true;
                        // Net_Data_Combo[net_combo_count].docs.forEach(doc => {
                        //     if (doc === undefined) {
                        //         combo_flag = false;
                        //     }
                        // })
                        if (Study_Data_Combo[study_combo_count].docs.length === offer.data().Papers.length) { //&& combo_flag
                            temp = {
                                "docid": offer.id,
                                "title": offer.data().Name,
                                "description": offer.data().Description,
                                "imageurl": offer.data().ImgUrl,
                                "couponcode": offer.data().CouponCode,
                                "discount": offer.data().Discount,
                                "type": offer.data().Type,
                                "offertype": offer.data().OfferType,
                                "papers": offer.data().Papers,
                                "isapplied": false,
                                "index": index
                            }
                            data.push(temp);
                            index += 1;

                        }
                    }

                    study_combo_count += 1;
                } else {
                    console.log('Mock Indi Entered')
                    if (Study_Data_Indi[study_indi_count] !== undefined) {
                        if (Study_Data_Indi[study_indi_count].docs[0] !== undefined) {
                            temp = {
                                "docid": offer.id,
                                "title": offer.data().Name,
                                "description": offer.data().Description,
                                "imageurl": offer.data().ImgUrl,
                                "couponcode": offer.data().CouponCode,
                                "discount": offer.data().Discount,
                                "type": offer.data().Type,
                                "offertype": offer.data().OfferType,
                                "papers": offer.data().Papers,
                                "isapplied": false,
                                "index": index
                            }
                            // console.log(temp)
                            data.push(temp);
                            index += 1;

                        }
                    }
                    study_indi_count += 1;
                }
            } else if (offer.data().Type === 'degree') {
                if (offer.data().OfferType === 'Combo') {
                    console.log('degree combo entered')
                    if (Degree_Data_Combo[degree_combo_count] !== undefined) {
                        // console.log(Net_Data_Combo[net_combo_count].docs.length)
                        // let combo_flag = true;
                        // Net_Data_Combo[net_combo_count].docs.forEach(doc => {
                        //     if (doc === undefined) {
                        //         combo_flag = false;
                        //     }
                        // })
                        if (Degree_Data_Combo[degree_combo_count].docs.length === offer.data().Papers.length) { //&& combo_flag
                            temp = {
                                "docid": offer.id,
                                "title": offer.data().Name,
                                "description": offer.data().Description,
                                "imageurl": offer.data().ImgUrl,
                                "couponcode": offer.data().CouponCode,
                                "discount": offer.data().Discount,
                                "type": offer.data().Type,
                                "offertype": offer.data().OfferType,
                                "degreeid": offer.data().Degree_Id,
                                "papers": offer.data().Papers,
                                "isapplied": false,
                                "index": index
                            }
                            data.push(temp);
                            index += 1;

                        }
                    }

                    degree_combo_count += 1;
                } else if (offer.data().OfferType === 'Individual') {
                    console.log('degree Indi Entered')
                    if (Degree_Data_Indi[degree_indi_count] !== undefined) {
                        if (Degree_Data_Indi[degree_indi_count].docs[0] !== undefined) {
                            temp = {
                                "docid": offer.id,
                                "title": offer.data().Name,
                                "description": offer.data().Description,
                                "imageurl": offer.data().ImgUrl,
                                "couponcode": offer.data().CouponCode,
                                "discount": offer.data().Discount,
                                "type": offer.data().Type,
                                "offertype": offer.data().OfferType,
                                "degreeid": offer.data().Degree_Id,
                                "papers": offer.data().Papers,
                                "isapplied": false,
                                "index": index
                            }
                            // console.log(temp)
                            data.push(temp);
                            index += 1;

                        }
                    }
                    degree_indi_count += 1;
                } else {
                    console.log('degree num entered')
                    if (Degree_Data_Num[degree_num_count] !== undefined) {
                        // console.log(Net_Data_Combo[net_combo_count].docs.length)
                        // let combo_flag = true;
                        // Net_Data_Combo[net_combo_count].docs.forEach(doc => {
                        //     if (doc === undefined) {
                        //         combo_flag = false;
                        //     }
                        // })
                        if (Degree_Data_Num[degree_num_count].docs.length >= Number(offer.data().Subject_Count)) { //&& combo_flag
                            temp = {
                                "docid": offer.id,
                                "title": offer.data().Name,
                                "description": offer.data().Description,
                                "imageurl": offer.data().ImgUrl,
                                "couponcode": offer.data().CouponCode,
                                "discount": offer.data().Discount,
                                "type": offer.data().Type,
                                "offertype": offer.data().OfferType,
                                "degreeid": offer.data().Degree_Id,
                                "subjectcount": offer.data().Subject_Count,
                                "isapplied": false,
                                "index": index
                            }
                            data.push(temp);
                            index += 1;

                        }
                    }

                    degree_num_count += 1;
                }
            }
        })
        let Data_Res = {};
        Data_Res.appliedCoupons = [];
        Data_Res.data = data;
        Data_Res.backup = data;
        res.json(Data_Res);


    } else {
        //Check
        let Data_Res = {};
        Data_Res.appliedCoupons = appliedCoupons;
        const backup = req.body.backup;

        let data = [];
        backup.forEach(doc => {
            data.push(doc);
        })

        const net_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'net').where('category', '==', 'Courses').get();
        const skilled_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'Skilled_Courses').where('category', '==', 'Courses').get();
        const life_style_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'Courses').where('category', '==', 'Courses').get();
        const mock_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'net').where('category', '==', 'Mock_Test').get();
        const study_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'net').where('category', '==', 'Study_Materials').get();
        const degree_data = await db.collection('Users').doc(userid).collection('Cart').where('type', '==', 'degree').get();

        Data_Res.appliedCoupons.forEach(coupon => {
            data.splice(coupon.index, 1);
        });

        Data_Res.appliedCoupons.forEach(coupon => {
            // data.splice(coupon.index, 1);
            if (coupon.type === 'net') {
                if (coupon.offertype === 'Combo') {
                    let index = 0;
                    data.forEach(offer => {
                        if (offer.type === 'net' && offer.offertype === 'Combo') {
                            let net_flag = false;
                            coupon.papers.forEach(id => {
                                if (offer.papers.includes(id)) {
                                    net_flag = true;
                                }
                            })
                            if (net_flag) {
                                data.splice(index, 1);
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
                                data.splice(index, 1);
                            }
                        }
                        index += 1;
                    })
                } else {
                    let index = 0;
                    data.forEach(offer => {
                        if (offer.type === 'net' && offer.offertype === 'Combo') {
                            let net_flag = false;
                            coupon.papers.forEach(id => {
                                if (offer.papers.includes(id)) {
                                    net_flag = true;
                                }
                            })
                            if (net_flag) {
                                data.splice(index, 1);
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
                                data.splice(index, 1);
                            }
                        }
                        index += 1;
                    })
                }
            } else if (coupon.type === 'skilled') {
                let index = 0;
                data.forEach(offer => {
                    if (offer.type === 'skilled' && offer.offertype === 'Combo') {
                        let net_flag = false;
                        coupon.papers.forEach(id => {
                            if (offer.papers.includes(id)) {
                                net_flag = true;
                            }
                        })
                        if (net_flag) {
                            data.splice(index, 1);
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
                            data.splice(index, 1);
                        }
                    }
                    index += 1;
                })
            } else if (coupon.type === 'course') {
                let index = 0;
                data.forEach(offer => {
                    if (offer.type === 'course' && offer.offertype === 'Combo') {
                        let net_flag = false;
                        coupon.papers.forEach(id => {
                            if (offer.papers.includes(id)) {
                                net_flag = true;
                            }
                        })
                        if (net_flag) {
                            data.splice(index, 1);
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
                            data.splice(index, 1);
                        }
                    }
                    index += 1;
                })
            } else if (coupon.type === 'mock') {
                let index = 0;
                data.forEach(offer => {
                    if (offer.type === 'mock' && offer.offertype === 'Combo') {
                        let net_flag = false;
                        coupon.papers.forEach(id => {
                            if (offer.papers.includes(id)) {
                                net_flag = true;
                            }
                        })
                        if (net_flag) {
                            data.splice(index, 1);
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
                            data.splice(index, 1);
                        }
                    }
                    index += 1;
                })
            } else if (coupon.type === 'study') {
                console.log("Chech study entered")
                let index = 0;
                data.forEach(offer => {
                    if (offer.type === 'study' && offer.offertype === 'Combo') {
                        let net_flag = false;
                        coupon.papers.forEach(id => {
                            if (offer.papers.includes(id)) {
                                net_flag = true;
                            }
                        })
                        console.log(net_flag);
                        if (net_flag) {
                            data.splice(index, 1);
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
                            data.splice(index, 1);
                        }
                    }
                    index += 1;
                })
            } else if (coupon.type === 'degree') {
                if (coupon.offertype === 'Combo' || coupon.offertype === 'Individual') {
                    console.log("Chech study entered")
                    let index = 0;
                    data.forEach(offer => {
                        if (offer.type === 'degree' && offer.offertype === 'Combo' && offer.degreeid === coupon.degreeid) {
                            let net_flag = false;
                            coupon.papers.forEach(id => {
                                if (offer.papers.includes(id)) {
                                    net_flag = true;
                                }
                            })
                            console.log(net_flag);
                            if (net_flag) {
                                data.splice(index, 1);
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
                                data.splice(index, 1);
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
                                    data.splice(index, 1);
                                }
                            } else {
                                let count = 0;
                                degree_data.forEach(doc => {
                                    if (doc.data().courseid === coupon.degreeid && coupon.papers.includes(doc.data().subjectid)) {
                                        count += 1;
                                    }
                                })
                                if ((count - coupon.papers.length) < offer.subjectcount) {
                                    data.splice(index, 1);
                                }
                            }
                        }
                        index += 1;
                    })
                } else {
                    console.log("Chech study entered")
                    let index = 0;
                    data.forEach(offer => {
                        if (offer.type === 'degree' && offer.offertype === 'Combo' && offer.degreeid === coupon.degreeid) {
                            let count = 0;
                            degree_data.forEach(doc => {
                                if (doc.data().courseid === offer.degreeid) {
                                    count += 1;
                                }
                            })
                            if ((count - offer.papers.length) < coupon.subjectcount) {
                                data.splice(index, 1);
                            }
                        } else if (offer.type === 'degree' && offer.offertype === 'Individual' && offer.degreeid === coupon.degreeid) {
                            let count = 0;
                            degree_data.forEach(doc => {
                                if (doc.data().courseid === offer.degreeid && offer.papers.includes(doc.data().subjectid)) {
                                    count += 1;
                                }
                            })
                            if ((count - offer.papers.length) < coupon.subjectcount) {
                                data.splice(index, 1);
                            }
                        } else if (offer.type === 'degree' && offer.offertype === 'Numbered' && offer.degreeid === coupon.degreeid) {
                            // let count = 0;
                            // degree_data.forEach(doc => {
                            //     if (doc.data().courseid === offer.degreeid) {
                            //         count += 1;
                            //     }
                            // })
                            // if (count < (offer.subjectcount + coupon.subjectcount)) {
                            data.splice(index, 1);
                            // }
                        }
                        index += 1;
                    })
                }
            }
        })
        Data_Res.appliedCoupons.forEach(coupon => {
            let temp = coupon;
            temp.isapplied = true;
            data.unshift(temp);
        });
        res.json({
            appliedCoupons: Data_Res.appliedCoupons,
            data: data,
            backup: backup
        });
    }

})


exports.Coupon = functions.https.onRequest(coupon);


function exp_nowdate() {

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


    today = yyyy + '-' + mm + '-' + dd;//`${day}, ${dd} ${mm} ${yyyy}` //
    return today;
}