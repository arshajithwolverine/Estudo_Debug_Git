//Triggers


const functions = require('firebase-functions');

var admin = require("firebase-admin");

const db = admin.firestore();
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

exports.Discussion_UserName_Update = functions.firestore.document('Users/{userid}').onWrite(async (change, context) => {
    const data = change.after.data();
    const previousData = change.before.data();

    if (data.name !== previousData.name) {
        let snapshot = await db.collection('Discussion').get();
        snapshot.forEach(snap => {
            db.collection('Discussion').doc(snap.id).collection('Query').where('userid', '==', context.params.userid).update({
                username: data.name
            }).then(() => {
                return console.log("Updated");
            }).catch(e => {
                console.log(e)
            });
        })

    }

});



exports.pushNotification = functions.firestore
    .document('Notification/{docid}')
    .onCreate(async (snap, context) => {
        console.log('Push notification event triggered');

        //  Get the current value of what was written to the Realtime Database.
        const newValue = snap.data();

        if (newValue.General) {
            // Create a notification
            const payload = {
                notification: {
                    title: newValue.Name,
                    body: newValue.Notification,
                    sound: "default"
                }
            };

            //Create an options object that contains the time to live for the notification and the priority
            const options = {
                priority: "high",
                timeToLive: 60 * 60 * 24
            };

            admin.messaging().sendToTopic("pushNotifications", payload, options);
        } else {
            let myCourseId;
            const type = newValue.Type;
            if (type === 'degree') {
                myCourseId = newValue.SubjectId;
            } else {
                myCourseId = newValue.CourseId;
            }
            const userCollection = await db.collection('Users').get();
            const promises = [];
            const userIds = [];
            userCollection.forEach(user => {
                userIds.push(user.id);
                promises.push(db.collection('Users').doc(user.id).collection('Mycourse').doc(myCourseId).get());
            });
            const myCourseCollection = await Promise.all(promises);
            let index = 0;
            myCourseCollection.forEach(doc => {
                if (doc.exists) {
                    // Create a notification
                    const payload = {
                        notification: {
                            title: newValue.Name,
                            body: newValue.Notification,
                            sound: "default"
                        }
                    };

                    //Create an options object that contains the time to live for the notification and the priority
                    const options = {
                        priority: "high",
                        timeToLive: 60 * 60 * 24
                    };

                    admin.messaging().sendToTopic(userIds[index], payload, options);
                }
                index += 1;
            })
        }

    });

//course complete certificate for skilled and course
const path = require('path');
const os = require('os');
const fs = require('fs');
const fetch = require("node-fetch");
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

exports.CourseComplete = functions.firestore.document('Users/{userid}/Mycourse/{mycourseid}/Viewed_Topics/{topicid}').onWrite(async (change, context) => {
    let userid = context.params.userid;
    let courseid = context.params.mycourseid;
    let topicid = context.params.topicid;

    let mycourse_data = await db.collection('Users').doc(userid).collection('Mycourse').doc(courseid).get();
    let type = mycourse_data.data().type;

    let course_topics = await db.collection(`${type}`).doc(courseid).collection('Topic').get();
    let viewed_topics = await db.collection('Users').doc(userid).collection('Mycourse').doc(courseid).collection('Viewed_Topics').get();

    let course_topc_ids = [];
    let viewd_topic_ids = [];

    course_topics.forEach(topic => {
        course_topc_ids.push(topic.id);
    })

    viewed_topics.forEach(topic => {
        viewd_topic_ids.push(topic.id);
    })

    let isfinished = true;
    course_topc_ids.forEach(id => {
        if (!viewd_topic_ids.includes(id)) {
            isfinished = false;
        }
    })

    let course_data = await db.collection(`${type}`).doc(courseid).get();

    if (isfinished === true && course_data.data().Certificate_Flag === true) {
        let user_data = await db.collection('Users').doc(userid).get();
        //generate certificate
        try {

            const url = course_data.data().Certificate.PdfUrl;
            const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
            let bytes = new Uint8Array(existingPdfBytes);
            const pdfDoc = await PDFDocument.load(bytes)
            const font = await pdfDoc.embedFont(StandardFonts[course_data.data().Certificate.Font])

            const pages = pdfDoc.getPages()
            const firstPage = pages[0]
            // const { width, height } = firstPage.getSize()
            const textWidth = font.widthOfTextAtSize(user_data.data().name, Number(course_data.data().Certificate.FforName));
            const textHeight = font.heightAtSize(Number(course_data.data().Certificate.FforName));

            firstPage.drawText(String(user_data.data().name), {
                x: Number(course_data.data().Certificate.XforName) - textWidth / 2,
                y: Number(course_data.data().Certificate.YforName) - textHeight / 2,
                size: Number(course_data.data().Certificate.FforName),
                font: font,
                color: rgb(0, 0, 0),
            })
            const issued_date = nowDate();
            firstPage.drawText(String(issued_date), {
                x: Number(course_data.data().Certificate.XforDate),
                y: Number(course_data.data().Certificate.YforDate),
                size: Number(course_data.data().Certificate.FforDate),
                font: font,
                color: rgb(0, 0, 0),
            })

            // const pdfBytes = await pdfDoc.save()
            console.log("12")
            const tmpdir = os.tmpdir();
            const filepath = path.join(tmpdir, "file");
            const bucket = "gs://estudo-admin.appspot.com";
            fs.writeFileSync(filepath, await pdfDoc.save());

            let pdfurl = `https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/Certificate%2FIssued%2F${userid}%2F${courseid}?alt=media`;
            storage.bucket(bucket).upload(filepath, {
                destination: `Certificate/Issued/${userid}/${courseid}`,
                metadata: {
                    contentType: "application/pdf",
                }
            })
                .then(sna => {
                    console.log("Certificate Generated and Storage Uploaded");
                    db.collection('Users').doc(userid).collection('Mycourse').doc(courseid).update({
                        CertificateUrl: pdfurl,
                        HasCert: true,
                        CertIssuedDate: issued_date

                    }).then(doc => {
                        return console.log("Certificate Url Saved")
                    }).catch(e => {
                        console.log(e);
                        console.log("Certificate Url not Saved")
                    })
                })
                .catch(err => {
                    console.log(err);
                    console.log("Certificate Not Generated and Not Storage Uploaded")
                })

        } catch (error) {
            console.log(error);
            console.log("Certificate Not generated")
        }

    }

})


//current date
function nowDate() {
    let date = new Date();
    let currentOffset = date.getTimezoneOffset();
    let ISTOffset = 330;
    date = new Date(date.getTime() + (ISTOffset + currentOffset) * 60000);


    let date_day = date.getDate();
    let date_month = date.getMonth() + 1;
    if (Number(date_month) < 10) {
        date_month = '0' + String(date_month);
    }
    if (Number(date_day) < 10) {
        date_day = '0' + String(date_day);
    }
    let date_year = date.getFullYear();
    let date_string = String(date_day) + '/' + String(date_month) + '/' + String(date_year);
    return date_string;
}


//video delete triggers
//life style courses
exports.LifeStyle_CourseDelete_AllDelete = functions.firestore.document('Courses/{courseid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        const preview = await db.collection('Courses').doc(context.params.courseid).collection('Preview').get();
        preview.forEach(doc => {
            db.collection('Courses').doc(context.params.courseid).collection('Preview').doc(doc.id).delete();
        })
        const topic = await db.collection('Courses').doc(context.params.courseid).collection('Topic').get();
        topic.forEach(doc => {
            db.collection('Courses').doc(context.params.courseid).collection('Topic').doc(doc.id).delete();
        })
    }
})

exports.LifeStylePreviewDelete = functions.firestore.document('Courses/{courseid}/Preview/{previewid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (prevdata === undefined) {
        return;
    }
    if (newdata === undefined) {
        //delete video
        await deleteFromFileString(prevdata.videourl);
        await deleteFromFileString(prevdata.ImgUrl);
        return console.log('Both vid and image')
    }
    if (prevdata.videourl !== newdata.videourl) {
        await deleteFromFileString(prevdata.videourl);
        console.log(' vid  ')
    }
    if (prevdata.ImgUrl !== newdata.ImgUrl) {
        await deleteFromFileString(prevdata.ImgUrl);
        console.log(' Img  ')
    }
})


exports.LifeStyleTopicDelete = functions.firestore.document('Courses/{courseid}/Topic/{topicid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (prevdata === undefined) {
        return;
    }
    if (newdata === undefined) {
        //delete video
        await deleteFromFileString(prevdata.VideoUrl);
        await deleteFromFileString(prevdata.ImgUrl);
        return console.log('Both vid and image')
    }
    if (prevdata.VideoUrl !== newdata.VideoUrl) {
        await deleteFromFileString(prevdata.VideoUrl);
        console.log(' vid  ')
    }
    if (prevdata.ImgUrl !== newdata.ImgUrl) {
        await deleteFromFileString(prevdata.ImgUrl);
        console.log(' Img  ')
    }
})


//skilled courses
exports.Skilled_CourseDelete_AllDelete = functions.firestore.document('Skilled_Courses/{courseid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        const preview = await db.collection('Skilled_Courses').doc(context.params.courseid).collection('Preview').get();
        preview.forEach(doc => {
            db.collection('Skilled_Courses').doc(context.params.courseid).collection('Preview').doc(doc.id).delete();
        })
        const topic = await db.collection('Skilled_Courses').doc(context.params.courseid).collection('Topic').get();
        topic.forEach(doc => {
            db.collection('Skilled_Courses').doc(context.params.courseid).collection('Topic').doc(doc.id).delete();
        })
    }
})

exports.SkilledPreviewDelete = functions.firestore.document('Skilled_Courses/{courseid}/Preview/{previewid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (prevdata === undefined) {
        return;
    }
    if (newdata === undefined) {
        //delete video
        await deleteFromFileString(prevdata.videourl);
        await deleteFromFileString(prevdata.ImgUrl);
        return console.log('Both vid and image')
    }
    if (prevdata.videourl !== newdata.videourl) {
        await deleteFromFileString(prevdata.videourl);
        console.log(' vid  ')
    }
    if (prevdata.ImgUrl !== newdata.ImgUrl) {
        await deleteFromFileString(prevdata.ImgUrl);
        console.log(' Img  ')
    }
})


exports.SkilledTopicDelete = functions.firestore.document('Skilled_Courses/{courseid}/Topic/{topicid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (prevdata === undefined) {
        return;
    }
    if (newdata === undefined) {
        //delete video
        await deleteFromFileString(prevdata.VideoUrl);
        await deleteFromFileString(prevdata.ImgUrl);
        return console.log('Both vid and image')
    }
    if (prevdata.VideoUrl !== newdata.VideoUrl) {
        await deleteFromFileString(prevdata.VideoUrl);
        console.log(' vid  ')
    }
    if (prevdata.ImgUrl !== newdata.ImgUrl) {
        await deleteFromFileString(prevdata.ImgUrl);
        console.log(' Img  ')
    }
})


//Net courses
exports.Net_CourseDelete_AllDelete = functions.firestore.document('Net/{courseid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        const preview = await db.collection('Net').doc(context.params.courseid).collection('Preview').get();
        preview.forEach(doc => {
            db.collection('Net').doc(context.params.courseid).collection('Preview').doc(doc.id).delete();
        })
        const topic = await db.collection('Net').doc(context.params.courseid).collection('Subject').get();
        topic.forEach(doc => {
            db.collection('Net').doc(context.params.courseid).collection('Subject').doc(doc.id).delete();
        })
        ///mock,previous
        try {
            const Mock = await db.collection('Mock_Test').where('Paper_Id', '==', context.params.courseid).get();
            Mock.forEach(doc => {
                db.collection('Mock_Test').doc(doc.id).delete();
            });
        } catch (error) {
            console.log('No Mock Test To Delete')
        }
        try {
            db.collection('Previous_Year').doc(context.params.courseid).delete();
        } catch (error) {
            console.log('No Prev Yr Que to delete');
        }
    }
})

exports.Net_SubDelete_AllDelete = functions.firestore.document('Net/{courseid}/Subject/{subid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        const topic = await db.collection('Net').doc(context.params.courseid).collection('Subject').doc(context.params.subid).collection('Topic').get();
        topic.forEach(doc => {
            db.collection('Net').doc(context.params.courseid).collection('Subject').doc(context.params.subid).collection('Topic').doc(doc.id).delete();
        })
    }
})
exports.NetPreviewDelete = functions.firestore.document('Net/{courseid}/Preview/{previewid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (prevdata === undefined) {
        return;
    }
    if (newdata === undefined) {
        //delete video
        await deleteFromFileString(prevdata.videourl);
        await deleteFromFileString(prevdata.ImgUrl);
        return console.log('Both vid and image')
    }
    if (prevdata.videourl !== newdata.videourl) {
        await deleteFromFileString(prevdata.videourl);
        console.log(' vid  ')
    }
    if (prevdata.ImgUrl !== newdata.ImgUrl) {
        await deleteFromFileString(prevdata.ImgUrl);
        console.log(' Img  ')
    }
})


exports.NetTopicDelete = functions.firestore.document('Net/{courseid}/Subject/{subid}/Topic/{topicid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (prevdata === undefined) {
        return;
    }
    if (newdata === undefined) {
        //delete video
        await deleteFromFileString(prevdata.VideoUrl);
        await deleteFromFileString(prevdata.ImgUrl);
        return console.log('Both vid and image')
    }
    if (prevdata.VideoUrl !== newdata.VideoUrl) {
        await deleteFromFileString(prevdata.VideoUrl);
        console.log(' vid  ')
    }
    if (prevdata.ImgUrl !== newdata.ImgUrl) {
        await deleteFromFileString(prevdata.ImgUrl);
        console.log(' Img  ')
    }
})

//Degree courses
exports.Degree_CourseDelete_AllDelete = functions.firestore.document('Net/{courseid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        const preview = await db.collection('Net').doc(context.params.courseid).collection('Preview').get();
        preview.forEach(doc => {
            db.collection('Net').doc(context.params.courseid).collection('Preview').doc(doc.id).delete();
        })
        const topic = await db.collection('Net').doc(context.params.courseid).collection('Subject').get();
        topic.forEach(doc => {
            db.collection('Net').doc(context.params.courseid).collection('Subject').doc(doc.id).delete();
        })
        ///mock,previous
        try {
            const Mock = await db.collection('Mock_Test').where('Paper_Id', '==', context.params.courseid).get();
            Mock.forEach(doc => {
                db.collection('Mock_Test').doc(doc.id).delete();
            });
        } catch (error) {
            console.log('No Mock Test To Delete')
        }
        try {
            db.collection('Previous_Year').doc(context.params.courseid).delete();
        } catch (error) {
            console.log('No Prev Yr Que to delete');
        }
    }
})

exports.Degree_SubDelete_AllDelete = functions.firestore.document('Net/{courseid}/Subject/{subid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        const topic = await db.collection('Net').doc(context.params.courseid).collection('Subject').doc(context.params.subid).collection('Topic').get();
        topic.forEach(doc => {
            db.collection('Net').doc(context.params.courseid).collection('Subject').doc(context.params.subid).collection('Topic').doc(doc.id).delete();
        })
    }
})

exports.DegreePreviewDelete = functions.firestore.document('Degree_Courses/{courseid}/Preview/{previewid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (prevdata === undefined) {
        return;
    }
    if (newdata === undefined) {
        //delete video
        await deleteFromFileString(prevdata.videourl);
        await deleteFromFileString(prevdata.ImgUrl);
        return console.log('Both vid and image')
    }
    if (prevdata.videourl !== newdata.videourl) {
        await deleteFromFileString(prevdata.videourl);
        console.log(' vid  ')
    }
    if (prevdata.ImgUrl !== newdata.ImgUrl) {
        await deleteFromFileString(prevdata.ImgUrl);
        console.log(' Img  ')
    }
})


exports.DegreeTopicDelete = functions.firestore.document('Degree_Courses/{courseid}/Subject/{subid}/Topic/{topicid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (prevdata === undefined) {
        return;
    }
    if (newdata === undefined) {
        //delete video
        await deleteFromFileString(prevdata.VideoUrl);
        await deleteFromFileString(prevdata.ImgUrl);
        return console.log('Both vid and image')
    }
    if (prevdata.VideoUrl !== newdata.VideoUrl) {
        await deleteFromFileString(prevdata.VideoUrl);
        console.log(' vid  ')
    }
    if (prevdata.ImgUrl !== newdata.ImgUrl) {
        await deleteFromFileString(prevdata.ImgUrl);
        console.log(' Img  ')
    }
})



async function deleteFromFileString(strg) {
    strg = strg.replace("https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/", "").replace("?alt=media", "")
    strg = strg.split("%2F").join("/");
    const bucket = storage.bucket("gs://estudo-admin.appspot.com");
    await bucket.file(strg).delete();
}


//image resize
const spawn = require('child-process-promise').spawn;
const fileBucket = 'gs://estudo-admin.appspot.com';

//banner image resize
exports.BannerImageResize = functions.runWith({ timeoutSeconds: 300 }).firestore.document('Banners/{docid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        return;
    }
    if ((prevdata === undefined || (prevdata.ImgUrl !== newdata.ImgUrl)) && newdata.ImgUrl !== "") {
        //waiteyyippikkal move
        await delay(30000);
        // Get the file path.
        try {
            const filePath = url_to_path(newdata.ImgUrl);
            functions.logger.log(`filepath :${filePath}:`);
            const tempFilePath = path.join(os.tmpdir(), "Image");
            const bucket = storage.bucket(fileBucket);

            await bucket.file(filePath).download({ destination: tempFilePath });
            await spawn('convert', [tempFilePath, '-thumbnail', '700x300>', tempFilePath]);

            await bucket.upload(tempFilePath, {
                destination: filePath,
                // metadata: { contentType: contentType },
            });
            console.log('Resized')

            return fs.unlinkSync(tempFilePath);
        }
        catch (err) {
            functions.logger.error(err)
        }
    }

})

//net
exports.NetTopicImageResize = functions.runWith({ timeoutSeconds: 300 }).firestore.document('Net/{courseid}/Subject/{subid}/Topic/{topicid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        return;
    }
    if (prevdata === undefined || (prevdata.ImgUrl !== newdata.ImgUrl)) {
        //waiteyyippikkal move
        await delay(30000);
        // Get the file path.
        const filePath = url_to_path(newdata.ImgUrl);
        const tempFilePath = path.join(os.tmpdir(), "Image");
        const bucket = storage.bucket(fileBucket);

        await bucket.file(filePath).download({ destination: tempFilePath });
        await spawn('convert', [tempFilePath, '-thumbnail', '266x150>', tempFilePath]);

        await bucket.upload(tempFilePath, {
            destination: filePath,
            // metadata: { contentType: contentType },
        });
        console.log('Resized')

        return fs.unlinkSync(tempFilePath);
    }

})

exports.NetPreviewImageResize = functions.runWith({ timeoutSeconds: 300 }).firestore.document('Net/{courseid}/Preview/{previewid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        return;
    }
    if (prevdata === undefined || (prevdata.ImgUrl !== newdata.ImgUrl)) {
        //waiteyyippikkal move
        await delay(30000);
        // Get the file path.
        const filePath = url_to_path(newdata.ImgUrl);
        const tempFilePath = path.join(os.tmpdir(), "Image");
        const bucket = storage.bucket(fileBucket);

        await bucket.file(filePath).download({ destination: tempFilePath });
        await spawn('convert', [tempFilePath, '-thumbnail', '266x150>', tempFilePath]);

        await bucket.upload(tempFilePath, {
            destination: filePath,
            // metadata: { contentType: contentType },
        });
        console.log('Resized')

        return fs.unlinkSync(tempFilePath);
    }

})

//degree
exports.DegreeTopicImageResize = functions.runWith({ timeoutSeconds: 300 }).firestore.document('Degree_Courses/{courseid}/Subject/{subid}/Topic/{topicid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        return;
    }
    if (prevdata === undefined || (prevdata.ImgUrl !== newdata.ImgUrl)) {
        //waiteyyippikkal move
        await delay(30000);
        // Get the file path.
        const filePath = url_to_path(newdata.ImgUrl);
        const tempFilePath = path.join(os.tmpdir(), "Image");
        const bucket = storage.bucket(fileBucket);

        await bucket.file(filePath).download({ destination: tempFilePath });
        await spawn('convert', [tempFilePath, '-thumbnail', '266x150>', tempFilePath]);

        await bucket.upload(tempFilePath, {
            destination: filePath,
            // metadata: { contentType: contentType },
        });
        console.log('Resized')

        return fs.unlinkSync(tempFilePath);
    }

})

exports.DegreePreviewImageResize = functions.runWith({ timeoutSeconds: 300 }).firestore.document('Degree_Courses/{courseid}/Preview/{previewid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        return;
    }
    if (prevdata === undefined || (prevdata.ImgUrl !== newdata.ImgUrl)) {
        //waiteyyippikkal move
        await delay(30000);
        // Get the file path.
        const filePath = url_to_path(newdata.ImgUrl);
        const tempFilePath = path.join(os.tmpdir(), "Image");
        const bucket = storage.bucket(fileBucket);

        await bucket.file(filePath).download({ destination: tempFilePath });
        await spawn('convert', [tempFilePath, '-thumbnail', '266x150>', tempFilePath]);

        await bucket.upload(tempFilePath, {
            destination: filePath,
            // metadata: { contentType: contentType },
        });
        console.log('Resized')

        return fs.unlinkSync(tempFilePath);
    }

})

//skilled
exports.SkilledTopicImageResize = functions.runWith({ timeoutSeconds: 300 }).firestore.document('Skilled_Courses/{courseid}/Topic/{topicid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        return;
    }
    if (prevdata === undefined || (prevdata.ImgUrl !== newdata.ImgUrl)) {
        //waiteyyippikkal move
        await delay(30000);
        // Get the file path.
        const filePath = url_to_path(newdata.ImgUrl);
        const tempFilePath = path.join(os.tmpdir(), "Image");
        const bucket = storage.bucket(fileBucket);

        await bucket.file(filePath).download({ destination: tempFilePath });
        await spawn('convert', [tempFilePath, '-thumbnail', '266x150>', tempFilePath]);

        await bucket.upload(tempFilePath, {
            destination: filePath,
            // metadata: { contentType: contentType },
        });
        console.log('Resized')

        return fs.unlinkSync(tempFilePath);
    }

})

exports.SkilledPreviewImageResize = functions.runWith({ timeoutSeconds: 300 }).firestore.document('Skilled_Courses/{courseid}/Preview/{previewid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        return;
    }
    if (prevdata === undefined || (prevdata.ImgUrl !== newdata.ImgUrl)) {
        //waiteyyippikkal move
        await delay(30000);
        // Get the file path.
        const filePath = url_to_path(newdata.ImgUrl);
        const tempFilePath = path.join(os.tmpdir(), "Image");
        const bucket = storage.bucket(fileBucket);

        await bucket.file(filePath).download({ destination: tempFilePath });
        await spawn('convert', [tempFilePath, '-thumbnail', '266x150>', tempFilePath]);

        await bucket.upload(tempFilePath, {
            destination: filePath,
            // metadata: { contentType: contentType },
        });
        console.log('Resized')

        return fs.unlinkSync(tempFilePath);
    }

})



//life style
exports.LifeStyleTopicImageResize = functions.runWith({ timeoutSeconds: 300 }).firestore.document('Courses/{courseid}/Topic/{topicid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        return;
    }
    if (prevdata === undefined || (prevdata.ImgUrl !== newdata.ImgUrl)) {
        //waiteyyippikkal move
        await delay(30000);
        // Get the file path.
        const filePath = url_to_path(newdata.ImgUrl);
        const tempFilePath = path.join(os.tmpdir(), "Image");
        const bucket = storage.bucket(fileBucket);

        await bucket.file(filePath).download({ destination: tempFilePath });
        await spawn('convert', [tempFilePath, '-thumbnail', '266x150>', tempFilePath]);

        await bucket.upload(tempFilePath, {
            destination: filePath,
            // metadata: { contentType: contentType },
        });
        console.log('Resized')

        return fs.unlinkSync(tempFilePath);
    }

})

exports.LifeStylePreviewImageResize = functions.runWith({ timeoutSeconds: 300 }).firestore.document('Courses/{courseid}/Preview/{previewid}').onWrite(async (change, context) => {
    newdata = change.after.data();
    prevdata = change.before.data();

    if (newdata === undefined) {
        return;
    }
    if (prevdata === undefined || (prevdata.ImgUrl !== newdata.ImgUrl)) {
        //waiteyyippikkal move
        await delay(30000);
        // Get the file path.
        const filePath = url_to_path(newdata.ImgUrl);
        const tempFilePath = path.join(os.tmpdir(), "Image");
        const bucket = storage.bucket(fileBucket);

        await bucket.file(filePath).download({ destination: tempFilePath });
        await spawn('convert', [tempFilePath, '-thumbnail', '266x150>', tempFilePath]);

        await bucket.upload(tempFilePath, {
            destination: filePath,
            // metadata: { contentType: contentType },
        });
        console.log('Resized')

        return fs.unlinkSync(tempFilePath);
    }

})

function url_to_path(strg) {
    functions.logger.log({ "1": strg });
    strg = strg.replace("https://firebasestorage.googleapis.com/v0/b/estudo-admin.appspot.com/o/", "").replace("?alt=media", "")
    functions.logger.log({ "2": strg });

    strg = strg.split("%2F").join("/");
    functions.logger.log({ "2": strg });
    return strg;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))


//user signup

exports.UserRoutine = functions.firestore.document('Users/{userid}').onCreate(async (snap, context) => {
    await db.collection('Users').doc(context.params.userid).update({
        Join_Date: nowDate()
    });
    console.log('user join date added');
})


function nowDate() {
    let date = new Date();
    let currentOffset = date.getTimezoneOffset();
    let ISTOffset = 330;
    date = new Date(date.getTime() + (ISTOffset + currentOffset) * 60000);


    let date_day = date.getDate();
    let date_month = date.getMonth() + 1;
    if (Number(date_month) < 10) {
        date_month = '0' + String(date_month);
    }
    if (Number(date_day) < 10) {
        date_day = '0' + String(date_day);
    }
    let date_year = date.getFullYear();
    let date_string = String(date_year) + '/' + String(date_month) + '/' + String(date_day);
    return date_string;
}