const widgets = document.querySelectorAll(".widget");
const inputs = document.querySelectorAll(".input");
const navButton = document.querySelector(".navButton");
const emailInput = document.querySelector(".emailInput");
const minMoistureInput = document.querySelector(".minMoistureInput");
const maxMoistureInput = document.querySelector(".maxMoistureInput");
const notificationFrequencyInput = document.querySelector(
    ".notificationFrequencyInput",
);

const resetVals = (inputObj) => {
    inputObj.value = inputObj.placeholder;
};

//input behaviour for placeholder text
inputs.forEach((input) => {
    input.addEventListener("mouseover", () => {
        if (input.value === "") {
            input.value = input.placeholder;
        }
    });

    input.addEventListener("mouseout", () => {
        if (input.value === input.placeholder) {
            input.value = "";
        }
    });
});

//Made a validation method to validate user input before making post request
const validateBeforeSubmit = () => {
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
            Number(minMoistureInput.value) < 1 ||
            Number(maxMoistureInput.value) < 1 ||
            Number(notificationFrequencyInput.value) < 1
        ) {
            alert(
                "Sorry, 0 or negative values are not permitted for moisture or notification frequency settings",
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
            Number(notificationFrequencyInput.value) ===
                Number(notificationFrequencyInput.placeholder) &&
            emailInput.value.replace(/\s+/g, "") ===
                emailInput.placeholder.replace(/\s+/g, "")
        ) {
            alert("Please make at least one change before submitting");
            inputs.forEach((input) => resetVals(input));
            return false;
        } else if (
            Number(maxMoistureInput.value) - Number(minMoistureInput.value) <
            7
        ) {
            alert(
                "Sorry, 7% is the smallest accurate notification range between minimum and maximum soil moisture thresholds",
            );
            return false;
        } else if (notificationFrequencyInput.value > 2880) {
            alert(
                "Sorry, the maximum notification frequency is 2880 minutes (48 hours)",
            );
            return false;
        } else {
            return true;
        }
    } catch {
        alert(
            "Please enter a valid number for the soil moisture or notification frequency settings",
        );
        resetVals(minMoistureInput);
        resetVals(maxMoistureInput);
        resetVals(notificationFrequencyInput);
        return false;
    }
};

const updateSettings = async () => {
    const rawResponse = await fetch("https://api.thingspeak.com/update.json", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            api_key: "K58A4TT85PCXBW3Y",
            field1: emailInput.value,
            field2: Math.round(maxMoistureInput.value),
            field3: Math.round(minMoistureInput.value),
            field4: Math.round(notificationFrequencyInput.value),
        }),
    });
    const content = await rawResponse.json();
    console.log(content);
};

const getSettings = async () => {
    const results = (
        await fetch(
            "https://api.thingspeak.com/channels/2159771/feeds/last.json?api_key=BJXL1CNIOQBB00XG",
        )
    ).json();
    const userSettings = await results;
    emailInput.placeholder = userSettings.field1;
    maxMoistureInput.placeholder = userSettings.field2;
    minMoistureInput.placeholder = userSettings.field3;
    notificationFrequencyInput.placeholder = userSettings.field4;
};

//will need to make post request to update the email, maxSoilMoisture and minSoilMoisture values via the thingspeak api

//will need to make get request to get the email, maxSoilMoisture and minSoilMoisture values from thingspeak api

getSettings();

//If validated user entries, make post request to update settings
navButton.addEventListener("click", async () => {
    if (validateBeforeSubmit()) {
        await updateSettings();
        await getSettings();
        location.reload();
    }
});
