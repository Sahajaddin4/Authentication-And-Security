require('dotenv').config() //Have to keep at top
const express=require('express');
const ejs=require('ejs');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const encryptData=require('mongoose-encryption');

const app=express();

//Make Static file usuable
app.use(express.static('public'));

/////////////////////////////////////Database connection setup all////////////////////////////////

mongoose.set('strictQuery',true);
const optionDb={
    useNewUrlParser:true
}
mongoose.connect('mongodb://127.0.0.1:27017/User',optionDb).then(()=>
{
    console.log("Database connection successful.");
}).catch((err)=>
{
    console.log(err);
})

//creating schema
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});

//creating secrets schema
const secretSchema=new mongoose.Schema(
    {
        userSecrets:{
            type:String,
            required:true
        }
    }
);



//Encrypt password
const secret =process.env.SECRET;

userSchema.plugin(encryptData,{secret:secret ,encryptedFields:['password']});

//creating model
const UserData=mongoose.model('UserData',userSchema);
const Secret=mongoose.model('Secret',secretSchema);

////////////////////////////////////////////////End of database setup/////////////////////////////////////////



// Ejs file use setup
app.set('view engine','ejs');

//Body parser
app.use(bodyParser.urlencoded({extended:true}));

////////////////////////////All type route handle///////////////////////////////////////

//Home route
app.get('/',(req,res)=>
{
    res.render('home');
});

//Login route
app.route('/login').get((req,res)=>{
    res.render('login');
}).post((req,res)=>{
   const userEmail=req.body.userEmail;
   const userPassword=req.body.userPassword;
  
    UserData.findOne({email:userEmail},(err,userFound)=>
    {
        if(!err)
        {
            if (userFound && userFound.password===userPassword) {
                res.render('secrets');
            } else {
               
                res.redirect('register');

            }
        }
    })


})

//submit route
app.route('/submit').get((req,res)=>{
    res.render('submit');}).post((req,res)=>{
        
        const userSecrets=req.body.userSecrets;
        
        const newSecret=new Secret(
            {
                userSecrets:userSecrets
            }
        )
        newSecret.save();
        res.redirect('/secrets');
    });

//Secret routes
app.get('/secrets',(req,res)=>{

    //Secret.findOne()
    res.render('secrets');
})
//register route
app.route('/register').post((req,res)=>{
    
    const userEmail=req.body.userEmail;
    const userPassword=req.body.userPassword;

    const userDetails=new UserData(
        {
            email:userEmail,
            password:userPassword
        }
    );

    UserData.findOne({email:userEmail},(err,foundData)=>
    {
        if(!err)
        {
            if(!foundData)
            {
                userDetails.save(
                    (err)=>
                    {
                        console.log(err);
                    }
                );
                res.redirect('login');
            }
            else{
                res.send("Account already exists!!")
            }
        }
    });

}).get((req,res)=>{
    res.render('register');
});


/////////////////////////////////Route handled///////////////////////////////////

//Port Define
app.listen(3000,()=>
{
    console.log("Server is running at port 3000..");
});