function playCalculation() {
    if (app.playing) {
        closeDetailedSolution();
        return;
    }

    if (app.numbers.length > 2) return displayUserMessage("Number Box Ignored", "You cannot play multiplications with more than 2 numbers!", "Only the first two number box will be included in this operation.")
    if (app.numbers[0] < 13 && app.numbers[1] < 13) return displayUserMessage("No Calculation", "This calculation does not require the use of Borrowing Method.", "You can find the time table cheat-sheet in the main menu.");

    // Regenerate Problem to Find Any Validation Error
    const valid = generateProblem().valid;
    if (!valid) return; // User Message has been Shown, No Action Is Required

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
            // Restrictions
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
