var admin = require("firebase-admin");

admin.initializeApp();

//cold start
// const cold = require('./haris_functions/coldstart');
// exports.ColdStart = cold.ColdStart;

//haris

const cart = require("./haris_functions/cart");
exports.cart = cart.cart;
exports.DeleteCartAndAddPoints = cart.DeleteCartAndAddPoints;

const pay = require('./haris_functions/payment');
exports.payment = pay.payment;
exports.paymentcomplete_v2 = pay.paymentcomplete;
exports.OrderToMyCourese = pay.OrderToMyCourese;
exports.Order = pay.Order;
exports.CreateBill = pay.CreateBill;

const mycourse = require("./haris_functions/mycourse");
exports.mycourse = mycourse.mycourse;


//Library addig

const mock_test = require('./mock_test');
exports.MockTest = mock_test.MockTest;

const prev_year = require('./Previous_year');
exports.PreviousYear = prev_year.PreviousYear;

const study_mat = require('./study_materials');
exports.StudyMaterial = study_mat.StudyMaterial;

const net = require('./net');
exports.Net = net.Net;

const deg = require('./degree');
exports.Degree = deg.Degree;

const usr = require('./user');
exports.User = usr.User;

const skill = require('./skilled');
exports.SkilledCourse = skill.SkilledCourse;

const course = require('./courses');
exports.Course = course.Course;

const discus = require('./discussion');
exports.Discussion = discus.Discussion;

const banner = require('./banner');
exports.Banner = banner.Banner;

const coupon = require('./coupon');
exports.Coupon = coupon.Coupon;

const notification = require('./notification');
exports.Notification = notification.Notification;

const certificate = require('./degreecertificates');
exports.degreecertificates = certificate.degreecertificates;

const cert = require('./certificate');
exports.Certificate = cert.Certificate;


//trigger adding
const trigger = require('./triggers');
exports.Discussion_UserName_Update = trigger.Discussion_UserName_Update;
exports.pushNotification = trigger.pushNotification;
exports.CourseComplete = trigger.CourseComplete;
exports.UserRoutine = trigger.UserRoutine;
// video image delete
exports.LifeStylePreviewDelete = trigger.LifeStylePreviewDelete;
exports.LifeStyleTopicDelete = trigger.LifeStyleTopicDelete;
exports.SkilledPreviewDelete = trigger.SkilledPreviewDelete;
exports.SkilledTopicDelete = trigger.SkilledTopicDelete;
exports.NetPreviewDelete = trigger.NetPreviewDelete;
exports.NetTopicDelete = trigger.NetTopicDelete;
exports.DegreePreviewDelete = trigger.DegreePreviewDelete;
exports.DegreeTopicDelete = trigger.DegreeTopicDelete;
//all delete
exports.LifeStyle_CourseDelete_AllDelete = trigger.LifeStyle_CourseDelete_AllDelete;
exports.Skilled_CourseDelete_AllDelete = trigger.Skilled_CourseDelete_AllDelete;
exports.Net_CourseDelete_AllDelete = trigger.Net_CourseDelete_AllDelete;
exports.Net_SubDelete_AllDelete = trigger.Net_SubDelete_AllDelete;
exports.Degree_CourseDelete_AllDelete = trigger.Degree_CourseDelete_AllDelete;
exports.Degree_SubDelete_AllDelete = trigger.Degree_SubDelete_AllDelete;
// Image resize
exports.BannerImageResize = trigger.BannerImageResize;
exports.NetTopicImageResize = trigger.NetTopicImageResize;
exports.NetPreviewImageResize = trigger.NetPreviewImageResize;
exports.DegreeTopicImageResize = trigger.DegreeTopicImageResize;
exports.DegreePreviewImageResize = trigger.DegreePreviewImageResize;
exports.SkilledTopicImageResize = trigger.SkilledTopicImageResize;
exports.SkilledPreviewImageResize = trigger.SkilledPreviewImageResize;
exports.LifeStyleTopicImageResize = trigger.LifeStyleTopicImageResize;
exports.LifeStylePreviewImageResize = trigger.LifeStylePreviewImageResize;

//integration
const integration = require('./integration');
exports.Integration = integration.Integration;



