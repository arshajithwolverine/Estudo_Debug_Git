pdffileno = 0;//for upload count
QuestionNo = 0;
imgfileno = 0;
function Notify() {
    console.log("NET PAPERS Entered");
    let html = `
      <div class="header bg-primary pb-6">
          <div class="container-fluid">
            <div class="header-body">
              <div class="row align-items-center py-4">
                <div class="col-lg-6 col-7"> 
                  <form class="navbar-search navbar-search-light form-inline mr-sm-3" id="navbar-search-main" style="display:none;" hidden>
                <div class="form-group mb-0">
                  <div class="input-group input-group-alternative input-group-merge">
                    <div class="input-group-prepend">
                      <span class="input-group-text"><i class="fas fa-search"></i></span>
                    </div>
                    <input class="form-control" placeholder="Search" type="text" id="brandsearchid" >
                  </div>
                </div>
                <button type="button" class="close" data-action="search-close" data-target="#navbar-search-main" aria-label="Close">
                  <span aria-hidden="true">×</span>
                </button>
              </form>
              </div>
                <div class="col-lg-6 col-5 text-right">
                  <a  class="btn btn-sm btn-neutral" onclick="ToggleBack()">Main Page</a>
                  <!-- <a  class="btn btn-sm btn-neutral">Filters</a> -->
                </div>
                
               
              </div>
              <!-- arshu -->
              <div class="row align-items-center py-4" style='display:flex' id='main-header-contents'></div>
            </div>
          </div>
    
          
        </div>
        <!-- Page content -->
  
        <div id='table-list'>
        
        </div>
    
          <div class="row" id="Topicsrow" >        
          </div>
      
        <div class="row" id="editrow" style="display: flex;padding: 20px;" >
            <div class="col">
                
            </div>
        </div>
        </div>
      `

    let table = `<div class="container-fluid mt--6">
      

    <div class="row" id="mainrow">
      <div class="col">
        <div class="card bg-default shadow">
          <div class="card-header bg-transparent border-0">
            <div class="row">
              <div class="col-lg-6 col-7">
                <h6 class="h2 text-white d-inline-block mb-0">NOTIFICATION</h6>
              </div>
              <div class="col-lg-6 col-5 text-right">
                <a href="#" class="btn btn-md btn-neutral" onclick="notification_viewdata(null)">Add</a>
              </div>                    
              </div>
          </div>
          <div class="table-responsive" style="overflow-y: hidden;">
            <table class="table align-items-center table-dark table-flush">
              <thead class="thead-dark">
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Index</th>
                  <!-- <th scope="col">Users</th> -->
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody class="list" id="maintablecontents">
                <!-- <tr>
                  <th><a href="#" class="text-white" onclick="ToggleBtw()"><u>Somethig</u></a></th>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="text-right"><a class="btn btn-sm btn-neutral  text-dark" href="#"onclick="Notification_Deletefield(this,null)" >Delete</a></td>
                </tr> -->
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;

    document.getElementById('rendercontent.js').innerHTML = html;
    document.getElementById('table-list').innerHTML = table;
    //loading table data
    db.collection('Notification').orderBy('Index').onSnapshot(snapshot => {
        html = ``;
        snapshot.forEach(doc => {
            add = `
                    <tr>
                      <th><a href="#" class="text-white" onclick="notification_viewdata('${doc.id}')"><u>${doc.data().Name}</u></a></th>
                      <td>${doc.data().Index}</td>
                      <td class="text-right"><a class="btn btn-sm btn-neutral  text-dark" href="#"onclick="Notification_Deletefield(this,'${doc.id}')" >Delete</a></td>
                    </tr>
          `;
            html = html + add;
        });
        document.getElementById('maintablecontents').innerHTML = html;
    });
}


async function notification_viewdata(docid) {
    if (docid == null) {
        html = `
        <div class="col">
            <div class="card">
  
              <!-- Card Header -->
              <div class="card-header bg-transparent border-0" style="padding-bottom: inherit;">
                <div class="row">
                  <div class="col-lg-6 col-7">
                    <h6 class="h2 text-black d-inline-block mb-0">NOTIFICATION</h6>
                  </div>
                  <div class="col-lg-6 col-5 text-right">
                    <a href="#" class="btn btn-md btn-neutral" onclick="Notification_AddToDatabase(null)">Save</a>
                  </div>
                  </div>
                </div>
              <hr style="margin-bottom: 0;margin-top: 1rem;">
              <!-- Card body -->
              <div class="card-body">
                <div class="row">
                  <div class="col">
                            <!--
                          <div class="form-group" style="display:flex">
                            <label for="example-text-input" class="form-control-label" style="margin-right:10px">Active</label>
                            <label class="custom-toggle">
                              <input type="checkbox" id="activesubject">
                              <span class="custom-toggle-slider rounded-circle"></span>
                            </label>
                          </div> -->
                          <div class="form-group">
                            <label for="example-text-input" class="form-control-label">Name</label>
                            <input class="form-control" type="text" id="mainsubjectname">
                          </div>
  
                          <div class="form-group">
                            <label for="example-text-input" class="form-control-label">Index</label>
                            <input class="form-control" type="number" id="indexofsubject">
                          </div>

                          <div class="form-group">
                            <label for="example-text-input" class="form-control-label">Notification</label>
                            <input class="form-control" type="text" id="notification">
                          </div>
                            <!--
                          <div class="form-group">
                            <label for="example-text-input" class="form-control-label">Price</label>
                            <input class="form-control" type="number" id="priceofsubject">
                          </div>
  
                          <div class="form-group">
                            <label for="example-text-input" class="form-control-label">Details</label>
                            <form style="margin-bottom: 20px;">
                              <textarea class="form-control" rows="5" placeholder="Details...." id="subject-details"></textarea>
                          </form>
                          </div> -->
                            
                          </div>
                          </div>
  
                         
  
  
  
  
  
  
                   </div>
                </div>
              </div>
  
  
            </div>
          </div>
        `
        document.getElementById('editrow').innerHTML = html;
        ToggleBtw();
    }
    else {
        let snapshot = await db.collection('Notification').doc(docid).get();
        html = `
          <div class="col">
            <div class="card">
  
              <!-- Card Header -->
              <div class="card-header bg-transparent border-0" style="padding-bottom: inherit;">
                <div class="row">
                  <div class="col-lg-6 col-7">
                    <h6 class="h2 text-black d-inline-block mb-0">${snapshot.data().Name.toUpperCase()} Notification</h6>
                  </div>
                  <div class="col-lg-6 col-5 text-right">
                    <a href="#" class="btn btn-md btn-neutral" onclick="Notification_AddToDatabase('${docid}')">Save</a>
                  </div>
                  </div>
                </div>
              <hr style="margin-bottom: 0;margin-top: 1rem;">
              <!-- Card body -->
              <div class="card-body">
                <div class="row">
                  <div class="col">
                  <!--
                    <div class="form-group" style="display:flex">
                            <label for="example-text-input" class="form-control-label" style="margin-right:10px">Active</label>
                            <label class="custom-toggle">
                              <input type="checkbox" id="activesubject">
                              <span class="custom-toggle-slider rounded-circle"></span>
                            </label>
                          </div> -->
                          <div class="form-group">
                            <label for="example-text-input" class="form-control-label">Name</label>
                            <input class="form-control" type="text" id="mainsubjectname" value="${snapshot.data().Name}">
                          </div>
  
                          <div class="form-group">
                            <label for="example-text-input" class="form-control-label">Index</label>
                            <input class="form-control" type="number" id="indexofsubject" value="${snapshot.data().Index}">
                          </div>

                          <div class="form-group">
                            <label for="example-text-input" class="form-control-label">Notification</label>
                            <input class="form-control" type="text" id="notification" value="${snapshot.data().Notification}">
                          </div>
  
                          <!--
                          <div class="form-group">
                            <label for="example-text-input" class="form-control-label">Price</label>
                            <input class="form-control" type="number" id="priceofsubject" value="${snapshot.data().Price}" >
                          </div>
  
                          <div class="form-group">
                            <label for="example-text-input" class="form-control-label">Details</label>
                            <form style="margin-bottom: 20px;">
                              <textarea class="form-control" rows="5" placeholder="Details...." id="subject-details"></textarea>
                          </form>
                          </div> -->
  
  
                        </div>
                      </div>
                    </div>
                    <div id='inner-header'></div> 
                    <div id='inner-content' style="margin-top: -25px;margin-left: -15px;margin-right: -15px;"></div>`;

        document.getElementById('editrow').innerHTML = html;
        // let Details_String = '';
        // for (i = 0; i < snapshot.data().Details.length; i++) {
        //     if (i === snapshot.data().Details.length - 1) {
        //         Details_String = Details_String + snapshot.data().Details[i]
        //     } else {
        //         Details_String = Details_String + snapshot.data().Details[i] + '\n'
        //     }
        // }
        // document.getElementById('subject-details').value = Details_String;
        // document.getElementById('activesubject').checked = snapshot.data().Active;

        ToggleBtw();

        //     let inner_header = ` <div class="header bg-primary pb-6">
        //       <div class="row" style="flex:1;padding: 20px;" >
        //       <div class="col-6" style="flex:1">
        //         <div class="card card-stats">
        //           <!-- Card body -->
        //           <div class="card-body" style="cursor: pointer;" onclick="skilled_courses_preview_page('${snapshot.id}')">
        //             <div class="row">
        //               <div class="col text-center">
        //                 <h5 class="card-title text-uppercase text-muted mb-0">Preview Page</h5>
        //                 <span class="h2 font-weight-bold mb-0" onclick="skilled_courses_preview_page('${snapshot.id}')">Preview Page</span>
        //               </div>
        //             </div>
        //           </div>
        //         </div>
        //       </div>


        //       <div class="col-6" style="flex:1">
        //   <div class="card card-stats">
        //     <!-- Card body -->
        //     <div class="card-body" style="cursor: pointer;" onclick="skilled_courses_subject_page('${snapshot.id}')">
        //       <a>
        //         <div class="row">
        //           <div class="col text-center">
        //             <h5 class="card-title text-uppercase text-muted mb-0">Topics</h5>
        //             <span class="h2 font-weight-bold mb-0" onclick="skilled_courses_subject_page('${snapshot.id}')">Topics</span>
        //           </div>
        //         </div>

        //       </a>
        //     </div>
        //   </div>
        //   </div>


        //       <div class="col-6" style="flex:1">
        //       <div class="card card-stats">
        //         <!-- Card body -->
        //         <div class="card-body" style="cursor: pointer;" onclick="Skilled_Previous_Year('${snapshot.id}')">
        //           <a>
        //             <div class="row">
        //               <div class="col text-center">
        //                 <h5 class="card-title text-uppercase text-muted mb-0">Previous Year</h5>
        //                 <span class="h2 font-weight-bold mb-0" onclick="Skilled_Previous_Year('${snapshot.id}')">Previous Year</span>
        //               </div>
        //             </div>

        //           </a>
        //         </div>
        //       </div>
        //     </div>
        //     </div>`;
        //     document.getElementById('inner-header').innerHTML = inner_header;
        //     skilled_courses_preview_page(`${snapshot.id}`);
    }
}


async function Notification_AddToDatabase(docid) {

    if (confirm("Do you want to sve the changes?") == false) {
        return;
    }


    exitval = 1;
    pdffileno = 0;
    Name = document.getElementById('mainsubjectname').value
    Index = document.getElementById('indexofsubject').value
    Noti = document.getElementById('notification').value

    // Active = document.getElementById('activesubject').checked
    // Details = $('#subject-details').val().split('\n');
    // Price = document.getElementById('priceofsubject').value

    // console.log(Active);


    if (docid == null) {
        await db.collection('Notification').add({
            Name: document.getElementById("mainsubjectname").value,
            Index: document.getElementById("indexofsubject").value,
            Notification: Noti
            // Active: document.getElementById("activesubject").checked,
            // mock_flag: false,
            // Price: Price,
            // Details: Details
        })
            .then(snap => {
                docid = snap.id;
                console.log(docid);
                ToggleBack();
            })
            .catch(error => {
                alert("Some Error has occured.Please Reload")

            })
    }
    else {
        await db.collection('Notification').doc(docid).update({
            Name: document.getElementById("mainsubjectname").value,
            Index: document.getElementById("indexofsubject").value,
            Notification: Noti
            // Active: document.getElementById("activesubject").checked,
            // Price: Price,
            // Details: Details
        })
            .then(() => {
                ToggleBack();
            })
            .catch(error => {
                alert("Some Error has occured.Please Reload")

            })
    }

}


function Notification_Deletefield(input, docid) {
    if (docid != null) {
        if (confirm("Are you sure to delete the main Subject") == false) {
            return
        }
        db.collection('Notification').doc(docid).delete()
    }
    else if (confirm("Do you want to Delete the contents of this field") == false) {
        return
    }
    console.log('Deleted')
    var element = input.parentNode.parentNode;
    element.parentNode.removeChild(element);

}