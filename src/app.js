const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); 
// const hbs = require("hbs")
const ejs = require("ejs")
require("./db/connect")
const User = require("./models/user")
const catMenu = require("./models/menuCat")
const itemModel = require("./models/item")
const twoModel = require("./models/twoseat")
const fourModel = require("./models/fourseat")
const sixModel = require("./models/sixseat")
const Workers = require("./models/createworker")
const {json} = require("express");
const { errorMonitor } = require("events");
var jwt = require('jsonwebtoken');
const { abort } = require("process");
const { check, validationResult } = require('express-validator');
const multer = require("multer");
const paginate = require('mongoose-paginate');
const { ifError } = require("assert");


const port = process.env.PORT || 30000;

const static_path = path.join(__dirname, "../public");
const temp_path = path.join(__dirname, "../templates/views");
// const part_path = path.join(__dirname, "../templates/partials");
// const part_path = path.join(__dirname, "../templates/partial");

app.use(express.json())
app.use(express.urlencoded({extended:false}))


app.use(express.static(static_path));
app.set("view engine", "ejs");
app.set("views",temp_path)
// ejs.registerPartials(part_path);

function checkLoginUser(req,res,next){
  var userToken=localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

var Storage = multer.diskStorage({
  destination:"./public/upload/",
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
  }
})

var upload = multer({
  storage:Storage
}).single('file');
//
function checkUsername(req,res,next){
    var username=req.body.username;
    var checkexitemail=User.findOne({username:username});
    checkexitemail.exec((err,data)=>{
   if(err) throw err;
   if(data){
    
  return res.render('register', { title: 'Restaurant Management System', msg:'Username Already Exit' });
  
   }
   next();
    });
  }




function checkEmail(req,res,next){
    var email=req.body.email;
    var checkexitemail=User.findOne({email:email});
    checkexitemail.exec((err,data)=>{
   if(err) throw err;
   if(data){
    
  return res.render('register', { title: 'Restaurant Management System', msg:'Email Already Exit' });
  
   }
   next();
    });
  }


  app.get('/Home', function(req, res){
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser){
    res.render('Home', {
       key: process.env.STRIPE_PUBLISHABLE_KEY
    })
  }
  else {
    res.redirect('/login')
  }
})

app.get('/forget', function(req, res){
  res.render('forget', { title: 'Restaurant Management System', msg:'',pass:'' })
})

app.post('/forget',function(req,res) {
  const uname = req.body.uname;
  const uemail = req.body.uemail;
  const checkUser=User.findOne({username:uname});
  checkUser.exec((err, data)=>{
    if(data==null){
      res.render('forget', { title: 'Restaurant Management System', msg:"User Not Exist",pass:'' });
     }
     else{
        var email = data.email
        const password = data.password
        if(uemail === email){
          res.render('forget', { title: 'Restaurant Management System', msg:"",pass:password });
        }
        else {
          res.render('forget', { title: 'Restaurant Management System', msg:"Details Not Matched" });
        }
     }
})

})

app.post('/payment', function(req, res){
 
    // Moreover you can take more details from user
    // like Address, Name, etc from form
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Gourav Hammad',
        address: {
            line1: 'TC 9/4 Old MES colony',
            postal_code: '452331',
            city: 'Indore',
            state: 'Madhya Pradesh',
            country: 'India',
        }
    })
    .then((customer) => {
 
        return stripe.charges.create({
            amount: 2500,     // Charging Rs 25
            description: 'Web Development Product',
            currency: 'INR',
            customer: customer.id
        });
    })
    .then((charge) => {
        res.send("Success")  // If no error occurs
    })
    .catch((err) => {
        res.send(err)       // If some error occurs
    });
})
 



app.get("/", (req, res) =>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./dashboard');
  }else{
  res.render('index', { title: 'Restaurant Management System',loginUser: loginUser});
  }
  
});



app.get("/table", (req, res) =>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    res.render("table",{ title: 'Restaurant Management System',loginUser:loginUser, msg:'' })
  }
  else {
    res.redirect('/login')
  }
  
});

app.get('/create',(req,res)=> {
  res.render('create', { title: 'Restaurant Management System', msg:'',succ:"" });
})
// This is the user post data 


app.post("/create", (req,res)=> {
     var currentdate = new Date(); 
     var time = currentdate.getHours()+currentdate.getMinutes()+currentdate.getSeconds();
     var password = req.body.password;
     var confirmpassword= req.body.confirmpassword;
     const phonenumber = req.body.phonenumber;
     const name = req.body.name;
     const email = req.body.email;
     const username = "worker@"+time;
     if(password !== confirmpassword){

        res.render("create",{ title: 'Restaurant Management System', msg:'Password not matched',succ:"" })
        // console.log(password,cpasswoed,phonenumber,username,email)
     }
     else {
    
        var userDetails=new Workers({
            name:name,
            username:username,
            email:email,
            phonenumber:phonenumber,
            password:password,
            confirmpassword:confirmpassword
            
          });
            userDetails.save((err,doc)=>{
            if(err) throw err;
            res.render('create',{ title: 'Restaurant Management System', msg:"",succ:"Worker Login successfully" });
       })  ;
     }
})




app.get("/login",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./dashboard');
  }
  else{
  res.render('login', { title: 'Restaurant Management System', msg:'' });
  }
})


app.post("/login",(req,res)=>{
  var username=req.body.username;
  const password = req.body.password;
  const checkUser=User.findOne({username:username});
  checkUser.exec((err, data)=>{
    if(data==null){
      res.render('login', { title: 'Restaurant Management System', msg:"Invalid Username and Password." });
     }
  else{
  if(err) throw err;
  var getUserID=data._id;
  var getPassword = data.password;
  console.log(getPassword)
  if(password === getPassword){
    var token = jwt.sign({ userID: getUserID }, 'loginToken');
    localStorage.setItem('userToken', token);
    localStorage.setItem('loginUser', username);
    res.redirect('/dashboard');
    
  }
  else{
    res.render('login', { title: 'Restaurant Management System', msg:"Invalid Username or Password." });
  }
} 
   });
});


app.get("/workerlogin",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./worker');
  }
  else{
  res.render('workerlogin', { title: 'Restaurant Management System', msg:'' });
  }
})


app.post("/workerlogin",(req,res)=>{
  var username=req.body.username;
  const password = req.body.password;
  const checkUser=Workers.findOne({username:username});
  checkUser.exec((err, data)=>{
    if(data==null){
      res.render('workerlogin', { title: 'Restaurant Management System', msg:"Invalid Username and Password." });
     }else{
  if(err) throw err;
  var getUserID=data._id;
  var getPassword = data.password;
  console.log(getPassword)
  if(password === getPassword){
    var token = jwt.sign({ userID: getUserID }, 'loginToken');
    localStorage.setItem('userToken', token);
    localStorage.setItem('loginUser', username);
    res.redirect('/worker')
   
  }
  else
  {
    res.render('workerlogin', { title: 'Restaurant Management System', msg:"Invalid Worker Username or Password." });
    
  }
} 
   });
});



app.get("/adminlogin",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./admin');
  }
  else{
  res.render('adminlogin', { title: 'Restaurant Management System', msg:'' });
  }
})


app.post("/adminlogin",(req,res)=>{
  var username=req.body.username;
  const password = req.body.password;
  const checkUser=User.findOne({username:username});
  checkUser.exec((err, data)=>{
    if(data==null){
      res.render('adminlogin', { title: 'Restaurant Management System', msg:"Invalid Username and Password." });
     }else{
  if(err) throw err;
  var getUserID=data._id;
  var getPassword = data.password;
  console.log(getPassword)
  if(password === getPassword){
    var token = jwt.sign({ userID: getUserID }, 'loginToken');
    localStorage.setItem('userToken', token);
    localStorage.setItem('loginUser', username);
    
    if(username == "real" && password === "1234"){
      res.redirect('/admin') 
    }
    else {
      res.render('adminlogin', { title: 'Restaurant Management System', msg:"Invalid Admin Username or Password." });
    }
   
  }
  else{
    
    res.render('adminlogin', { title: 'Restaurant Management System', msg:"Invalid Username or Password." });
  }
} 
   });
});




app.get('/worker', (req,res) => {
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    const getPassCat = itemModel.find({})
    getPassCat.exec(function(err,data){
      if(err) throw err;
    res.render('worker', { title: 'Restaurant Management System',loginUser: loginUser,records:data});
  })
  }
  else {
    res.redirect('/login')
 }
})

app.get("/admin", async (req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  const getpass = catMenu.find({})
  const getitems = itemModel.find({})
  const tmodel = twoModel.find({})
  const fmodel = fourModel.find({})
  const smodel = sixModel.find({})
  try {
     let twodata = await tmodel.exec()
     let fourdata = await fmodel.exec()
     let sixdata = await smodel.exec()
     let pass = await getpass.exec()
     let item = await getitems.exec()
     res.render('admin', { title: 'Restaurant Management System',loginUser: loginUser,records_two:twodata,records_four:fourdata,records_six:sixdata,passcat:pass,items:item });
  }
  catch(err){
    throw Error();
  }
})


app.get("/add-new-category",(req,res,next)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
  res.render('addNewCategory', { title: 'Restaurant Management System',loginUser: loginUser,errors:'',success:'' });
  }
  else {
    res.redirect('/login')
 }
})

app.post("/add-new-category",upload, function(req, res,next) {
  var loginUser=localStorage.getItem('loginUser');
     const menuCategory =req.body.menuCategory;
     const image = req.file.filename;
     console.log(menuCategory)
     
     var passcatDetails =new catMenu({
         menuCategory: menuCategory,
         file:image
     });

     passcatDetails.save(function(err,doc){
       if(err) throw err;
       res.render('addNewCategory',  { title: 'Restaurant Management System',loginUser: loginUser, errors:'', success:'Password category inserted successfully' });
     })
})

app.get("/add-two",(req,res,next)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){ 
  res.render('add-two', { title: 'Restaurant Management System',loginUser: loginUser,errors:'',success:'' });
}
else {
  res.redirect('/login')
}
})

app.post("/add-two", function(req, res,next) {
  var loginUser=localStorage.getItem('loginUser');
     const tname =req.body.tname;
     const tid = req.body.tid;
     var passcatDetails =new twoModel({
         tname:tname,
         tid:tid
     });

     passcatDetails.save(function(err,doc){
       if(err) throw err;
       res.render('add-two',  { title: 'Restaurant Management System',loginUser: loginUser, errors:'', success:'Password category inserted successfully' });
     })
})


app.get("/add-four",(req,res,next)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
  res.render('add-four', { title: 'Restaurant Management System',loginUser: loginUser,errors:'',success:'' });
}
else {
  res.redirect('/login')
}
})

app.post("/add-four", function(req, res,next) {
  var loginUser=localStorage.getItem('loginUser');
     const tname =req.body.tname;
     const tid = req.body.tid;
     var passcatDetails =new fourModel({
         tname:tname,
         tid:tid
     });

     passcatDetails.save(function(err,doc){
       if(err) throw err;
       res.render('add-four',  { title: 'Restaurant Management System',loginUser: loginUser, errors:'', success:'Password category inserted successfully' });
     })
})

app.get("/add-six",(req,res,next)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
  res.render('add-six', { title: 'Restaurant Management System',loginUser: loginUser,errors:'',success:'' });
}
else {
  res.redirect('/login')
}
})

app.post("/add-six", function(req, res,next) {
  var loginUser=localStorage.getItem('loginUser');
     const tname =req.body.tname;
     const tid = req.body.tid;
     var passcatDetails =new sixModel({
         tname:tname,
         tid:tid
     });

     passcatDetails.save(function(err,doc){
       if(err) throw err;
       res.render('add-six',  { title: 'Restaurant Management System',loginUser: loginUser, errors:'', success:'Password category inserted successfully' });
     })
})

app.get("/view-two",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
  const getPassCat = twoModel.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('view-two', { title: 'Restaurant Management System',loginUser: loginUser,records:data});
})
}
else {
  res.redirect('/login')
}
})

app.get("/view-four",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
  const getPassCat = fourModel.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('view-four', { title: 'Restaurant Management System',loginUser: loginUser,records:data});
})
  }
  else {
     res.redirect('/login')
  }
})

app.get("/view-six",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    const getPassCat = sixModel.find({})
    getPassCat.exec(function(err,data){
      if(err) throw err;
    res.render('view-six', { title: 'Restaurant Management System',loginUser: loginUser,records:data});
  })
  }
   else {
    res.redirect('./login')
   }

})

app.get("/two", async (req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
  const tmodel = twoModel.find({})
  const fmodel = fourModel.find({})
  const smodel = sixModel.find({})
  try {
     let twodata = await tmodel.exec()
     let fourdata = await fmodel.exec()
     let sixdata = await smodel.exec()
     res.render('two', { title: 'Restaurant Management System',loginUser: loginUser,records_two:twodata,records_four:fourdata,records_six:sixdata });
  }
  catch(err){
    throw Error();
  }
  }
  else {
    res.redirect('/login')
  }  

})


app.get("/menuCategory",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('menuCategory', { title: 'Restaurant Management System',loginUser: loginUser,records:data});
})
  }
else {
  res.redirect('/login')
}
})


app.get('/menuCategory/delete/:id', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){  
  var passcat_id=req.params.id;
  var passdelete=catMenu.findByIdAndDelete(passcat_id);
  passdelete.exec(function(err){
    if(err) throw err;
    res.redirect('/menuCategory');
  });
}
else {
  res.redirect('/login')
}
});


app.get('/menuCategory/edit/:id', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
  var passcat_id=req.params.id;
  var getpassCategory=catMenu.findById(passcat_id);
  getpassCategory.exec(function(err,data){
    if(err) throw err;
 
    res.render('editCat', { title: 'Restaurant Management System',loginUser: loginUser,errors:'',success:'',records:data,id:passcat_id});

  });
}
else {
  res.redirect('/login')
}
});

app.post('/menuCategory/edit/', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
  var passcat_id=req.body.id;
  var menuCategory =req.body.category ;
  console.log(passcat_id,menuCategory);
 var update_passCat= catMenu.findByIdAndUpdate(passcat_id,{menuCategory :menuCategory });
 update_passCat.exec(function(err,doc){
    if(err) throw err;
       res.redirect('/menuCategory');
  });
}
else {
  res.redirect('/login')
}
});



app.get("/add-new-menu",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser) {
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('addNewMenu', { title: 'Restaurant Management System',loginUser: loginUser,records: data,success:''});
})
  }
  else {
    res.redirect('/login')
  }
})


app.post('/add-new-menu',upload,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
   const pass_cat= req.body.pass_cat;
   const name= req.body.name;
   const price = req.body.price;
   const details= req.body.details;
   const pid = req.body.pid;
   const image = req.file.filename;
  console.log(pass_cat,name,price,details)
  var password_details= new itemModel({
       pass_cat:pass_cat,
       pid:pid,
       name:name,
       price:price,
       details:details,
       file:image,
});
  console.log(pass_cat,name,price,details,pid)
password_details.save(function(err,doc){
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('addNewMenu', { title: 'Restaurant Management System',loginUser: loginUser,records: data,success:"Product Details Inserted Successfully"});

});

  });
  });




  app.get('/password-detail/edit/:id',checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser) {
    var id =req.params.id;
    var getPassDetails=itemModel.findById({_id:id});
    getPassDetails.exec(function(err,data){
  if(err) throw err;
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data1){
  res.render('editItem', { title: 'Restaurant Management System',loginUser: loginUser,records:data1,record:data,success:'' });
  });
  });
}
else {
  res.redirect('/login')
}
  });
  
  app.post('/password-detail/edit/:id',checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    const id =req.params.id;
    const pass_cat= req.body.pass_cat;
    const name= req.body.name;
    const price = req.body.price;
    const details= req.body.details;
    itemModel.findByIdAndUpdate(id,{pass_cat:pass_cat,name:name,price:price,details:details}).exec(function(err){
    if(err) throw err;
      var getPassDetails=itemModel.findById({_id:id});
    getPassDetails.exec(function(err,data){
  if(err) throw err;
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data1){
  res.render('editItem', { title: 'Restaurant Management System',loginUser: loginUser,records:data1,record:data,success:'Password Updated Successfully' });
  });
  });
  });
  });
  
  app.get('/password-detail/delete/:id', checkLoginUser,function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser){
    var id =req.params.id;
    var passdelete=itemModel.findByIdAndDelete(id);
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/view-all-item/');
    });
  }
  });
  
  app.get('/add-cart/edit/:id',function(req, res, next) {
  
    var id =req.params.id;
    const productid = 999;
    var passdelete=itemModel.findByIdAndUpdate(id,{pid:productid});
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/shop');
    });
  });

  app.get('/add-cart/delete/:id',function(req, res, next) {
    var id =req.params.id;
    const productid = 123;
    var passdelete=itemModel.findByIdAndUpdate(id,{pid:productid});
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/cart');
    });
  });

  app.get('/tables/edit/:id',function(req, res, next) {
    var id =req.params.id;
    const productid = 999;
    var passdelete=twoModel.findByIdAndUpdate(id,{tid:productid});
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/two');
    });
  });

  app.get('/twoa/edit/:id',function(req, res, next) {
    var id =req.params.id;
    const productid = 909;
    var passdelete=twoModel.findByIdAndUpdate(id,{tid:productid});
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/view-two');
    });
  });

  app.get('/foura/edit/:id',function(req, res, next) {
    var id =req.params.id;
    const productid = 909;
    var passdelete=fourModel.findByIdAndUpdate(id,{tid:productid});
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/view-four');
    });
  });

  app.get('/sixa/edit/:id',function(req, res, next) {
    var id =req.params.id;
    const productid = 909;
    var passdelete=sixModel.findByIdAndUpdate(id,{tid:productid});
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/view-six');
    });
  });

  app.get('/twob/edit/:id',function(req, res, next) {
    var id =req.params.id;
    const productid = 999;
    var passdelete=twoModel.findByIdAndUpdate(id,{tid:productid});
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/view-two');
    });
  });

  app.get('/fourb/edit/:id',function(req, res, next) {
    var id =req.params.id;
    const productid = 999;
    var passdelete=fourModel.findByIdAndUpdate(id,{tid:productid});
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/view-four');
    });
  });

  app.get('/sixb/edit/:id',function(req, res, next) {
    var id =req.params.id;
    const productid = 999;
    var passdelete=sixModel.findByIdAndUpdate(id,{tid:productid});
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/view-six');
    });
  });



  app.get('/tablef/edit/:id',function(req, res, next) {
    var id =req.params.id;
    const productid = 999;
    var passdelete=sixModel.findByIdAndUpdate(id,{tid:productid});
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/two');
    });
  });


  app.get('/tablex/edit/:id',function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    if(loginUser){
    var id =req.params.id;
    const productid = 999;
    var passdelete=fourModel.findByIdAndUpdate(id,{tid:productid});
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/two');
    });
  }
  });


  app.get('/view-all-item', function(req, res, next) {
      var loginUser=localStorage.getItem('loginUser');
      if(loginUser){

      const getPassCat = itemModel.find({})
      getPassCat.exec(function(err,data){
        if(err) throw err;
      res.render('view-all-item', { title: 'Restaurant Management System',loginUser: loginUser,records:data});
  
    })
  }
  });
   

  
app.get("/dashboard",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser) {
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
    res.render('dashboard', { title: 'Restaurant Management System',loginUser: loginUser,records:data});
  }) 
}
else {
  res.redirect('/')
}
})

app.get("/register",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./dashboard');
  }else{
  res.render('register', { title: 'Restaurant Management System', msg:'' });
  }
})
// This is the user post data 


app.post("/register", checkUsername,checkEmail, (req,res)=> {

     var password = req.body.password;
     var confirmpassword= req.body.confirmpassword;
     const phonenumber = req.body.phonenumber;
     const username = req.body.username;
     const email = req.body.email
     if(password !== confirmpassword){

        res.render("register",{ title: 'Restaurant Management System', msg:'Password not matched' })
        // console.log(password,cpasswoed,phonenumber,username,email)
     }
     else {
    
        var userDetails=new User({
            username:username,
            email:email,
            phonenumber:phonenumber,
            password:password,
            confirmpassword:confirmpassword
            
          });
            userDetails.save((err,doc)=>{
            if(err) throw err;
            res.render('login',{ title: 'Restaurant Management System', msg:"" });
       })  ;
     }
})

app.get('/shop',function(req,res,next) {
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser) {

  const getPassCat = itemModel.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
    res.render('shop', { title: 'Restaurant Management System',loginUser: loginUser,records:data});
  }) 
}
else {
  res.redirect('/login')
}
})

app.get('/cart',function(req,res,next) {
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
  const getPassCat = itemModel.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
    res.render('cart', { title: 'Restaurant Management System',loginUser: loginUser,records:data});
  }) 
}
else {
  res.redirect('/login')
}
})


app.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});



app.listen(port, () => {
    console.log(`server is running at port no. ${port}`);
});

