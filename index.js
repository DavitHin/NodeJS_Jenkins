const express = require('express');
const mongoose = require('mongoose');

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

//Connect to MongoDB
mongoose
  .connect(
    'mongodb+srv://cluster1.hius7hi.mongodb.net/exam3-k8-atlas',
    { 
      dbName: 'exam3-k8-atlas',
      user: 'hinsela',
      pass: '$Clone009',
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const schema_mongoose = require('mongoose');
  



//MongoDB Schema
const EmployeeSchema = schema_mongoose.Schema(
  {
    uid: { type: Number },
    uname: { type: String },
    uemail: { type: String },
    upassword: {type: String },
  },
  {
    timestamps: true
  }
);

EmpModel = schema_mongoose.model('emp_collection', EmployeeSchema);

/*
{
  "userid":100,
  "username":"Sela",
  "useremail":"selahin007@gmail.com",
  "userpassword": "12345"
}
*/

//API ADD RECORD
/*app.post('/add', (req, res) => {
  const { userid, userpassword } = req.body;
  // Check if all required fields are provided
  if (!userid || !userpassword) {
    return res.status(400).send('userid and Password are required');
  }
  const newEmp = new EmpModel({
    uid: req.body.userid,
    uname: req.body.username,
    uemail: req.body.useremail,
    upassword: req.body.userpassword
  }); //CLOSE EmpModel

  //INSERT/SAVE THE RECORD/DOCUMENT
  newEmp.save()
    .then(inserteddocument => res.status(200).send('User successfully inserted to Database'))
    .catch(err => res.status(500).send('Error saving employee'));
});*/
app.post('/add', async (req, res) => {
  const { userid, userpassword, useremail } = req.body;
  // Check if all required fields are provided
  if (!userid || !userpassword || !useremail) {
    return res.status(400).send('Userid, Password, and Email are required');
  }

  try {
    const existingEmployee = await EmpModel.findOne({
      $or: [{ uid: userid }, { uemail: useremail }]
    });

    if (existingEmployee) {
      if (existingEmployee.uid === userid) {
        return res.status(409).send('User with the same userid already exists');
      } else if (existingEmployee.uemail === useremail) {
        return res.status(409).send('User with the same Email already exists');
      }
    }

    const newEmp = new EmpModel({
      uid: req.body.userid,
      uname: req.body.username,
      uemail: req.body.useremail,
      upassword: req.body.userpassword
    });

    //INSERT/SAVE THE RECORD/DOCUMENT
    await newEmp.save();
    res.status(200).send('User successfully inserted to Database');
  } catch (error) {
    res.status(500).send('Error saving employee');
  }
});



//API View User
app.get('/viewall', (req, res) => {
  EmpModel.find({})
    .then(emps => res.send(emps))
    .catch(err => res.status(404).json({ msg: 'No User found' }));
});


//LOGIN API
app.post('/login', (req, res) => {
  const { userid, userpassword } = req.body;

  EmpModel.findOne({ uid: userid })
    .then(employee => {
      if (!employee) {
        return res.status(404).send('User not found');
      }

      if (employee.upassword === userpassword) {
        return res.status(200).send('Login successful');
      } else {
        return res.status(401).send('Incorrect password');
      }
    })
    .catch(err => res.status(500).send('Error searching for User'));
});

//SEARCH API by Employee ID
app.get('/search/:userid', (req, res) => {
  // "uid" : parseInt(req.params.uid) Convert uid String to Int
  EmpModel.find({ "uid": parseInt(req.params.userid) })
    .then(getsearchdocument => {
      if (getsearchdocument.length > 0) {
        res.send(getsearchdocument);
      }
      else {
        return res.status(404).send({ message: "Note not found with id " + req.params.uid });
      }
    }) //CLOSE THEN
    .catch(err => {
      return res.status(500).send({ message: "DB Problem..Error in Retriving with id " + req.params.uid });
    })//CLOSE CATCH
}//CLOSE CALLBACK FUNCTION BODY
);//CLOSE GET METHOD

//EmpModel.deleteMany
app.delete('/remove/:userid', (req, res) => {
  EmpModel.findOneAndRemove({ "uid": parseInt(req.params.userid) })
    .then(deleteddocument => {
      if (deleteddocument != null) {
        res.status(200).send('DOCUMENT DELETED successfully!' + deleteddocument);
      }
      else {
        res.status(404).send('INVALID EMP ID ' + req.params.uid);
      }
    }) //CLOSE THEN
    .catch(err => {
      return res.status(500).send({ message: "DB Problem..Error in Delete with id " + req.params.uid });
    })//CLOSE CATCH
}//CLOSE CALLBACK FUNCTION BODY
); //CLOSE Delete METHOD

const port = 9005;
app.listen(port, () => console.log('Express Server is running at port number 9005'));