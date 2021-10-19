//const url = "https://firebasestorage.googleapis.com/v0/b/estudo-af035.appspot.com/o/Study_Materials%2FTesttest%2FDEMO?alt=media";
let pdfDoc = null,
pageNum = 1,
pageIsRendering = false,
pageNumIsPending = null;
var numofpages;
const scale = 2;
// canvas = document.querySelector('#pdf-render'),
// ctx = canvas.getContext('2d');

//render page

// function parseURLParams(url) {
//     // var queryStart = url.indexOf("?") + 1,
//     //     queryEnd   = url.indexOf("#") + 1 || url.length + 1,
//     //     query = url.slice(queryStart, queryEnd - 1),
//     //     pairs = query.split("&"),
//     //     parms = {}, i, n, v, nv;

//     // if (query === url || query === "") return;

//     // for (i = 0; i < pairs.length; i++) {
//     //     nv = pairs[i].split("=", 2);
//     //     n = decodeURIComponent(nv[0]);
//     //     v = nv[1];

//     //     if (!parms.hasOwnProperty(n)) parms[n] = [];
//     //     parms[n].push(nv.length === 2 ? v : null);
//     // }
//     var index = url.indexOf("?");  // Gets the first index where a space occours
//     var id = url.substr(0, index); // Gets the first part
//     var text = url.substr(index + 3);
//     return text;
// }
//https://firebasestorage.googleapis.com/v0/b/estudo-af035.appspot.com/o/Study_Materials%2Fjrnfn%2FDEMO?alt=media
//https://firebasestorage.googleapis.com/v0/b/estudo-af035.appspot.com/o/Study_Materials%2Fjrnfn%2FDEMO?alt=media
//https://firebasestorage.googleapis.com/v0/b/estudo-af035.appspot.com/o/Study_Materials/jrnfn/DEMO?alt=media




function parseURLParams(url) {

            var queryStart = url.indexOf("?") + 1;
            queryEnd   = url.length + 1;
            query = url.slice(queryStart, queryEnd - 1);
            var parmStart = query.indexOf("=") + 1;
            parmEnd   = query.length + 1;
            parms = query.slice(parmStart, parmEnd - 1);





    // var queryStart = url.indexOf("?") + 1,
    //     queryEnd   = url.indexOf("#") + 1 || url.length + 1,
    //     query = url.slice(queryStart, queryEnd - 1),
    //     pairs = query.replace(/\+/g, " ").split("&"),
    //     parms = {}, i, n, v, nv;

    // if (query === url || query === "") return;

    // for (i = 0; i < pairs.length; i++) {
    //     nv = pairs[i].split("=", 2);
    //     n = decodeURIComponent(nv[0]);
    //     v = nv[1];

    //     if (!parms.hasOwnProperty(n)) parms[n] = [];
    //     parms[n].push(nv.length === 2 ? v : null);
    // }
    return parms;
}

urldata=parseURLParams(window.location.href);
url=urldata;

console.log(url);













const renderPage = num =>{

    pageIsRendering = true;

    pdfDoc.getPage(num).then(page=>{
        console.log(page)
        canvas = document.createElement( "canvas" );
        ctx = canvas.getContext('2d');
        // canvas.style.display="block";
        // canvas.style.margin="0 auto";
        // canvas.style.paddingTop="50px"

        const viewport = page.getViewport(scale);
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        console.log(viewport.width)
        const renderCtx = {
            canvasContext: ctx,
            viewport
        }
        canvasdiv = document.createElement("div");
        canvasdiv.className = "col-md-12";
        canvasdiv.setAttribute("name","canvaspdf");
        //canvasdiv.style.paddingRight="0px";
        //canvasdiv.style.paddingLeft="0px";


        canvasdiv.appendChild(canvas);
        document.getElementById('pdfdiv').appendChild(canvasdiv);
        canvas.style.width="100%"

        page.render(renderCtx).promise.then(() =>{

            if(num >= numofpages){
                return;
            }
            else{
                renderPage(num+1);
            }
            pageIsRendering = false;


            if(pageNumIsPending !== null)
            {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

    })
    
}

const queueRenderPage = num => {
    if(pageIsRendering){
        pageNumIsPending = num;
    } else {
        renderPage(num);
    }
}

const showPrevPage = () => {

    if(pageNum <= 1){
        return;
    }
    pageNum--;
    document.getElementsByName('canvaspdf')[pageNum-1].scrollIntoView();
    //queueRenderPage(pageNum);

}


const showNextPage = () => {


    if(pageNum >= pdfDoc.numPages){
        return;
    }
    pageNum++;
    console.log("next "+pageNum)
    document.getElementsByName('canvaspdf')[pageNum-1].scrollIntoView(true);
    //queueRenderPage(pageNum);

}



pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
pdfDoc = pdfDoc_;
//console.log(pdfDoc)



document.querySelector('#page-count').textContent = pdfDoc.numPages;
document.querySelector('#page-num').textContent = "1";

//console.log(pdfDoc.n)
numofpages=pdfDoc.numPages;
renderPage(pageNum);


})



document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage)


window.onscroll = function (e) { 
    //console.log("event")
    curtpos=window.pageYOffset;

    canvaspdf = document.getElementsByName('canvaspdf');
    canvaslen = canvaspdf.length;
    //console.log(canvaspdf[0].offsetTop)//canvaspdf[1].clientHeight)

    for(let i=0;i<canvaslen;i++){
        //console.log(canvaspdf[1].offsetTop)
        //console.log(canvaspdf[1].offsetTop + canvaspdf[i].clientHeight)
        if(canvaspdf[i].offsetTop <= curtpos && canvaspdf[i].offsetTop + canvaspdf[i].clientHeight > curtpos){
            console.log((canvaspdf[i].offsetTop + canvaspdf[i].clientHeight - curtpos)*100/screen.height)
            if((canvaspdf[i].offsetTop + canvaspdf[i].clientHeight - curtpos)*100/screen.height >= 50){
            document.querySelector('#page-num').textContent = i+1;
            pageNum=i+1;
            //console.log("test")
            }
            else{
                document.querySelector('#page-num').textContent = i+2;
                pageNum=i+2;
                //console.log("test")

            }
        }
    }


};