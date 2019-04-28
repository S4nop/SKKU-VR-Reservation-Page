const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs")
const PORT = 3000;
const DATABASE = "/databases";

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.set("trust proxy", "loopback");
app.engine('html', require('ejs').renderFile);

const server = app.listen(PORT, function() {
    console.log("Express server has started on port 3000")
});

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "@#@$MYSIGN#@$#$",
    resave: false,
    saveUninitialized: true
}));

const router = require("./router/main")(app, express, fs);