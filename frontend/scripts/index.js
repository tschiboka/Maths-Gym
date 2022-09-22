const app = {
    solution: 0,
    numbers: [],
    currentOperation: "addition",
    steps: [],
    currentStep: 0,
    time: 0,
    operations: {
        addition: false,
        subtraction: false,
        multiplication: false,
        division: false,
        expand: false
    },
    settings: {
        expanded: false,
        multiplicationTableOpen: false,
        theme: setInitialTheme(),
        automaticThemeToggle: true,
    },
    playing: false,
}

function start() {
    resetCheckboxes();

    // Set Main Menu Numbers and Add Remove Buttons
    createNumberBox(1, 1000);
    createNumberBox(1, 1000);
    createAddAndRemoveButtons();

    generateProblem();
}

function createElement(type, id, className, parent) {
    const elem = document.createElement(type);
    if (id) elem.id = id;
    if (className) elem.classList.add(className);
    return parent.appendChild(elem);
}

function setInitialTheme() {
    const hours = new Date().getHours();
    const isLightTheme = hours > 6 && hours < 17;
    return isLightTheme ? "light" : "dark";
}
