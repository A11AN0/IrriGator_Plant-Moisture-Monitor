const randomColour = () => {
    return `hsla(${~~(360 * Math.random())},70%,60%,0.8)`;
};

const widgets = document.querySelectorAll(".widget");
widgets.forEach((widget) => {
    widget.style.backgroundColor = randomColour();
});
