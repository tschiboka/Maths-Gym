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
//        theme: setInitialTheme(),
        automaticThemeToggle: true,
    },
    numberBoxes: [
        { min: 1, max: 1000, fixed: false },
        { min: 1, max: 1000, fixed: false },
    ],
    playing: false,
}

function testFunction() {
    return true;
}

module.exports = testFunction;