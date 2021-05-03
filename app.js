const express = require('express');
const mongoose = require('mongoose');
const databaseuser = require('./models/model')
const residentprofile= require('./models/residentprofile')
const publictimesheet = require('./models/timesheet')
const app = express();
const path = require('path');
const router = express.Router();
const {google} = require('googleapis');
var cookieParser = require('cookie-parser')
const MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var ProgressBar = require('progressbar.js');
const port = process.env.PORT||3000;



app.use('/', router);
//use my css
app.use(express.static("public"));
app.use(cookieParser())
app.use(express.json());//allow to send server json file 
//set up template enjne 
app.set('view engine', 'ejs')
//google 
const {OAuth2Client} = require('google-auth-library');
const { json } = require('express');
const user = require('./models/model');
const { stringify } = require('querystring');
const CLIENT_ID= '244299986178-16s1c4qbq6k1j16p083ssmfvoiqr07rf.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);



app.get('/',function(req,res){
   
    res.render('index')
  });

  app.get('/residentprofile',function(req,res){

    //create a form first 

    connecttomongo();
    residentprofile.findOne({ purpose: "residentlist" },function(err,doc){
        if(doc){
           console.log(doc)
            console.log(doc.toscano)
            toscano= doc.toscano;
            milano= doc.milano;
            serrento=doc.serrento
            doc=JSON.stringify(doc)
            res.render('residentprofile',{doc})

        }
        else if (err){
            console.log(err)
        }

    })

  })

  app.post('/residentprofile',urlencodedParser, (req,res)=>{

    console.log(req.body.residentname)
    //have a bunch of json objects , have a list of acctitivy genre by using the fist to compare then pop it in a list , 
    //make an array for every object , [1on1, sensory stimulation, 2on2 ]==> [json foreach]
    // make an object for each activity {actigivyt: , actively enagegd : pasivley enagwed, refused }
    //
    residentprofile.find({ residentname: `${req.body.residentname}` },function(err,doc){

        if(doc){
            console.log(doc.length)
            var activitylist=[]
            for(i=0;i<doc.length;i++){
                activitylist.push(doc[i].activitygenre)
                
            }
            let uniqueactivity = [...new Set(activitylist)];
            console.log(uniqueactivity)

            class residentactivitygenre{
                constructor(activities) {
                    
                    this.activities = activities;
                  }
            }

            const detailed= uniqueactivity.map(x=>doc.filter(doc => doc.activitygenre ==x))

            

            console.log(detailed)

            
            
            

        }
        else{
            console.log(err)
        }




    })


  })

  
 

  app.get('/profile',checkAuthenticated ,function(req,res){
      let user= req.user
      let loginuser= user.name
      let userpicture= user.picture;
      let date_ob = new Date();
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let date = ("0" + date_ob.getDate()).slice(-2);
      let year = date_ob.getFullYear();
    


      //call monngodb
      connecttomongo()
      //check if it is an existing user if yes display if no create a new one 
      checkifnocreate(loginuser,year,month)

    

        showpage();

     
     

    
//how to extract data 


//get timedata
function showpage(){

    databaseuser.findOne({name:loginuser,Year:year,Month:month},function(err,doc){

        if(err){

        }
        if(doc){
            
           
            let doc1 = JSON.stringify(doc)
            res.render('profile',{doc1 ,loginuser, userpicture})
        }
    }).lean();



  

}



   


});

app.post('/profile',urlencodedParser,(req,res)=>{

    console.log(req.body)
    var indextodelete= Number(req.body.arrayele-1);
    var id= req.body.databaseid;
    var other=req.body.others;
    var milano=req.body.milano;
    var serrento= req.body.serrento;
    var toscano=req.body.toscano;
    console.log(indextodelete)
var update={$unset: { [`loggeddetails.${indextodelete}`]: 1}}
var update2={$pull : { "loggeddetails": null}}
var update3={$inc : {Milano:-milano, Serrento:-serrento,toscano:-toscano,others:-other}}

    connecttomongo()
    databaseuser.findOneAndUpdate({_id:id},update,{new: true}, function(err,doc1){

        if(doc1){
            connecttomongo()
    databaseuser.findOneAndUpdate({_id:id},update2,{new: true}, function(err,doc1){


        if(doc1){
            
        }



    })
        }



    })


    connecttomongo()
    databaseuser.findOneAndUpdate({_id:id},update3,{new: true}, function(err,doc1){

        if(doc1){
            res.redirect("/profile")
        }



    })

    
   



})

app.get('/:id/monthlyreport',checkAuthenticated ,function(req,res){
    let user100= req.user
    let loginuser= user100.name

    res.render('monthlyreport',{loginuser})
})
app.post('/monthlyreport',urlencodedParser  ,function(req,res){
    
    let month=Number(req.body.month)
    let year = Number(req.body.year)
    let user= req.body.username.replace("&nbsp", " ")
    console.log(req.body)
    console.log(user)
    connecttomongo()
    databaseuser.findOne({name:user,Year:year,Month:month},function(err,doc){

        if(err){
            console.log(err)

        }
        if(doc){
            
           
           
            console.log(doc)
            var loginuser=JSON.stringify(doc)
            res.render('monthlyreportdownload',{loginuser})
            
           
        }
    }).lean();



    
})

  app.get('/:id/loghours',checkAuthenticated ,function(req,res){
   
    let user= req.user
    let loginuser= user.name
    let date_ob = new Date();
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let date = ("0" + date_ob.getDate()).slice(-2);
      let year = date_ob.getFullYear();
    
    
  res.render('loghours',{loginuser,user, loginuser,month,date,year})
});

app.post('/loghours',urlencodedParser , function(req,res){
   console.log("in")
   console.log(req.body)
   let user= req.body.username.replace("&nbsp", " ")
   
  
   console.log(user)
   
   let date_ob = new Date();
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let date = ("0" + date_ob.getDate()).slice(-2);
      let year = date_ob.getFullYear();
  
   console.log(user)
   

    var milano =Number(req.body.milano) 
    console.log(milano)
    var serrento = Number(req.body.serrento)
    var toscano = Number(req.body.toscano)
    var other= Number(req.body.other)
    console.log(other)
    var totalhour= milano+serrento+toscano+other 
    var residentvisited= req.body.descriptionpeople
    var descriptionthings = req.body.descriptionthings
    var descriptionoutcome = req.body.descriptionoutcome
    var readable = 
   [[req.body.date[1],residentvisited,descriptionthings,descriptionoutcome,totalhour,milano,serrento,toscano,other]]

    var update={$inc : {Milano:milano, Serrento:serrento,toscano:toscano,others:other}, $push: {loggeddetails:readable}}
    
   //update the freakin document 
   mongoose.set('useNewUrlParser', true);
   mongoose.set('useFindAndModify', false);
   mongoose.set('useCreateIndex', true);
   mongoose.set('useUnifiedTopology', true);
  
            databaseuser.findOneAndUpdate({name:user,Year:year,Month:month} ,update
                ,{new: true}, function(err,doc1){
                    if (err) {
                        res.send(err);
                      } else {
                          console.log("hihi")
                        console.log(doc1)
                        res.redirect("/profile")
                      }
                })

            // update the resident profile
            connecttomongo();

            //create a new document directly
            //for the case of individual not for group activities 

                const newresidentactivity = new residentprofile
                    ({
                        "residentname":req.body.descriptionpeople,
                        "entryno":req.body.entryno,
                        "activitygenre":req.body.activitygenre,
                        "activitydescription":req.body.descriptionthings,
                        "outcomegenre":req.body.outcome,
                        "outcomedescription":req.body.descriptionoutcome,
                        "time":req.body.time,
                        "month":req.body.month,
                        "date":req.body.date[0],
                        "year":req.body.year,
                        "whodidthis":user
                        
                        
                    })
            
                    
            
                    newresidentactivity.save()
                    .then((result)=>{console.log("creation resident successful");})
                    .catch((err)=>{console.log(err)})
            
                
           

           
                
        
    
    
    

    

    
    

});
  
app.get('/calender',checkAuthenticated, function(req,res){

    let date_ob = new Date();

    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   
    
    let year = date_ob.getFullYear();
    
    let user= req.user
    let loginuser= user.name.replace(" ", "&nbsp")
   console.log(loginuser)
   connecttomongo();
   publictimesheet.findOne({name:user.name}
     , function(err,doc1){
         if (err) {
             console.log(err)
           } else {
               console.log("hihi")
             console.log(doc1.time)
             var test= doc1.time
             var test=JSON.stringify(test)
             console.log(test)
             res.render('calender',{test , loginuser})
             
           
           }
     })


    
       
      

    
    
  });

  app.post('/calender1',urlencodedParser,function(req,res){
    let date_ob = new Date();

    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
   
    
    let year = date_ob.getFullYear();
      
      var start = req.body.start;
      var end = req.body.end;
      var title = req.body.title;
      var name = req.body.Name.replace("&nbsp", " ")
      console.log(name)
      if (name=="wan joshua"){
          
          color="blue"
      }
      if(name=="Lauren Wijaya"){
        color="orange"

      }
      if(name=="Charlotte Yan"){
          color="green"
      }
      if(name=="Kate Yin"){
          color="pink"
      }
      var push= [{"title":title,"start":start,"end":end,"color":color}]
      var update={ $push: {time:push}}
      

      connecttomongo();
      publictimesheet.findOneAndUpdate({name:name},update, {new: true},
       function(err,doc1){

         if (err) {
            res.send(err);
          } else {
            res.redirect("/calender")
          
          }
    })
   


    console.log(req.body)

  }
  )

  



app.get('/',function(req,res){
    res.clearCookie('session-token');
    console.log("logged out and cookies cleared ")
    res.redirect('/')
  
});

app.get('/logout',function(req,res){
    res.clearCookie('session-token');
    console.log("logged out and cookies cleared ")
    res.redirect('/')
  
});

app.get('/publictime',(req,res)=>{
    connecttomongo();
    publictimesheet.find((err,doc)=>{
        var list =[];

        for(i=0;i<doc.length;i++){


            doc1=JSON.stringify(doc[i].time)
            if(doc1!='[]'){

               
                    list.push(doc1)

                

                

            }
            

        }
        
        var newlist=[]
        for(i=0;i<list.length;i++){
            newlist.push(JSON.parse(list[i]))
        }
        console.log(newlist)
var ultimatelist=[]
        for(i=0;i<newlist.length;i++){
            for(j=0;j<newlist[i].length;j++){
                ultimatelist.push(newlist[i][j])

            }
        }
        console.log(ultimatelist)
        
        
        
        
        


    

       
       

       
        ultimatelist=JSON.stringify(ultimatelist)

        res.render('publictime',{ultimatelist})

    }

    )

})

app.get('/todolist',(req,res)=>{
res.send("todolist")

})
app.get('/orientation',(req,res)=>{
res.send("orientation")
    
})



  app.post('/login',function(req,res){
    let token = req.body.token;
    console.log(token)
    //verify the token 
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        console.log(payload)
      }
      
      verify()
      .then(
          ()=>{
              res.cookie('session-token', token);
              res.send ('success');

          }


      )
      
      
      .catch(console.error);
      
  });

  function checkAuthenticated(req,res,next){
      let token  = req.cookies['session-token'];
      let user ={};
      async function verify(){
          const ticket= await client.verifyIdToken({
              idToken:token,
              audience: '244299986178-16s1c4qbq6k1j16p083ssmfvoiqr07rf.apps.googleusercontent.com',


          });
          const payload = ticket.getPayload();
          user.name = payload.name ;
          user.email = payload.email ;
          user.picture = payload.picture  ;

      }
      verify()
      .then(()=>{
          req.user=user;
          console.log(req.user)
          next();

      })
      .catch(err=>{
         
      })


  }

  function connecttomongo(){
    

const uri = "mongodb://wanhoyinjoshua:KHloZIgpSaxAhl5J@cluster0-shard-00-00.qbtjq.mongodb.net:27017,cluster0-shard-00-01.qbtjq.mongodb.net:27017,cluster0-shard-00-02.qbtjq.mongodb.net:27017/goldsoul?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(uri,{ useNewUrlParser: true , useUnifiedTopology: true})
    .then((result)=>console.log("connected to database"))
    .catch((err)=>console.log(err))


}

function checkifnocreate(checkuser,year,month){
    console.log(checkuser)
    
    

   publictimesheet.exists({name:checkuser},(err,doc)=>{

if(doc){
    console.log("no need to create ")
}
else{

    const newtimeuser = new publictimesheet
        ({
            "time":[],
            "name":checkuser
        })

        

        newtimeuser.save()
        .then((result)=>{console.log("creation successful");})
        .catch((err)=>{console.log(err)})

    }


   })

  

    databaseuser.exists({name:checkuser,Year:year,Month:month}, function (err, doc) {
        
        if(doc){
            return doc
            
        } 
        else{
            console.log("create a new one ")
            console.log(year)
           
    
            const newuser = new databaseuser({
                
                "name":checkuser,
                "Year":year,
                "Month":month,
                "Milano":0,
                "Serrento":0,
                "toscano":0,
                "others":0,
                "loggeddetails":[],
                "time":[]
                


            }

           
                
                    
                
               
        )

        
        

        newuser.save()
        .then((result)=>{console.log("creation successful"); return true })
        .catch((err)=>{console.log(err)})
        }
        
    }); 

    return false
    


}




 

  app.listen(port);