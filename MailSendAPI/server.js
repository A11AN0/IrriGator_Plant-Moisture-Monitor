//Using dotenv to hide API keys - was successful given that this is server side implementation/ hosted on Azure!
require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || "3000";
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("This is the IrriGator User Mail Alert API");
});

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
});

const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
});

//should be called if request key matches .env API key
function sendEmail() {
    mg.messages
        .create(process.env.BASE_URL, {
            from: "Excited User <mailgun@sandbox-123.mailgun.org>",
            to: ["matrixboston7613@gmail.com"],
            subject: "Hello",
            text: "Testing some Mailgun awesomeness!",
            html: "<h1>Testing some Mailgun awesomeness!</h1>",
        })
        .then((msg) => console.log(msg)) // logs response data
        .catch((err) => console.log(err)); // logs any error
}

app.post("/emailSender", (req, res) => {
    res.send(express.json(req.body));
});
