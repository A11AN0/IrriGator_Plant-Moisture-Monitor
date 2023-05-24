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
function sendEmail(emailAddress, minMoisture, currentMoisture) {
    const message = `Hello, ${emailAddress}, the current soil moisture is ${currentMoisture}% which is ${
        minMoisture - currentMoisture
    }% below your requested threshold of ${minMoisture}% - no need to worry, IrriGator has initiated plant watering - Please monitor water levels to ensure that the IrriGator has enough water to continue watering your plants :)`;

    mg.messages
        .create(process.env.BASE_URL, {
            from: "Excited User <mailgun@sandbox-123.mailgun.org>",
            to: [emailAddress],
            subject: "IrriGator User Notification - Initiated Plant Watering",
            text: message,
            html: `<div style="color:#689F38; background-color:#E8F5E9; border-radius:8px; padding:20px; text-align:center;">
            ${message}
          </div>
          `,
        })
        .then((msg) => {
            emptyString = msg;
            console.log(msg);
        }) // logs response data
        .catch((err) => {
            console.log(err);
        }); // logs any error
}

app.post("/emailSender", (req, res) => {
    const data = req.body;
    var emptyMessage = "";

    try {
        const { api_key, email, minimumSoilMoisture, currentSoilMoisture } =
            data;
        // Use the received data as needed
        if (api_key != process.env.MAILGUN_API_KEY) {
            res.json({
                success: false,
                message: `Invalid API key`,
            });
            return;
        } else if (
            !email ||
            !minimumSoilMoisture ||
            currentSoilMoisture == null
        ) {
            res.json({
                success: false,
                message: "Missing required fields",
            });
        } else {
            sendEmail(email, minimumSoilMoisture, currentSoilMoisture);
        }

        // Example response
        const successresponse = {
            success: true,
            message: "Request received successfully",
        };

        res.json(successresponse);
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Invalid request",
        });
    }
});
