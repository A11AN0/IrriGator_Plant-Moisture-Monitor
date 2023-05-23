require("dotenv").config();
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const port = process.env.PORT || 3000;
const express = require("express");
const app = express();
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
});

// mg.messages
//     .create(process.env.BASE_URL, {
//         from: "Excited User <IrriGator-UserAlerts@sandbox.mailgun.org>",
//         to: ["random@gmail.com"],
//         subject: "Hello",
//         text: "Testing some Mailgun awesomeness!",
//         html: "<h1>Testing some Mailgun awesomeness!</h1>",
//     })
//     .then((msg) => console.log(msg)) // logs response data
//     .catch((err) => console.log(err)); // logs any error

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
});
