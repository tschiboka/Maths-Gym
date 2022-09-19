function resetCheckboxes() {
    const checkboxes_DOM = [...document.querySelectorAll("input[type = 'checkbox']")];
    checkboxes_DOM.forEach(checkbox => {
        const id = checkbox.id;
        const [prop, isCheckbox] = id.split("-");
        if (prop === "multiplication" || prop === "extend") {
            app.operations[prop] = true;
            checkbox.checked = true;
        } 
        else {
            app.operations[prop] = false;
            checkbox.checked = false;
        }
    });
}

function createNumberBox(min, max, active = true) {
    // Build a Number Box
    const settings_DOM = document.getElementById("settings");
    const numberBoxes = document.querySelectorAll(".numberbox");
    const numberBoxId = "numberbox_" + (numberBoxes.length + 1); 
    const numberBox_DOM = createElement("div", numberBoxId, "numberbox", settings_DOM);
    const numberBoxTitle_DOM = createElement("h2", "", "numberbox__title", numberBox_DOM);
    const ranges_DOM = createElement("div", "", "ranges-wrapper", numberBox_DOM);
    const ranges1_DOM = createElement("div", "", "ranges-1", ranges_DOM);
    const minLabel_DOM = createElement("label", numberBoxId + "__label--min", "", ranges1_DOM);
    const minInput_DOM = createElement("input", numberBoxId + "__input--min", "", ranges1_DOM);
    const ranges2_DOM = createElement("div", "", "ranges-2", ranges_DOM);
    const maxLabel_DOM = createElement("label", numberBoxId + "__label--max", "", ranges2_DOM);
    const maxInput_DOM = createElement("input", numberBoxId + "__input--max", "", ranges2_DOM);
    const numberWrapper_DOM = createElement("div", "", "number-wrapper", numberBox_DOM);
    const numberCheckbox_DOM = createElement("input", numberBoxId + "__checkbox--number", "", numberWrapper_DOM);
    const numberLabel_DOM = createElement("label", numberBoxId + "__label--number", "", numberWrapper_DOM);
    const numberInput_DOM = createElement("input", numberBoxId + "__input--number", "", numberWrapper_DOM);

    // Set Properties
    numberBoxTitle_DOM.innerHTML = "Number " + (numberBoxes.length + 1);
    minLabel_DOM.innerHTML = "Min:";
    maxLabel_DOM.innerHTML = "Max:";
    minInput_DOM.value = min;
    maxInput_DOM.value = max;
    numberLabel_DOM.innerHTML = "Number:";
    numberCheckbox_DOM.type = "checkbox";
    numberInput_DOM.disabled = "disabled";

    // Add Event Listeners
    numberCheckbox_DOM.addEventListener("click", () => {
        const checked = numberCheckbox_DOM.checked;
        numberInput_DOM.disabled = !checked;
        minInput_DOM.disabled = checked;
        maxInput_DOM.disabled = checked;
    });
}

function validateNumberBoxInput(input) {
    const helpText = "Input allowes only positive numbers or zero!\n";

    // Empty String
    if (input.length === 0) return { valid: false , errorType: "Empty Input Error",errorMessage: "Input cannot be left empty!", helpText };

    // NaN
    if (isNaN(input)) return { valid: false , errorType: "Invalid Input",errorMessage: `The input value \" ${ input } \" is not a number!`, helpText };

    // Min Max Safe
    if (Number(input) > Number.MAX_SAFE_INTEGER) return { valid: false , errorType: "Input Safe Error",errorMessage: `The input is greater than the maximum safe number!`, helpText: `Input: \" ${ input } \"\nNumber: ${ Number.MAX_SAFE_INTEGER }` };
    if (Number(input) < 1 || !Number.isInteger(Number(input))) return { valid: false , errorType: "Invalid Input",errorMessage: `The input must be a positive integer!` };

    return { valid: true, number: Number(input) };
}

function generateProblem() {
    // Get Ranges
    const numberBoxes = document.querySelectorAll(".numberbox").length;
    const getRandom = (min, max) => min + Math.floor(Math.random() * (max - min));
    app.numbers = [];
    
    for (let i = 1; i <= numberBoxes; i++) {
        // Find Out If Value is Taken from Ranges or Fixed Number
        const numberCheckbox_DOM = document.getElementById(`numberbox_${ i }__checkbox--number`);
        const isFixedNumber = numberCheckbox_DOM.checked;

        if (isFixedNumber) {
            const number = document.getElementById(`numberbox_${ i }__input--number`).value;
            
            // Display Error Message
            let validation = validateNumberBoxInput(number);
            if (!validation.valid) return displayUserMessage(validation.errorType, validation.errorMessage, validation.helpText, `Number Box - ${ i }`);

            app.numbers.push(Number(number));
        }
        else {
            const min_DOM = document.getElementById(`numberbox_${ i }__input--min`);
            const max_DOM = document.getElementById(`numberbox_${ i }__input--max`);
    
            // Validate Min and Max Number Input
            const minValidation_OBJ = validateNumberBoxInput(min_DOM.value);
            const maxValidation_OBJ = validateNumberBoxInput(max_DOM.value);
    
            const errors = [ minValidation_OBJ, maxValidation_OBJ ]
                           .filter(validation => validation.valid === false);
    
            // Display Error Message
            let valid = !errors.length;
            if (!valid) return displayUserMessage(errors[0].errorType, errors[0].errorMessage, errors[0].helpText, `Number Box - ${ i }`);
    
            // Check if Min and Max Numbers Constitutes a Valid Range
            const [ min, max ] = [ minValidation_OBJ.number, maxValidation_OBJ.number ];
            if (min >= max) return displayUserMessage("Invalid Range", "The maximum input is less than the minimum!", `Cannot create range: [ ${ min } ... ${ max } ]`, `Number Box - ${ i }`);
    
            app.numbers.push(getRandom(min, max));    
        }
    }

    // Get the Operations Selected by User
    const checkedOperations = [];
    for ([key, value] of Object.entries(app.operations)) 
        if (value && key!== "extend") checkedOperations.push(key);
    
    // If No Operation is Selected, Set Default Addition
    if (!checkedOperations.length) {
        const additionCheckbox_DOM = document.getElementById("addition-checkbox");
        additionCheckbox_DOM.checked = true;
        app.operations.addition = true;
        checkedOperations.push("addition");
    }
    
    // Set Operation Randomly
    const randomOperation = checkedOperations[Math.floor(Math.random() * checkedOperations.length)];
    let operand = "";
    switch (randomOperation) {
        case "addition": {
            app.solution = app.numbers.reduce((prev, curr) => prev + curr); 
            operand = "+";
            break; 
        }
        case "subtraction": { 
            app.solution = app.numbers.reduce((prev, curr) => prev - curr);
            operand = "-";
            break; 
        }
        case "multiplication": { 
            app.solution = app.numbers.reduce((prev, curr) => prev * curr); 
            operand = "&times";
            break; 
        }
        case "division": { 
            app.solution = app.numbers.reduce((prev, curr) => prev / curr);
            operand = "/";
            break; 
        }
    }
    
    if ((app.solution >= Number.MAX_SAFE_INTEGER) || isNaN(app.solution)) return displayUserMessage("Solution Error", `The solution of this calculation is greater than the maximum safe number!`, `Input: \" ${ app.solution } \"\nNumber: ${ Number.MAX_SAFE_INTEGER }`);
    app.currentOperation = randomOperation;

    displayProblem(app.numbers, operand);

    // Focus Show Solution Button
    const showBtn_DOM = document.getElementById("show-btn");
    showBtn_DOM.focus();
    return { valid: true };
}

// Get the Longest Number and Pad them to Accomodate the Same Space
//     1234
//       12
//  *   123
//  -------
//  1234567
// Add One for Operation Sign

function displayProblem(numbers, operand) {
    // Reset Problem Display
    const problem_DOM = document.getElementById("problem");
    problem_DOM.innerHTML = "";
    
    // Get Max Length
    let lengths = [];
    for (let i = 0; i < numbers.length; i++) {
        let length = numbers[i].toString().length;
        const isLastNumber = i === numbers.length - 1;
        lengths.push(isLastNumber ? length + 1 : length);
    }

    lengths.push(app.solution.toString().length);
    let longest = Math.max(...lengths);

    // Shift Last Number If it Is Shorter Than the Longest
    if (lengths[lengths.length - 1] >= longest) longest++;

    // Displaying the Problem
    // Pad Numbers
    for (let i = 0; i < numbers.length; i++) {
        const isLastNumber = i === numbers.length - 1;
        const operandLength = isLastNumber ? 1 : 0;
        const length = numbers[i].toString().length;
        const lengthDiff = longest - length - operandLength;

        padNumbers(lengthDiff, numbers[i], isLastNumber ? operand : undefined);
    }
    // Display Separator
    padNumbers(longest, undefined, undefined, "separator");
    
    // Display Solution
    const solution = app.solution.toString();
    padNumbers(longest - solution.length, solution, undefined, "solution");
    
    // Show Button
    const showBtn_DOM = document.getElementById("show-btn");
    showBtn_DOM.style.display = "inline-block";
    


    function padNumbers(padding, number, operand, special) {
        const problem_DOM = document.getElementById("problem");
        const number_DOM = createElement("span", "", "text", problem_DOM);
        
        let paddingStr = "";
        for (let i = 0; i < padding; i++) paddingStr += "0";
        
        if (operand) {
            const operand_DOM = createElement("span", "", "text--operand", number_DOM);
            operand_DOM.innerHTML = operand;
        }
        
        if (paddingStr.length) {
            if (special === "separator") {
                const separator_DOM = createElement("span", "", "text--separator", number_DOM);
                separator_DOM.innerHTML = paddingStr;
                return;
            }
            
            const padding_DOM = createElement("span", "", "text--padding", number_DOM);
            padding_DOM.innerHTML = paddingStr;
        }
        
        const className = special === "solution" ? "text--solution-hidden" : "text--digit";
        const digit_DOM = createElement("span", "", className, number_DOM);
        digit_DOM.innerHTML = number;
    }
}
