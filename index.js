const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const localStorage = require('localStorage');
const shortid = require('shortid');
const User = require('./models/User');
const Appointment = require('./models/Appointment')
const app = express();
const { auth, requiresAuth } = require('express-openid-connect');
require('dotenv').config();

const config = {
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    secret: process.env.SECRET,
  };
  
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(auth(config));
  

//DB Config
const db = require('./config/keys').MongoURI;
const { response } = require('express');

//Connect DB
mongoose.connect(db, {useNewUrlParser: true,useUnifiedTopology: true})
.then(() => console.log('db connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
    if(req.oidc.isAuthenticated()){
        res.redirect('/verify')
    }else{
        res.render('home')
    }
});


app.get('/verify', requiresAuth(), (req,res)=>{
    var response = req.oidc.user
    if(response.email_verified == false){
        res.render('verification')
    }else{
        res.redirect('/details')
    }
});

app.get('/details', requiresAuth(), (req,res)=>{
    const email = req.oidc.user.email
    User.findOne({email: email})
    .then((doc)=>{
        if(doc){
            res.redirect('/dashboard')
        }else{
            res.render('details')
        }
    })
    .catch((err)=>console.log(err))
    localStorage.setItem('email', email)  
});

app.post('/post-info', (req,res)=>{
    const {username , age, typeOfUser} = req.body
    const email = localStorage.getItem('email')

    let pfpList = ["https://cdn.discordapp.com/attachments/751511569971675216/818749306893762570/Untitled-3.png","https://cdn.discordapp.com/attachments/751511569971675216/818749761368752138/Untitled-4.png","https://cdn.discordapp.com/attachments/751511569971675216/818750283445174332/Untitled-5.png","https://cdn.discordapp.com/attachments/751511569971675216/818750816444743750/Untitled-6.png"]

    let pfpIndex = Math.floor(Math.random() * (4 - 0) + 0);
    const pfp = pfpList[pfpIndex];

    const appointments = []

    newUser = new User({
        'name': username,
        'age': age,
        'email': email,
        'appointments': appointments,
        'typeOfUser': typeOfUser,
        'pfpUrl': pfp,
    });

    newUser.save()
    .then(()=>{
        res.redirect('/dashboard')
    })
    .catch((err)=>console.log(err))
})

app.get('/dashboard', requiresAuth(), (req,res)=>{
    const email = req.oidc.user.email
    User.findOne({email: email})
    .then((doc)=>{
        if(doc){
            Appointment.find({})
            .then(docs=>{
                res.render('dashboard',{user:doc, appointments:docs})
            })
            .catch(err=>console.log(err))
        }else{
            res.send('Error, No Document Found')
        }
    })
    .catch((err)=>console.log(err))
});

app.post('/add-appoint', async(req,res)=>{
    const {name, email, date, time} = req.body;
    const id = await shortid.generate();

    newAppointment = new Appointment({
        'ownerName': name,
        'ownerEmail': email,
        'appointmentCode': id,
        'appointmentDate': date,
        'appointmentTime': time,
        'status': 'Added'
    })

    newAppointment.save()
    .then(()=>{
        const newApp = {'date': date, 'time': time, 'code': id, 'status':'Added'}

        User.updateOne({email},{
            "$push" : {
                "appointments":  newApp
            },
        }).then(response=>{
            res.redirect('/dashboard')
        }).catch(err=>console.log(err))
    }).catch(err=>console.log(err))

});

app.get('/request/:code', requiresAuth(),(req,res)=>{
    const email = req.oidc.user.email
    Appointment.findOne({appointmentCode: req.params.code})
    .then(doc=>{
        res.render('request',{owner:doc, memberEmail: email})
    })
    .catch(err=>console.log(err))
});

app.post('/request-appoint',(req,res)=>{
    const{appointmentCode, memberEmail, ownerEmail} = req.body 

    User.findOne({email:memberEmail})
    .then(user=>{
        if(user){
            Appointment.updateOne({appointmentCode:appointmentCode},{
                $set : {
                    'memberName': user.name,
                    'memberEmail': user.email,
                    'status': 'Pending'
                }
            })
            .then(()=>{
                User.findOne({email:ownerEmail},{
                })
                .then((doc)=>{
                    let newOwnerAppointments = doc.appointments
                    if(doc){
                        for(let i=0; i< doc.appointments.length; i++){
                            if(doc.appointments[i].code == appointmentCode){
                                newOwnerAppointments[i]['status'] = 'Pending'
                                User.updateOne({email:ownerEmail},{
                                    $set : {
                                        appointments: newOwnerAppointments
                                    }
                                })
                                .then(()=>{
                                    User.updateOne({email: user.email},{
                                        $set : {
                                            appointments: newOwnerAppointments
                                        }
                                    })
                                    .then(()=>{
                                        res.redirect('/dashboard')
                                    }).catch(err=>console.log(err))
                                })
                                .catch(err=>console.log(err))
                            }
                        }
                    }
                })
                .catch(err=>console.log(err))
            }).catch(err=>console.log(err))
        }else{
            console.log('User not found')
        }
    }).catch(err=>console.log(err))
    
})



const port = process.env.PORT || 3000

app.listen(port, console.log(`Server listening on ${port}`))