var app
var db
const question=document.getElementById('question')
const option1 =document.getElementById('option1')
const option2 =document.getElementById('option2')
const option3 =document.getElementById('option3')
const option4 =document.getElementById('option4')
document.addEventListener("DOMContentLoaded",event=>{
     
     app = firebase.app()
    console.log(app)
     db = firebase.firestore()
    console.log(db)
    db.collection("admin").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        question.innerText=doc.data().question
        option1.innerText=doc.data().answer
        option2.innerText=doc.data().options[0]
        option3.innerText=doc.data().options[1]
        option3.innerText=doc.data().options[2]
        
    });
});

})