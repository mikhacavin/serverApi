// let app = require("express")();
// let server = require("http").createServer(app);
// let io = require("socket.io")(server);

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
var cors = require("cors");
const { listeners } = require("process");

const server = http.createServer(app);

// mongoose.connect("mongodb://localhost:27017/restful_db", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;
// db.on("error", (error) => console.error(error));
// db.once("open", () => console.log("database connected"));

var io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(upload.array());
app.use(cors());

//koneksi
io.on("connection", (socket) => {
  socket.on("disconnect", function () {
    io.emit("users-changed", { user: socket.username, event: "left" });
  });

  socket.on("set-name", (name) => {
    console.log("Set Name :", name);
    socket.username = name;
    io.emit("users-changed", { user: name, event: "joined1" });
  });

  socket.on("send-message", (message) => {
    io.emit("message", {
      msg: message.text,
      user: socket.username,
      createdAt: new Date(),
    });
  });
  socket.on("client:register", async (data) => {
    const { hp, password } = data;
    io.emit("client:register-response", `${hp}`);
    const otp = Math.floor(100000 + Math.random() * 900000);
    io.emit("registerResponse", {
      hp: `${hp}`,
      otp: `${otp}`,
      appName: "Test Register",
    });
  });
});

app.post("/otpboro", (request, response) => {
  let otp = request.body.otp;
  let hp = request.body.hp;
  let app = request.body.app;

  console.log(request.body);
  // console.log(request.query);

  io.sockets.emit("AllData", {
    otpUser: otp,
    hpUser: hp,
    appName: app,
  });

  response.json({
    otp: otp,
    hp: hp,
    app: app,
  });
});

app.get("/", (req, res) => {
  res.json({ response: "Hello World 😊" });
});

app.post("/post", function (request, response) {
  let otp = request.query.otp;
  let hp = request.query.hp;
  let app = request.query.app;

  // response.json({
  //   otp: otp,
  //   hp: hp,
  //   app: app,
  // });
  response.json({
    otp: request.query,
  });
});

server.listen(process.env.PORT || 3001, () =>
  console.log("server on " + process.env.PORT)
);
