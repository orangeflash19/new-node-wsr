const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs')
var msg;
var witpass;
const app = express();
const port = process.env.PORT || 3000;

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

//handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Body Parser Middleware
app.use(bodyParser.urlencoded( { extended: false } ) );
app.use(bodyParser.json());

//method override Middleware
app.use(methodOverride('_method'));

//express session Middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));


//flash Middleware
app.use(flash());

//global Variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//Index or homepage route
app.get('/', (req, res) => {
  const title = 'WSR';
  res.render('index', {
    title: title
  });
});

//about route
app.get('/about', (req, res) => {
  res.render('about');
});

// witness login Form
app.get('/witness', (req, res) => {
  res.render('witness');
});

// admin login Form
app.get('/login/admin', (req, res) => {
  res.render('login/admin');
});

//Process admin login form
app.post('/login', (req, res) => {
  const user = 'admin';
  const pass = 'admin123';
  if(req.body.username == user && req.body.password == pass){
    console.log('admin successfully logged in...');
    res.render('adminpanel');
  }
});

//Process witness login form
app.post('/witness', (req, res) => {
      fs.readFile('Output.txt', (err, data) => {
       if (err) throw err;
       console.log(data);
       witpass = data;
    });
    if(req.body.password == witpass ){
      console.log('witness successfully logged in...');
      console.log(req.body.password);
      console.log(witpass);
      res.render('videopage', { msg: 'Welcome to WSR witpass' });
    }



});

//adminpanel on back
app.get('/adminpanel', (req, res) => {
  res.render('adminpanel');
});

//videopage form
app.get('/videopage', (req, res) => {
  res.render('videopage');
});

//credentials form
app.get('/login/credentials', (req, res) => {
  res.render('login/credentials');
});

//credentials form process
app.post('/login/credentials', (req, res) => {
  witpass = req.body.passwordHolder;

  // Write data in 'Output.txt' .
fs.writeFile('Output.txt', witpass, (err) => {
    // In case of a error throw err.
    if (err) throw err;
})
  const output = `
  <h3> Message </h3>
  <p> ${req.body.passwordHolder} </p>`;

      // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'rentaros80@gmail.com', // email id of sender
        pass: 'satomiren' // email password of sender
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // setup email data with unicode symbols
      let mailOptions = {
        from: '"Nodemailer Contact testing" <rentaros80@gmail.com>', // sender address
        to: req.body.email, // list of receivers
        subject: "Node witness password", // Subject line
        text: "something...", // plain text body
        html: output // html body
      };

      // send mail with defined transport object
       transporter.sendMail(mailOptions, (error, info) => {
           if (error) {
               return console.log(error);
           }

           console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));


            res.render('login/credentials', { msg: 'Email has been sent' });

  });
});


//starts the server
app.listen(port, () => {
  console.log(`server started on port ${port}`);
});
