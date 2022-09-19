const app = {
    solution: 0,
    numbers: [],
    currentOperation: "multiplication",
    steps: [],
    currentStep: 0,
    time: 0,
    operations: {
        addition: false,
        subtraction: false,
        multiplication: false,
        division: false,
        extend: true
    },
    settings: {
        expanded: true,
        multiplicationTableOpen: false,
        theme: "dark"
    },
    playing: false,
}

function start() {
    resetCheckboxes();
    createNumberBox(1, 1000);
    createNumberBox(1, 1000);
    generateProblem();
}

function createElement(type, id, className, parent) {
    const elem = document.createElement(type);
    if (id) elem.id = id;
    if (className) elem.classList.add(className);
    return parent.appendChild(elem);
}
