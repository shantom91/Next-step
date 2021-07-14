// express ******
require("dotenv").config();
var express = require("express");
var jwt = require("jsonwebtoken");
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var users = require("./validation");
const cookie = require("cookies");
const bcrypt = require("bcrypt");
const auth = require("./middleware/auth");
var cookieParser = require("cookie-parser");
app.use(cookieParser());
var crypto = require("crypto");
var mongo = require("mongodb");

var Grid = require("gridfs-stream");



const maketoken = async () => {
  const tokenv = await jwt.sign({ _id: "dfs" }, "jdkd");
  console.log("tkoen is here " + tokenv);
};


// *****************
// MongoDb connection
const mongoose = require("mongoose");
const { restart } = require("nodemon");
const { response } = require("express");



let gfs;
var db = mongoose.connection;
var con = mongoose.connect("mongodb://localhost/user", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
db.once("open", function () {
  console.log("mongodb is connected");
  gfs = Grid(db.db, mongoose.mongo);

  // console.log(grid);
}).on("error", () => {
  console.log("thie i an error");
});

// ---------CONNECTED WITH DATABASE----------

// *************schema

// FINDING IF USER HAS ALREADY LOGGED IN

let authUser = async (req) => {
  try {
    console.log("auth start ");

    var token = await req.cookies["shiv"];
    var verifyToken = await jwt.verify(token, process.env.SECRET_KEY);
    let any = await users.findOne({ _id: verifyToken._id });

       return any;
  } catch {
    console.log("not found");
    return false;
  }
};


app.use(express.static("views"));

// routing

//---------HOME PAGE--------------


app.get("/", (req, res) => {
  try {
    var any = authUser(req);

    any.then((user) => {
      if (user) {
        let sortedUser = user.component.sort((a, b) => {
          if (
            a.componentTotalSum * b.componentTotalDay >
            b.componentTotalSum * a.componentTotalDay
          )
            return 1;
          else if (
            a.componentTotalSum * b.componentTotalDay ==
            b.componentTotalSum * a.componentTotalDay
          ) {
            if (a.componentTotalDay > b.componentTotalDay) return 1;
            if (a.componentTotalDay == b.componentTotalDay) {
              if (a.componentName < b.componentName) return 1;
              if (a.componentName == b.componentName) return 0;
            }
            return -1;
          }
          return -1;
        });

        console.log(sortedUser);

        res.render("exp.ejs", { name: sortedUser });
      } else res.render("front.ejs");
    });
  } catch {
    res.send("home pasge error hai");
  }
});
app.get("/Alreadyuser", auth, (req, res) => {
  try {
    console.log(req.cookies["zaina"]);
    console.log("ho gya kaam be");
    if (!req.body) res.send("You are not a valid user.Register firstly");
    else console.log(req.body);
    res.send("ok");
  } catch {
    res.send("already user section eroor");
  }
});

// REGISTERING TO LOGIN--------------
app.post("/register/process", async (req, res) => {
  try {
    console.log(req.body);
    console.log("hello");
    var user = new users({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });

    var anyuser = new users();
    anyuser = await users.findOne({ username: user.username });

    if (anyuser) {
      console.log(" not pure");
      res.send("not reg either password notmatched or email already exist reg");
    } else {
      if (user.password == user.confirmPassword) {
        const token = await jwt.sign({ _id: user._id }, shivanand);
        console.log(user);
        user.tokens.push(token);
        // console.log(user)
        const us = await user.save();
        console.log("see " + us);
        //user.save();
      } else console.log("not same");
      res.send("ok reg");
    }
  } catch {
    res.send("reg error");
  }
});

//----------------LOGIN----------------------

app.post("/login/process", async (req, res) => {
  console.log("see login");
  console.log(req.body);
  var user;
  try {
    user = await users.findOne({ username: req.body.username });
    console.log(user);

    if (user) {
      //  var pass = await bcrypt.hash(req.body.password, 8);
      // console.log(req.body.password)
      var isValid = bcrypt.compare(req.body.password, user.password);
      console.log(isValid);
      if (isValid) {
        res.cookie("shiv", user.tokens[0], {
          httpOnly: true,
        });
        console.log("aaya");
      } else {
        console.log("not found");
      }
    }
  } catch {
    console.log("not found");
  }

  res.redirect("/");
});

// 
app.get("/add", (req, res) => {
  res.render("ok adding soon");
});
app.get("/fillInfo", (req, res) => {
  res.render("ok filling soon");
});

app.post("/Addcomponent", async (req, res) => {
  // console.log("see login")
  console.log(req.body.NameOfComponent);

  var any = authUser(req);
  console.log(any);
  any.then((user) => {
    if (user) {
      var today = new Date();
      var xyz = {
        componentName: req.body.NameOfComponent,
        componentTotalSum: 0,
        componentTotalDay: 1,
        componentPreWork: 0,
        componentLastUpdatedDate: today,
        componentMessageOfToday: "",
        compomentImp: req.body.Imp,
      };
      // var xyz;
      var mila = 0;

      for (
        var x = 0;
        x < user.component.length && req.body.NameOfComponent != "";
        x++
      ) {
        if (user.component[x].componentName == req.body.NameOfComponent) {
          mila = 1;
          break;
        }
      }
      if (mila == 0) {
        user.component.push(xyz);
        user.save();
      }
      console.log(user.component.length);
      res.render("exp.ejs", { name: user.component });
    } else res.send("no got");
  });
  // res.send("Server side error please login again");
});


// TO ADD A NEW COMPONENT-----------------------------
app.post("/AddWork/:section", async (req, res) => {
  var section = req.params.section;

  console.log(section);
  var any = authUser(req);
  any.then((user) => {
    if (user) {
      var today = new Date();
      console.log(today);
      var ok = false;
      for (var x = 0; x < user.component.length; x++) {
        if (user.component[x].componentName == section) {
          {
            ok = true;
            if (
              user.component[x].componentLastUpdatedDate.toLocaleDateString() ==
              today.toLocaleDateString()
            ) {
              user.component[x].componentTotalSum -=
                user.component[x].componentPreWork - req.body.Work;
              user.component[x].componentPreWork = req.body.Work;
            } else {
              user.component[x].componentTotalSum += req.body.Work;
              user.component[x].componentPreWork = req.body.Work;
              user.component[x].componentLastUpdatedDate = today;
            }
            user.component[x].componentMessageOfToday += req.body.Msg;

            user.save();
            break;
          }
        }
      }
      console.log("seee==" + req.body);
      console.log(user);
      if (!ok) {
        res.send("component not found");
      } else res.redirect("/");
    }
  });
});



// server start command
app.listen(3000, (req, res) => {
  console.log("server is started");
});
