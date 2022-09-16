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
    createNumberBox(0, 1000);
    createNumberBox(0, 1000);
    generateProblem();
}

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
    if (min >= Number.MAX_SAFE_INTEGER || max >= Number.MAX_SAFE_INTEGER) return alert ("The input number is greater than the maximum safe integer!");

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
    const helpText = "Input values must be numbers!\nPositive and negative numbers are allowed, as well as decimal points.";

    // Empty String
    if (input.length === 0) return { valid: false , errorType: "Empty Input Error",errorMessage: "Input cannot be left empty!", helpText };

    // NaN
    if (isNaN(input)) return { valid: false , errorType: "Invalid Input",errorMessage: `The input value \" ${ input } \" is not a number!`, helpText };

    // Min Max Safe
    if (Number(input) > Number.MAX_SAFE_INTEGER) return { valid: false , errorType: "Input Safe Error",errorMessage: `The input is greater than the maximum safe number!`, helpText: `Input: \" ${ input } \"\nNumber: ${ Number.MAX_SAFE_INTEGER }` };
    if (Number(input) < Number.MIN_SAFE_INTEGER) return { valid: false , errorType: "Input Safe Error",errorMessage: `The input is less than the minimum safe number!`, helpText: `Input: \" ${ input } \"\nNumber: ${ Number.MIN_SAFE_INTEGER }` };

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

function displayUserMessage(headerText, messageText, helpText, origin = "") {
    const body = document.querySelector("body");
    const messageWrapper_DOM = createElement("div", "user-message-wrapper", "", body);
    messageWrapper_DOM.addEventListener("click", removeUserMessage);
    const message_DOM = createElement("div", "user-message", "", messageWrapper_DOM);

    // User Message Header
    const messageHeader_DOM = createElement("h6", "user-message__title", "", message_DOM);
    const headerFullText = `
        <span>
            ${ headerText } ${ origin ? ": " : "" } 
            <span class='user-message__origin'>${ origin }</span>
        </span>`;
    messageHeader_DOM.innerHTML = headerFullText;
    const messageCloseBtn_DOM = createElement("button", "user-message__close", "", messageHeader_DOM);
    messageCloseBtn_DOM.innerHTML = "<span>&times;</span>";
    messageCloseBtn_DOM.addEventListener("click", removeUserMessage);

    // User Message Body
    const messageBody_DOM = createElement("div", "user-message__body", "", message_DOM);

    // User Message Text
    const messageText_DOM = createElement("p", "user-message__text", "", messageBody_DOM);
    messageText_DOM.innerHTML = messageText;

    // User Help Text Might be Several Lines, Break Lines
    if (helpText) {
        const helpText_DOM = createElement("p", "user-message__details", "", messageBody_DOM);
        helpText_DOM.innerHTML = helpText.replace(/\n/, "</br>");
    }

    // Add OK Button that Closes the User Message
    const okButton__DOM = createElement("button", "user-message__ok", "", messageBody_DOM);
    okButton__DOM.innerHTML = "OK";
    okButton__DOM.addEventListener("click", removeUserMessage);

    app.userMessageOpen = true;
}

function removeUserMessage() {
    const body = document.querySelector("body");
    const messageWrapper_DOM = document.getElementById("user-message-wrapper");
    const messageCloseBtn_DOM = document.getElementById("user-message__close");
    const okButton__DOM = document.getElementById("user-message__ok");

    // Remove Event Listeners from DOM Elements and Remove Message
    messageWrapper_DOM.removeEventListener("click", removeUserMessage);
    messageCloseBtn_DOM.removeEventListener("click", removeUserMessage);
    okButton__DOM.removeEventListener("click", removeUserMessage);
    body.removeChild(messageWrapper_DOM);
    app.userMessageOpen = false;
}

function createElement(type, id, className, parent) {
    const elem = document.createElement(type);
    if (id) elem.id = id;
    if (className) elem.classList.add(className);
    return parent.appendChild(elem);
}


function toggleOperationsCheckbox(checkboxType) {
    // Set App Operations
    const checkbox_DOM = document.getElementById(checkboxType + "-checkbox");
    app.operations[checkboxType] = checkbox_DOM.checked;

    checkbox_DOM.focus();

    // Hide / Show Extended Menu
    if (checkboxType === "extend") {
        const extendButton_DOM = document.getElementById("extend-checkbox");
        const checked = extendButton_DOM.checked;
        const extendedNemu_DOM = document.getElementById("settings__options");
        extendedNemu_DOM.style.display = checked ? "flex" : "none";
    }
}

function playCalculation() {
    if (app.playing) {
        closeDetailedSolution();
        return;
    }

    // Set Buttons and State
    const playButton_DOM = document.getElementById("play");
    playButton_DOM.innerHTML = '<i class="fa-solid fa-stop"></i>';
    
    const playButtonExplanationText = document.getElementById("play-btn__explanation-txt");
    playButtonExplanationText.innerHTML = "Stop Detailed Calculation";
    
    const detailedSolution_DOM = document.getElementById("detailed-solution");
    detailedSolution_DOM.style.display = "flex";

    const nextButton = document.getElementById("next-step-btn");
    nextButton.focus();

    // Save Numberbox Inputs' States and Disable All
    const numberBoxes_DOM_ARR = [...document.querySelectorAll(".numberbox input")];
    const numberboxState = numberBoxes_DOM_ARR.map(inp => ({ id: inp.id, disabled: inp.disabled }));
    app.numberboxState = numberboxState;
    numberBoxes_DOM_ARR.forEach(inp => inp.disabled = true);

    // Calculate Dimension of the Grid
    let width = 0;
    let height = 0;

    switch (app.currentOperation) {
        case "multiplication": {
            const numbers_STR = app.numbers.map(n => n.toString());
            // Width is the solution or the last number + operand
            width = Math.max(app.solution.toString().length, numbers_STR[1].length + 1);
            // Calculation seeks the SHORTEST version, so the least number multiplication is required
            const MAX_NUM = 2;
            height = MAX_NUM + Math.min(...app.numbers).toString().length + 1;
            break;
        }
        default: {
            displayUserMessage("No Support", `Playing the Calculation Details for the operation ${ app.currentOperation } is not yet supported!`, "This functionality is still under development, and will be available soon.");
        }
    }

    // Set Up App Variables
    app.playing = true;
    app.currentStep = 0;
    app.steps = [];
    app.gridWidth = width;
    app.gridHeight = height;
    app.steps = createCalculationSteps(app.currentOperation, app.numbers, width, height);

    // Create Carousel Pagination Indicators
    const carousel_DOM = document.getElementById("carousel-controls");
    carousel_DOM.innerHTML = "";
    for (let i = 0; i < app.steps.length; i++) {
        const pageIndicator_DOM = createElement("span", "page-indicator_" + i, "page-indicator", carousel_DOM);
        pageIndicator_DOM.addEventListener("click", () => {
            app.currentStep = i;
            displayStep();
        });
    }

    // Display the First Step on the Number Grid
    displayStep();
}



function displayStep() {
    const steps = app.steps;
    const width = app.gridWidth;
    const height = app.gridHeight;
    const stepInd = app.currentStep;

    const calculation_DOM = document.getElementById("calculation");
    calculation_DOM.innerHTML = "";

    // Create Helper Info
    const info = steps[stepInd].info;
    if (info) {
        const info_DOM = createElement("p", "", "calculation__info", calculation_DOM);
        info.split("\n").map(txt => {
            const infoSpan_DOM = createElement("span", "", "", info_DOM);
            infoSpan_DOM.innerHTML += txt;
            info_DOM.appendChild(infoSpan_DOM);
        });
        const infoPagination_DOM = createElement("span", "info__pagination", "", info_DOM);
        infoPagination_DOM.innerHTML = `< <span>${ stepInd + 1 }</span>|<span>${ steps.length }</span>>`
    } 

    // Create Number Grid
    const grid_DOM = createElement("div", "grid", "", calculation_DOM);
    const grid_DOM_ARR = [];

    // Fill Up Number Grid
    for (let row = 0; row < height; row++) {
        const row_DOM = createElement("div", `row_${ row }`, "row", grid_DOM);
        const row_DOM_ARR = [];
        
        for (let cell = 0; cell < width; cell++) {
            const cell_DOM = createElement("div", `row_${ row }-cell_${ cell }`, "cell", row_DOM);
            cell_DOM.innerHTML = steps[stepInd].rows[row][cell].digit;
            row_DOM_ARR.push(cell_DOM);

            // Empty Placeholder
            if (steps[stepInd].rows[row][cell].digit === "_") cell_DOM.classList.add("placeholder");
            if (steps[stepInd].rows[row][cell].highlight) cell_DOM.classList.add("highlight");

            // Separator
            if (steps[stepInd].rows[row][cell].underline) {
                createElement("span", "", "text--separator", cell_DOM);
            }

            // Carry
            const carry = steps[stepInd].rows[row][cell].super;
            const prevCarry = steps[stepInd].rows[row][cell].prevSuper;
            const carryBox_DOM = createElement("div", "", "carry-box", cell_DOM);
            if (carry.length) {
                const carryDigit_DOM = createElement("span", "", "carry-digit", carryBox_DOM);
                carryDigit_DOM.innerHTML = carry[0];
            }
            if (prevCarry.length) {
                for (let digit of prevCarry) {
                    const carryDigit_DOM = createElement("span", "", "carry-digit--prev", carryBox_DOM);
                    carryDigit_DOM.innerHTML = digit;
                }
            }
        }
    }

    calculation_DOM.appendChild(grid_DOM);
    grid_DOM_ARR.push();

    // Set Current Pagination
    const paginations_DOM = document.querySelectorAll(".page-indicator");
    paginations_DOM.forEach((page, i) => {
        page.classList.remove("active");
        if (i === stepInd) page.classList.add("active");
    });
}



function createCalculationSteps(operation, numbers, width, height) {
    // Initialise Steps and Grid
    const createEmptyRow = () => new Array(width).fill().map(e => (
        { 
            digit: "_", 
            super: [],
            prevSuper: [],
            underline: false,
            highlight: false
        }));
    const createEmptyGrid = () =>  new Array(height).fill().map(r => [...createEmptyRow()]);
    const steps = [
        {
            rows: createEmptyGrid(),
            borrowNums: [],
            info: "Let's start calculating the multiplication!\nWe will use the Borrowing Method!\n<span class='highlight'>Press Next! ... </span>\n<i class='fa-solid fa-forward-step highlight'></i>"
        }
    ];
    const getWriteAndCarry = n => ({ write: n % 10, carry: Math.floor(n / 10) });

    switch (operation) {
        case "multiplication": {
            // Place Factors, Operation and Underscore
            const numbers_STR_ARR = numbers.map(n => n.toString());
            function placeInitialCharacters(steps, stepInd, num_STR_ARR, op) {
                [num_STR_ARR[0], op + num_STR_ARR[1]].forEach((str, i) => {
                    [...str].forEach((digit, di) => {
                        const startIndex = width - str.length;
                        const index = startIndex + di;
                        steps[stepInd].rows[i][index].digit = digit;
    
                        if (i === 1) steps[stepInd].rows[i][index].underline = true; // Underline
                    });
                });
                steps[stepInd].rows[1].underline = true;
            }
            placeInitialCharacters(steps, 0, numbers_STR_ARR, "\u00D7");
        
            // Find If Numbers Can Be Swapped for Easier Calculation
            const multiplicationOperations = n => [...n].reduce((prevDigit, currDigit, i, arr) => {
                if (currDigit === "0") return prevDigit; // Nil doesn't Require Calculation
                if (currDigit === "1") return prevDigit; // Neither does 1
                if (arr.slice(i + 1).includes(currDigit)) return prevDigit; // Find if Digit Has Already Appeared (Has Been Calculated)

                return prevDigit + 1;
            }, 0);

            // Swap Numbers If Convenient
            const multOp1 = multiplicationOperations(numbers_STR_ARR[0]);
            const multOp2 = multiplicationOperations(numbers_STR_ARR[1]);

            let swapped = false;
            if (multOp1 < multOp2) swapped = true;
            else if (multOp1 === multOp2 && numbers_STR_ARR[1].length > numbers_STR_ARR[0].length) swapped = true;
            const [num1, num2] = !swapped ? [...numbers] : [...[...numbers].reverse()]; // dereference numbers

            // Create an Extra Step if Numbers Needed Swapping
            if (swapped) {                
                steps.push(
                    {
                        rows: createEmptyGrid(),
                        borrowNums: [],
                        highlightNumber: [],
                        info: ""
                    }
                );
                
                // Highlight Second Row
                const pad = n => new Array(n).fill("_").join("");
                const padNum = num1.toString().length - num2.toString().length;

                placeInitialCharacters(steps, 1, [ num1.toString(), pad(padNum) + num2.toString()], "\u00D7");
                steps[1].info = `We can make this calculation easier by swapping the two numbers:\n<i><span class="highlight">${ num1 } \u00D7 ${ num2 }</span></i> \nRequires fewer calculation steps than: \n<i>${ num2 } \u00D7 ${ num1 }</i>`
                const secondRowDigits = steps[1].rows[1].filter(r => /\d/.test(r.digit));
                secondRowDigits.forEach(digit => digit.highlight = true);
            }

            // Multiply Numbers
            const prevFactors = [];
            let factor1Index = 0;
            let factor2Index = 0;
            for (let factor2 of num2.toString().split("").reverse()) {
                let prevCarry = 0;
                
                for (let factor1 of num1.toString().split("").reverse()) {
                    // Copy Previous Step's Content
                    steps.push({
                            rows: steps[steps.length - 1].rows.map(c => c.map(d => ({ 
                                digit: d.digit, 
                                super: [],
                                prevSuper: [...d.super, ...d.prevSuper],
                                underline: d.underline,
                                highlight: false
                             }))),
                            borrowNums: [],
                            info: `Multiply the numbers:\n<i>${ factor1 } \u00D7 ${ factor2 } = <span class='highlight'>${ factor1 * factor2 }</span></i>`,
                        }
                    );

                    // Simplify Calculations

                    // If Multiply by 0
                    if (factor2 === "0") {
                        const nextFactor = steps[steps.length - 1].rows[1][width - 1 - factor2Index - 1].digit;
                        steps[steps.length - 1].info = `Simply write\n<i><span class="highlight">0</span></i>\nas the result of the multiplication, as none of the factors above will result in other than <i>0</i> !\nYou can simply jump to the next number, which is <i>${ nextFactor }</i> .`;
                        steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index].digit = 0;
                        steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index].highlight = true;
                        break;
                    } 
                    // If Multiply by 1
                    else if (factor2 === "1") {
                        steps[steps.length - 1].info = `Simply write down the first factor as the result of the multiplication:\n<i><span class="highlight">${ num1 }</span></i>`;
                        let i = 0;
                        for (let digit of [...num1.toString()].reverse()) {
                            steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index - i].digit = digit;
                            steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index - i].highlight = true;
                            i++;
                        }
                        break;

                    }
                    // If Multiply by a Repeated Number
                    else {
                        if (prevFactors.includes(factor2)) {
                            for (let i = 0; i < (factor2 * num1).toString().length; i++) {
                                const digit = [...(factor2 * num1).toString()].reverse()[i];
                                steps[steps.length - 1].rows[2 + factor2Index][width - 1 - i - factor2Index].digit = digit;
                                steps[steps.length - 1].rows[2 + factor2Index][width - 1 - i - factor2Index].highlight = true;
                            }
                            steps[steps.length - 1].info = `We have already calculated this multiplication previously!\n<i>${ factor2 } \u00D7 ${ num1 } = <span class="highlight">${ factor2 * num1 }</span></i>\nJust copy your previous solution!`;
                            break;
                        }
                    }

                    // Delete Highlights and Highlight the Factor Numbers in the Current Calculation
                    if (!(steps.length === 1 && swapped)) {
                        steps[steps.length - 1].rows.forEach(r => r.forEach(c => c.highlight = false));
                        steps[steps.length - 1].rows[0][width - 1 - factor1Index].highlight = true;
                        steps[steps.length - 1].rows[1][width - 1 - factor2Index].highlight = true;
                    }

                    // Multiply
                    let product = factor1 * factor2;

                    // Check If There Was a Carry from Previous Calculation
                    if (prevCarry) {
                        steps[steps.length - 1].info += `\nAdd carry to the product:\n<i>${ product } + ${ prevCarry } = <span class='highlight'>${ product + prevCarry }</span></i>`;
                        product += prevCarry;
                    }

                    let { write, carry } = { ...getWriteAndCarry(product) };
                    
                    if (carry) {
                        if (num1.toString().length - 1 === factor1Index) {
                            // Write Down the Whole Product
                            steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index - 1].digit = carry;
                            steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index - 1].highlight = true;
                            steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index].digit = write;
                            steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index].highlight = true;
                            steps[steps.length - 1].info += `\nWrite down <i><span class="highlight">${ product }<span></i>.`;
                        } else {
                            // Write Down Partial and Carry
                            steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index].digit = write;
                            steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index].highlight = true;
                            steps[steps.length - 1].info += `\nWrite down <i>${ carry }</i> for the next column as a carry for the next operation!`;
                            steps[steps.length - 1].rows[0][width - factor1Index - 2].super.push(carry);
                            prevCarry = carry;
                        }
                    }
                    else {
                        steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index].digit = write;
                        steps[steps.length - 1].rows[2 + factor2Index][width - 1 - factor1Index - factor2Index].highlight = true;
                        prevCarry = 0;
                    }

                    factor1Index++;
                }
                prevFactors.push(factor2);

                if (factor2Index === num2.toString().length - 1) {
                    if (num2.toString().length !== 1) {
                        // Underline
                        steps[steps.length - 1].rows[2 + factor2Index].forEach(d => d.underline = true);
                    }
                    else {
                        // Copy Previous Step
                        steps.push({
                            rows: steps[steps.length - 1].rows.map(c => c.map(d => ({ 
                                digit: d.digit, 
                                super: [],
                                prevSuper: [...d.super, ...d.prevSuper],
                                underline: d.underline,
                                highlight: false
                             }))),
                            borrowNums: [],
                            info: `The result is:`,
                        });
                        
                        steps[steps.length - 1].rows[2].forEach(d => d.highlight = true);
                        steps[steps.length - 1].info += `\n<i><span class="highlight">${ num1 * num2 }</span></i>`;        
                        return steps;
                    }
                }
                factor2Index++;
                factor1Index = 0;
            }

            // Add Products Together
            const resultArr = [];
            let prevCarry = 0;
            for (let col = width - 1; col >= width - app.solution.toString().length; col--) {
                // Copy Previous Step
                steps.push({
                    rows: steps[steps.length - 1].rows.map(c => c.map(d => ({ 
                        digit: d.digit, 
                        super: [],
                        prevSuper: [...d.super, ...d.prevSuper],
                        underline: d.underline,
                        highlight: false
                     }))),
                    borrowNums: [],
                    info: `Sum the colums.`,
                });

                // Iterate the Columns
                const factorRows = steps[steps.length - 1].rows.filter((_, ri) => ri > 1 && ri < num2.toString().length + 2);
                const addends = [];
                factorRows.forEach(row => {
                    row.forEach((cell, cellInd) => {
                        if (cellInd === col) {
                            cell.highlight = true;
                            if (cell.digit !== "_") addends.push(cell.digit);
                        }
                        else cell.height = false;
                    });
                });

                // Sum Numbers
                let sum = addends.reduce((prev, curr) => Number(prev) + Number(curr), 0);
                if (addends.length > 1) steps[steps.length - 1].info += `\nAdd numbers together!\n<i>${ addends.join(" + ")} = <span class="highlight">${ sum }</span></i>`;

                // Add Carry
                if (prevCarry) {
                    steps[steps.length - 1].info += `\nAdd carry!\n<i>${ sum } + ${ prevCarry } = <span class="highlight">${ sum + prevCarry }</span></i>`;
                    sum += prevCarry;
                }

                // If Sum One Digit
                if (sum < 10) {
                    steps[steps.length - 1].info += `\nWrite down <i><span class="highlight">${ sum }</span></i> .`;
                    steps[steps.length - 1].rows[2 + num2.toString().length][col].digit = sum;
                    steps[steps.length - 1].rows[2 + num2.toString().length][col].highlight = true;
                    resultArr.push(sum);
                    prevCarry = 0;
                }
                // If Sum is Two Digits
                else {
                    const { write, carry } = getWriteAndCarry(sum);
                    steps[steps.length - 1].info += `\nWrite down <i><span class="highlight">${ write }</span></i>.\nCarry the number <i>${ carry }</i>`;
                    steps[steps.length - 1].rows[2 + num2.toString().length][col].digit = write;
                    steps[steps.length - 1].rows[2 + num2.toString().length][col].highlight = true;
                    steps[steps.length - 1].rows[2][col - 1].super.push(carry);
                    resultArr.push(write);
                    prevCarry = carry;
                }
            }

            // Display Final Result and Error Message in Case the Algorithm Would Fail to Get to the Correct Result
            const result = Number(resultArr.reverse().join(""));
            if (result !== num1 * num2) displayUserMessage("Logical Error", "The algorithm has failed!", `Expected result : ${ num1 * num2 }\nProgram's result : ${ result }`);
            
            // Copy Previous Step
            steps.push({
                rows: steps[steps.length - 1].rows.map(c => c.map(d => ({ 
                    digit: d.digit, 
                    super: [],
                    prevSuper: [...d.super, ...d.prevSuper],
                    underline: d.underline,
                    highlight: false
                 }))),
                borrowNums: [],
                info: `The result is:`,
            });

            steps[steps.length - 1].rows[2 + num2.toString().length].forEach(d => d.highlight = true);
            steps[steps.length - 1].info += `\n<i><span class="highlight">${ result }</span></i>`;
        }
    }

    return steps;
}



function goToStep(step) {
    let stepIndex = app.currentStep + step;
    
    if (step === undefined) stepIndex = app.steps.length - 1;
    if (step === 0) stepIndex = 0;
    
    if (stepIndex < 0) stepIndex = 0;
    if (stepIndex > app.steps.length - 1) stepIndex = app.steps.length - 1;
        
    app.currentStep = stepIndex;
    displayStep();
}



function closeDetailedSolution() {
    const playButton_DOM = document.getElementById("play");
    playButton_DOM.innerHTML = '<i class="fa-solid fa-play  "></i>';
    
    const detailedSolution_DOM = document.getElementById("detailed-solution");
    detailedSolution_DOM.style.display = "none";
    
    const playButtonExplanationText = document.getElementById("play-btn__explanation-txt");
    playButtonExplanationText.innerHTML = "Play Detailed Calculation";
    
    app.playing = false;
    app.currentStep = 0;

    // Reset Numberbox Inputs' Disabled State
    const numberboxState = app.numberboxState;
    numberboxState.forEach(inpState => document.getElementById(inpState.id).disabled = inpState.disabled);

    // Focus Generate New Button
    const generateBtn_DOM = document.getElementById("generate-btn");
    generateBtn_DOM.focus();
}

function showSolution() {
    const showBtn_DOM = document.getElementById("show-btn");
    showBtn_DOM.style.display = "none";

    const solution_DOM = document.querySelector(".text--solution-hidden");
    solution_DOM.classList.remove("text--solution-hidden");

    const generateBtn_DOM = document.getElementById("generate-btn");
    generateBtn_DOM.focus();
}

function openMultiplicationTable() {
    const body = document.querySelector("body");
    app.settings.multiplicationTableOpen = true;

    // Create Multiplication Table
    const tableWrapper = createElement("div", "multiplication-table-wrapper", "", body);
    tableWrapper.addEventListener("click", closeMultiplicationTable);

    const table = createElement("table", "multiplication-table", "", tableWrapper);
    for (let i = 0; i < 13; i++) {
        const row = createElement("tr", "", "", table);
        for (let j = 0; j < 13; j++) {
            const td = createElement("td", `MT_TD_${ i }-${ j }`, "", row);
            if (i === 0 && j === 0) td.innerHTML = "\u00D7";
            else if (i === 0) td.innerHTML = j;
            else if (j === 0) td.innerHTML = i;
            else td.innerHTML = i * j;

            td.addEventListener("mouseover", e => {
                const id = e.target.id;
                const [ rowIndex, colIndex ] = id.match(/\d+/g);
                const tableTds_DOM_ARR = document.querySelectorAll("#multiplication-table td");
                tableTds_DOM_ARR.forEach(td => {
                    const [ ri, ci ] = td.id.match(/\d+/g);
                    if (td.classList.contains("highlight-td")) td.classList.remove("highlight-td");
                    if (ri === rowIndex || ci === colIndex) td.classList.add("highlight-td");
                });
            });
        }
    }
    body.appendChild(tableWrapper);
}

function closeMultiplicationTable() {
    const body = document.querySelector("body");
    body.removeChild(document.getElementById("multiplication-table-wrapper"));
    app.settings.multiplicationTableOpen = false;
}

function toggleTheme() {
    // Toggle App State and Body Class
    const body_DOM = document.querySelector("body");
    const bodyClasses_ARR = [...body_DOM.classList].filter(cls => cls === "light" || cls === "dark");
    app.settings.theme = app.settings.theme === "dark" ? app.settings.theme = "light" : app.settings.theme = "dark";
    body_DOM.classList.replace(bodyClasses_ARR[0], app.settings.theme);
    
    // Adjust Icon, Text and Delete Theme Class
    const themeBtn_DOM = document.getElementById("theme-btn");
    const themeLbl_DOM = document.getElementById("theme-btn-label");

    if (app.settings.theme === "dark") {
        themeBtn_DOM.innerHTML = '<i class="fa-regular fa-sun"></i>';
        themeLbl_DOM.innerHTML = "Light Theme";
    }
    if (app.settings.theme === "light") {
        themeBtn_DOM.innerHTML = '<i class="fa-regular fa-moon"></i>';
        themeLbl_DOM.innerHTML = "Dark Theme";
    }
}

function keyDown(event) {
    const key = event.keyCode || event.key || event.charCode;
    const activeElement = document.activeElement;
    
    if ((key === "Escape" || key === 27) && app.settings.multiplicationTableOpen) {
        closeMultiplicationTable();
        return;
    }

    if ((key === "Escape" || key === 27) && app.userMessageOpen) {
        removeUserMessage();
        return;
    }

    if (key === " " || key === 18) {
        if (activeElement.id === "generate-btn") generateProblem();
    }

    if (app.playing) {
        if (key === "ArrowRight" || key === 39) goToStep(1);
        if (key === "ArrowLeft" || key === 37) goToStep(-1)
        if (key === "Escape" || key === 27) closeDetailedSolution();
    } 
    else {
        if (key === "Enter" || key === 13) {
            if (activeElement.tagName !== "INPUT") playCalculation();
        } 
    }
}