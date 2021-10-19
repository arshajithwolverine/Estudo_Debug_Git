const functions = require('firebase-functions');
const admin = require("firebase-admin");

admin.initializeApp();

const payment = require("./payment");
exports.payment = payment.payment;
exports.paymentcomplete = payment.paymentcomplete;
exports.OrderToMyCourese = payment.OrderToMyCourese;

const cart = require("./cart");
exports.cart = cart.cart;

const mycourse = require("./mycourse");
exports.mycourse = mycourse.mycourse;

const degreecertificates = require("./degreecertificates");
exports.degreecertificates = degreecertificates.degreecertificates;
