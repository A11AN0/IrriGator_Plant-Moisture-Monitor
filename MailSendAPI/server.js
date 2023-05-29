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

function soilMoistureMessage(max, min, current, mail) {
    const approachingMin = current - min <= 3 && current - min > 0;
    const approachingMax = max - current <= 3 && max - current > 0;
    const belowMin = current <= min;
    const aboveMax = current >= max;

    if (belowMin) {
        return {
            message: `Hello, my current soil moisture is ${current}%. That's ${
                min - current === 0 ? "exactly at" : min - current + "% below"
            } your requested minimum soil moisture threshold of ${min}%, please water me to ensure optimal soil moisture and healthy plants! :)`,
            emailSubject: "Soil Moisture is too low!",
        };
    } else if (aboveMax) {
        return {
            message: `Hello, my current soil moisture is ${current}%. That's ${
                current - max === 0 ? "exactly at" : current - max + "% above"
            } your requested maximum soil moisture threshold of ${max}%, please slow down on the watering, there's only so much growing plants can take! :)`,
            emailSubject: "Soil Moisture is too high!",
        };
    } else if (approachingMin) {
        return {
            message: `Hello, my current soil moisture is ${current}%. That's ${
                current - min
            }% away from your requested minimum soil moisture threshold of ${min}%, it's time to start thinking about watering! It's good for you and me :)`,
            emailSubject: "Almost time to start watering",
        };
    } else if (approachingMax) {
        return {
            message: `Hello, my current soil moisture is ${current}%. That's ${
                max - current
            }% away from your requested maximum soil moisture threshold of ${max}%, it might be best to slow down on the watering! - Everything in moderation :)`,
            emailSubject: "Let's slow down with the water",
        };
    } else {
        return {
            message: `Hello, my current soil moisture is ${current}%. This is within the optimal range: (${min}% - ${max}%)! - Awesome job! :)`,
            emailSubject: "Soil Moisture is optimal!",
        };
    }
}

//should be called if request key matches .env API key
function sendEmail(emailAddress, minMoisture, currentMoisture, maxMoisture) {
    const message = soilMoistureMessage(
        maxMoisture,
        minMoisture,
        currentMoisture,
        emailAddress,
    );

    mg.messages
        .create(process.env.BASE_URL, {
            from: "IrriGator Notifications <mailgun@sandbox-123.mailgun.org>",
            to: [emailAddress],
            subject: message.emailSubject,
            text: message.message,
            html: `<div
                style="
                color: #e5ffcf;
                font-weight: bolder;
                font-style: italic;
                background-color: #7b4e0c;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                font-family: Arial, sans-serif;
                background-image: url('https://images.unsplash.com/photo-1512243753-2d6941bef6a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2002&q=80');
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                background-attachment: fixed;
                display: flex;
                justify-content: center;
                align-items: center;
            "
        >
            <p>
            ${message.message}
            </p>
        </div>`,
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

    try {
        const {
            api_key,
            email,
            minimumSoilMoisture,
            currentSoilMoisture,
            maximumSoilMoisture,
        } = data;
        // Use the received data as needed
        if (api_key != process.env.MAILGUN_API_KEY) {
            res.json({
                success: false,
                message: `Invalid API key`,
            });
            return;
        } else if (
            !email ||
            !maximumSoilMoisture ||
            Number(maximumSoilMoisture) < 0 ||
            Number(minimumSoilMoisture) < 0 ||
            Number(currentSoilMoisture) < 0 ||
            Number(maximumSoilMoisture) < Number(minimumSoilMoisture) ||
            !minimumSoilMoisture ||
            currentSoilMoisture == null
        ) {
            res.json({
                success: false,
                message:
                    "Missing required fields or invalide soil moisture values",
            });
        } else {
            sendEmail(
                email,
                Number(minimumSoilMoisture),
                Number(currentSoilMoisture),
                Number(maximumSoilMoisture),
            );
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
