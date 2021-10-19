const functions = require('firebase-functions');
const admin = require("firebase-admin");

// admin.initializeApp();

const db = admin.firestore();
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();



const path = require('path');
const os = require('os');
const fs = require('fs');
const fetch = require("node-fetch");



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

    //   const idToken = req.body.token;

    try {
        //   const decodedToken = await admin.auth().verifyIdToken(idToken);
        //   console.log(decodedToken.uid);


        //   req.body.userid = decodedToken.uid;
        //   req.body.token = decodedToken.uid;
        // req.body.token = req.body.userid;

        return next();
    } catch (err) {
        functions.logger.error(err);
        req.body.userid = "";
        return res.json({ "message": "token not verified", "error": err });
    }
}


const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')

async function createPdf() {
    const pdfDoc = await PDFDocument.create()
    const fonts = [
        "Courier",
        "CourierBold",
        "CourierBoldOblique",
        "CourierOblique",
        "Helvetica",
        "HelveticaBold",
        "HelveticaBoldOblique",
        "HelveticaOblique",
        "TimesRoman",
        "TimesRomanBold",
        "TimesRomanBoldItalic",
        "TimesRomanItalic",
    ]
    let tFonts = [];
    for (let index = 0; index < fonts.length; index++) {
        const element = fonts[index];
        const test = await pdfDoc.embedFont(StandardFonts[element])
        // console.log(test)
        // console.log("_____________________________________________________________________________________________________________________________")
        tFonts.push(test)

    }
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts["Symbol"])
    const CourierBold = await pdfDoc.embedFont(StandardFonts["CourierBold"])
    let testfonst = []
    testfonst.push(timesRomanFont); testfonst.push(CourierBold);
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const fontSize = 20;
    let i = height - 65
    for (let index = 0; index < fonts.length; index++) {
        const element = fonts[index];
        console.log(index)//"abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        page.drawText(`-=0123456789/ !@#$%^&*()_+{}[];'\:"|,./<>?`, {
            x: 50,
            y: i,
            size: fontSize,
            font: tFonts[index],
            color: rgb(0, 0, 0),
        })
        //   page.drawText(element, {
        //     x: 50+200,
        //     y: i,
        //     size: fontSize,
        //     font: testfonst[1],//tFonts[index],
        //     color: rgb(0, 0, 0),
        //   })
        i -= 65
    }


    // const pdfBytes = await pdfDoc.save()
    fs.writeFileSync('./FontsForEstudo.pdf', await pdfDoc.save());

}


app.get('/generatingcert', async (req, res) => {

    createPdf();
    res.json(true)

})


app.post('/generatingcertificatefortesting', async (req, res) => {

    try {

        const url = 'https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/generatecert?alt=media'
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        const font = await pdfDoc.embedFont(StandardFonts[req.body.font])

        const pages = pdfDoc.getPages()
        const firstPage = pages[0]
        // const { width, height } = firstPage.getSize()
        firstPage.drawText(req.body.name, {
            x: Number(req.body.namex),
            y: Number(req.body.namey),
            size: Number(req.body.fontsizename),
            font: font,
            color: rgb(0, 0, 0),
        })
        firstPage.drawText("21/04/21", {
            x: Number(req.body.datex),
            y: Number(req.body.datey),
            size: Number(req.body.fontsizedate),
            font: font,
            color: rgb(0, 0, 0),
        })

        // const pdfBytes = await pdfDoc.save()
        console.log("12")
        const tmpdir = os.tmpdir();
        const filepath = path.join(tmpdir, "generatedcert");
        const bucket = "gs://estudo-admin.appspot.com";
        fs.writeFileSync(filepath, await pdfDoc.save());


        storage.bucket(bucket).upload(filepath, {
            destination: `generatedcert`,
            metadata: {
                contentType: "application/pdf",
            }
        })
            .then(sna => {
                console.log("12")
                return res.json(true)
            })
            .catch(err => {
                functions.logger.error(err);
                return res.status(400).json(false)
            })

    } catch (error) {
        console.log(error)
        return res.status(400).json(false)
    }





})


exports.degreecertificates = functions.https.onRequest(app);





// app.post('/ProfilePicUpload', async (req, res) => {

//     let base64 = req.body.ProfileUrl;


//     let t = Date.now();
//     // postinsertdata.index=t;  

//     // postinsertdata.image_url = `https://firebasestorage.googleapis.com/v0/b/tagisto-bab43.appspot.com/o/Posts%2F${req.body.userid}%2F${t}?alt=media`;
//     let profile_url = `https://firebasestorage.googleapis.com/v0/b/tagisto-bab43.appspot.com/o/${req.body.userid}%2Fprofile_url${t}?alt=media`;




//     const tmpdir = os.tmpdir();
//     const filepath = path.join(tmpdir, "000.jpg");
//     const bucket= "gs://tagisto-bab43.appspot.com";

//     await fs.writeFile(filepath, base64 , "base64", function (err){
//       console.log('File created',err);
//     });
//     imfformat='image/'+"jpeg"
//     //var folder=`Posts/req.body.userid/${t}`
//     var folder= req.body.userid


//     storage.bucket(bucket).upload(filepath, {
//         destination: `${folder}/profile_url${t}`,
//         metadata: {
//           contentType: imfformat,
//        }
//     })
//     .then(sna=>{
//       return db.collection("Influencer").doc(req.body.userid).set({"ProfileUrl":profile_url},{"merge":true})
//     })
//     .then(sna=>{
//       return res.json(true);
//     })
//     .catch(err=>{
//       functions.logger.error(err);
//       return res.status(400).json(false)
//     })


// });


