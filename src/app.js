const express = require("express");
const path = require("path");
const app = express();
// const hbs = require("hbs")
const ejs = require("ejs")
require("./db/connect")
const User = require("./models/user")
const catMenu = require("./models/menuCat")
const itemModel = require("./models/item")
const twoModel = require("./models/twoseat")
const fourModel = require("./models/fourseat")
const sixModel = require("./models/sixseat")
const {json} = require("express");
const { errorMonitor } = require("events");
var jwt = require('jsonwebtoken');
const { abort } = require("process");
const { check, validationResult } = require('express-validator');
const multer = require("multer");
const paginate = require('mongoose-paginate');


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
    
  return res.render('register', { title: 'Password Management System', msg:'Username Already Exit' });
  
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
    
  return res.render('register', { title: 'Password Management System', msg:'Email Already Exit' });
  
   }
   next();
    });
  }




app.get("/", (req, res) =>{
  var loginUser=localStorage.getItem('loginUser');
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
    if(loginUser){
      res.redirect('./dashboard');
    }else{
    res.render('index', { title: 'Password Management System',loginUser: loginUser,records:data});
    }
})
  
});



app.get("/table", (req, res) =>{
  var loginUser=localStorage.getItem('loginUser');
  res.render("table",{ title: 'Password Management System',loginUser:loginUser, msg:'' })
});




app.get("/login",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./dashboard');
  }else{
  res.render('login', { title: 'Password Management System', msg:'' });
  }
})


app.post("/login",(req,res)=>{
  var username=req.body.username;
  const password = req.body.password;
  const checkUser=User.findOne({username:username});
  checkUser.exec((err, data)=>{
    if(data==null){
      res.render('index', { title: 'Password Management System', msg:"Invalid Username and Password." });
  
     }else{
  if(err) throw err;
  var getUserID=data._id;
  var getPassword = data.password;
  console.log(getPassword)
  if(password !== getPassword){
   res.render('login', { title: 'Password Management System', msg:"Invalid Username or Password." });
  }
  else{
    var token = jwt.sign({ userID: getUserID }, 'loginToken');
    localStorage.setItem('userToken', token);
    localStorage.setItem('loginUser', username);
    if(username == "real" && password === "1234"){
      res.redirect('/admin')
    }
    else {
    res.redirect('/dashboard');
    }
  }
}
  
   });
  
});



app.get("/admin",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  res.render("admin",{ title: 'Password Management System',loginUser:loginUser, msg:'' })
})


app.get("/add-new-category",(req,res,next)=>{
  var loginUser=localStorage.getItem('loginUser');
  res.render('addNewCategory', { title: 'Password Management System',loginUser: loginUser,errors:'',success:'' });
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
       res.render('addNewCategory',  { title: 'Password Management System',loginUser: loginUser, errors:'', success:'Password category inserted successfully' });
     })
})

app.get("/add-two",(req,res,next)=>{
  var loginUser=localStorage.getItem('loginUser');
  res.render('add-two', { title: 'Password Management System',loginUser: loginUser,errors:'',success:'' });
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
       res.render('add-two',  { title: 'Password Management System',loginUser: loginUser, errors:'', success:'Password category inserted successfully' });
     })
})


app.get("/add-four",(req,res,next)=>{
  var loginUser=localStorage.getItem('loginUser');
  res.render('add-four', { title: 'Password Management System',loginUser: loginUser,errors:'',success:'' });
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
       res.render('add-four',  { title: 'Password Management System',loginUser: loginUser, errors:'', success:'Password category inserted successfully' });
     })
})

app.get("/add-six",(req,res,next)=>{
  var loginUser=localStorage.getItem('loginUser');
  res.render('add-six', { title: 'Password Management System',loginUser: loginUser,errors:'',success:'' });
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
       res.render('add-six',  { title: 'Password Management System',loginUser: loginUser, errors:'', success:'Password category inserted successfully' });
     })
})

app.get("/view-two",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  const getPassCat = twoModel.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('view-two', { title: 'Password Management System',loginUser: loginUser,records:data});
})
})

app.get("/view-four",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  const getPassCat = fourModel.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('view-four', { title: 'Password Management System',loginUser: loginUser,records:data});
})
})

app.get("/view-six",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  const getPassCat = sixModel.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('view-six', { title: 'Password Management System',loginUser: loginUser,records:data});
})
})

app.get("/two", async (req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  const tmodel = twoModel.find({})
  const fmodel = fourModel.find({})
  const smodel = sixModel.find({})
  try {
     let twodata = await tmodel.exec()
     let fourdata = await fmodel.exec()
     let sixdata = await smodel.exec()
     res.render('two', { title: 'Password Management System',loginUser: loginUser,records_two:twodata,records_four:fourdata,records_six:sixdata });
  }
  catch(err){
    throw Error();
  }
  

})


app.get("/menuCategory",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('menuCategory', { title: 'Password Management System',loginUser: loginUser,records:data});
})
})


app.get('/menuCategory/delete/:id', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var passcat_id=req.params.id;
  var passdelete=catMenu.findByIdAndDelete(passcat_id);
  passdelete.exec(function(err){
    if(err) throw err;
    res.redirect('/menuCategory');
  });
});


app.get('/menuCategory/edit/:id', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var passcat_id=req.params.id;
  var getpassCategory=catMenu.findById(passcat_id);
  getpassCategory.exec(function(err,data){
    if(err) throw err;
 
    res.render('editCat', { title: 'Password Management System',loginUser: loginUser,errors:'',success:'',records:data,id:passcat_id});

  });
});

app.post('/menuCategory/edit/', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var passcat_id=req.body.id;
  var menuCategory =req.body.category ;
  console.log(passcat_id,menuCategory);
 var update_passCat= catMenu.findByIdAndUpdate(passcat_id,{menuCategory :menuCategory });
 update_passCat.exec(function(err,doc){
    if(err) throw err;
       res.redirect('/menuCategory');
  });
});



app.get("/add-new-menu",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('addNewMenu', { title: 'Password Management System',loginUser: loginUser,records: data,success:''});
})
})


app.post('/add-new-menu',function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
   const pass_cat= req.body.pass_cat;
   const name= req.body.name;
   const price = req.body.price;
   const details= req.body.details;
   const pid = req.body.pid;
  console.log(pass_cat,name,price,details)
  var password_details= new itemModel({
       pass_cat:pass_cat,
       pid:pid,
       name:name,
       price:price,
       details:details
});
  console.log(pass_cat,name,price,details,pid)
password_details.save(function(err,doc){
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
  res.render('addNewMenu', { title: 'Password Management System',loginUser: loginUser,records: data,success:"Product Details Inserted Successfully"});

});

  });
  });




  app.get('/password-detail/edit/:id',checkLoginUser, function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    var id =req.params.id;
    var getPassDetails=itemModel.findById({_id:id});
    getPassDetails.exec(function(err,data){
  if(err) throw err;
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data1){
  res.render('editItem', { title: 'Password Management System',loginUser: loginUser,records:data1,record:data,success:'' });
  });
  });
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
  res.render('editItem', { title: 'Password Management System',loginUser: loginUser,records:data1,record:data,success:'Password Updated Successfully' });
  });
  });
  });
  });
  
  app.get('/password-detail/delete/:id', checkLoginUser,function(req, res, next) {
    var loginUser=localStorage.getItem('loginUser');
    var id =req.params.id;
    var passdelete=itemModel.findByIdAndDelete(id);
    passdelete.exec(function(err){
      if(err) throw err;
      res.redirect('/view-all-item/');
    });
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



  app.get('/view-all-item', function(req, res, next) {
      var loginUser=localStorage.getItem('loginUser');
      const getPassCat = itemModel.find({})
      getPassCat.exec(function(err,data){
        if(err) throw err;
      res.render('view-all-item', { title: 'Password Management System',loginUser: loginUser,records:data});
  
    })
    
  });
   

  
app.get("/dashboard",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  const getPassCat = catMenu.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
    res.render('dashboard', { title: 'Password Management System',loginUser: loginUser,records:data});
  }) 
})

app.get("/register",(req,res)=>{
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./dashboard');
  }else{
  res.render('register', { title: 'Password Management System', msg:'' });
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

        res.render("register",{ title: 'Password Management System', msg:'Password not matched' })
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
            res.render('login',{ title: 'Password Management System', msg:"" });
       })  ;
     }
})

app.get('/shop',function(req,res,next) {
  const getPassCat = itemModel.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
    res.render('shop', { title: 'Password Management System',records:data});
  }) 
})

app.get('/cart',function(req,res,next) {
  const getPassCat = itemModel.find({})
  getPassCat.exec(function(err,data){
    if(err) throw err;
    res.render('cart', { title: 'Password Management System',records:data});
  }) 
})


app.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});



app.listen(port, () => {
    console.log(`server is running at port no. ${port}`);
});

