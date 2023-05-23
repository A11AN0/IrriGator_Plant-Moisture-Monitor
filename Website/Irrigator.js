const widgets = document.querySelectorAll(".widget");
const inputs = document.querySelectorAll(".input");
const navButton = document.querySelector(".navButton");
const emailInput = document.querySelector(".emailInput");
const minMoistureInput = document.querySelector(".minMoistureInput");
const maxMoistureInput = document.querySelector(".maxMoistureInput");

const randomColour = () => {
    return `hsla(${~~(360 * Math.random())},70%,60%,0.3)`;
};

//Made a validation method to validate user input before making post request
const validateBeforeSubmit = () => {
    const resetVals = (inputObj) => {
        inputObj.value = inputObj.placeholder;
    };

    //if blanks are submitted, replace with placeholder
    inputs.forEach((input) => {
        if (input.value.replace(/\s+/g, "") == "") {
            resetVals(input);
        }
    });

    //now test that numbers are valid
    try {
        if (Number(minMoistureInput.value) >= Number(maxMoistureInput.value)) {
            alert(
                "Minimum soil moisture settings cannot be greater than maximum soil moisture settings",
            );
            resetVals(minMoistureInput);
            resetVals(maxMoistureInput);
            return false;
        } else if (
            Number(minMoistureInput.value) < 0 ||
            Number(maxMoistureInput.value) < 0
        ) {
            alert(
                "Sorry, negative values are not permitted for soil moisture settings",
            );
            resetVals(minMoistureInput);
            resetVals(maxMoistureInput);
            return false;
            //now need to check that new values are different from old placeholder values
        } else if (
            Number(minMoistureInput.value) ===
                Number(minMoistureInput.placeholder) &&
            Number(maxMoistureInput.value) ===
                Number(maxMoistureInput.placeholder) &&
            emailInput.value.replace(/\s+/g, "") ===
                emailInput.placeholder.replace(/\s+/g, "")
        ) {
            alert("Please make at least one change before submitting");
            inputs.forEach((input) => resetVals(input));
        } else {
            return true;
        }
    } catch {
        alert("Please enter a valid number for the soil moisture settings");
        resetVals(minMoistureInput);
        resetVals(maxMoistureInput);
        return false;
    }
};

//will need to make get request to get the email, maxSoilMoisture and minSoilMoisture values from thingspeak api

//will need to make put request to update the email, maxSoilMoisture and minSoilMoisture values via the thingspeak api

widgets.forEach((widget) => {
    widget.style.backgroundColor = randomColour();
});

navButton.addEventListener("click", () => {
    validateBeforeSubmit();
});
