const functions = require('firebase-functions');
const axios = require('axios');



exports.ColdStart = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  console.log('This will be run every 1 minutes!');

  try {
    callAPIs();

    await delay(6000);
    callAPIs();

    await delay(6000);
    callAPIs();

    await delay(6000);
    callAPIs();

    await delay(6000);
    callAPIs();

    await delay(6000);
    callAPIs();

    await delay(6000);
    callAPIs();

    await delay(6000);
    callAPIs();

    await delay(6000);
    callAPIs();

    // await delay(6000);
    // callAPIs();

    // await delay(6000);
    // callAPIs();

    // await delay(6000);
    // callAPIs();

    // await delay(6000);
    // callAPIs();

    // await delay(6000);
    // callAPIs();

    // await delay(6000);
    // callAPIs();

    // await delay(6000);
    // callAPIs();

    // await delay(6000);
    // callAPIs();

    // await delay(6000);
    // callAPIs();

    return functions.logger.log("All API's Finished");
  }
  catch (error) {
    functions.logger.error(error);
  }

});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function callAPIs() {

  return axios.all([
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/Banner", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/Coupon", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/Course", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/Degree", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/degreecertificates", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/Discussion", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/MockTest", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/Net", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/Notification", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/PreviousYear", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/SkilledCourse", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/StudyMaterial", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/User", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/cart", { blahblah: "blahblah" }),
    axios.post("https://us-central1-estudo-af035.cloudfunctions.net/mycourse", { blahblah: "blahblah" }),
    // axios.post("https://us-central1-estudo-af035.cloudfunctions.net/payment", { blahblah: "blahblah" }),
    // axios.post("https://us-central1-estudo-af035.cloudfunctions.net/paymentcomplete", { blahblah: "blahblah" }),
    // axios.post("https://us-central1-estudo-af035.cloudfunctions.net/OrderToMyCourese", { blahblah: "blahblah" }),

  ]).then(axios.spread((response1, response2, response3, response4, response5, response6, response7, response8, response9, response10, response11, response12, response13, response14, response15) => {

    return functions.logger.log("Finished")

  })).catch(error => {
    return functions.logger.error(error.response.data);
  });


}