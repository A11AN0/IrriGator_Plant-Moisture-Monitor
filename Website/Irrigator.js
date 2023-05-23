const widgets = document.querySelectorAll(".widget");
const inputs = document.querySelectorAll(".input");
const emailInput = document.querySelector(".emailInput");
const minMoistureInput = document.querySelector(".minMoistureInput");
const maxMoistureInput = document.querySelector(".maxMoistureInput");

const randomColour = () => {
    return `hsla(${~~(360 * Math.random())},70%,60%,0.3)`;
};

const validateBeforeSubmit = () => {
    try {
        if (Number(minMoistureInput.value) >= Number(maxMoistureInput.value)) {
            alert(
                "Minimum soil moisture settings cannot be greater than maximum soil moisture settings",
            );
            return false;
        }
    } catch {
        alert("Please enter a valid number for the soil moisture settings");
        return false;
    }
};

//will need to make get request to get the email, maxSoilMoisture and minSoilMoisture values from thingspeak api

//will need to make put request to update the email, maxSoilMoisture and minSoilMoisture values via the thingspeak api

widgets.forEach((widget) => {
    widget.style.backgroundColor = randomColour();
});
