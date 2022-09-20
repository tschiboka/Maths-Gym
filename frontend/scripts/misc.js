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
    return { valid: false };
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

function toggleOperationsCheckbox(checkboxType) {
    // Set App Operations
    const checkbox_DOM = document.getElementById(checkboxType + "-checkbox");
    app.operations[checkboxType] = checkbox_DOM.checked;

    checkbox_DOM.focus();

    // Hide / Show Expanded Menu
    if (checkboxType === "expand") {
        const expandButton_DOM = document.getElementById("expand-checkbox");
        const checked = expandButton_DOM.checked;
        const expandedNemu_DOM = document.getElementById("settings__options");
        expandedNemu_DOM.style.display = checked ? "flex" : "none";
    }
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

function toggleTheme(theme) {
    // Toggle App State and Body Class
    const body_DOM = document.querySelector("body");
    const bodyClasses_ARR = [...body_DOM.classList].filter(cls => cls === "light" || cls === "dark");
    
    // Set Theme
    console.log(theme, app.settings.theme, theme && theme !== app.settings.theme)
    if (theme) {
        if (theme !== app.settings.theme) {
            app.settings.theme = theme;
            displayUserMessage("Acessibility: Theme Changed", `The application is set to ${ theme } theme.`, "This is an automatic feature that triggers at 7 AM and 5 PM. Themes can be set back in the main menu.");
        } 
    }
    else app.settings.theme = app.settings.theme === "dark" ? app.settings.theme = "light" : app.settings.theme = "dark";    
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