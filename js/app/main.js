import { UIElements } from './UIElements.js';
import { TranslationDashboard } from './TranslationDashboard.js';
import { TransliterationEngine } from './TransliterationEngine.js';
import { JSONFileManager } from './JSONFileManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    const uiElements = new UIElements();
    const dashboard = new TranslationDashboard(uiElements);
    const engine = new TransliterationEngine();
    const jsonManager = new JSONFileManager();

    // Initialize the engine by loading the dictionary asynchronously
    await engine.initialize();

    // Now that the engine is ready, set up the event listeners
    initializeEventListeners(uiElements, dashboard, engine, jsonManager);
});

function initializeEventListeners(elements, dashboard, engine, jsonManager) {
    const { inputTextBox, openTextFileBtn, container } = elements;

    // Font size adjustment
    elements.fontSizeRange.addEventListener("input", () => dashboard.setTextBoxFontSize());

    // File input handling
    openTextFileBtn.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                inputTextBox.value = e.target.result;
            };
            reader.readAsText(file);
        }
    });

    // Main event delegation for buttons
    container.addEventListener("click", (e) => {
        const targetId = e.target.id;
        if (!targetId) return;

        handleButtonClick(targetId, elements, dashboard, engine, jsonManager);
    });
}

function handleButtonClick(id, elements, dashboard, engine, jsonManager) {
    const { inputTextBox, outputTextBox } = elements;

    const actionMap = {
        pasteBtn: () => dashboard.pasteText(),
        saveInputTextBtn: () => dashboard.saveTxt(inputTextBox.value),
        PublishInputTextBtn: () => dashboard.openTextReadingPage(inputTextBox.value),
        copyBtn: () => dashboard.copyText(),
        saveOutputTextBtn: () => dashboard.saveTxt(outputTextBox.value),
        PublishOutputTextBtn: () => dashboard.openTextReadingPage(outputTextBox.value),
        convertBtn: () => {
            outputTextBox.value = engine.convertText(inputTextBox.value);
            dashboard.updateDisplay(engine.totalWordArray, engine.notFoundWords);

            const saveJSONSetting = getSaveJSONSetting();
            if (engine.notFoundWords.length > 0 && saveJSONSetting !== "0") {
                jsonManager.saveNotFoundWordsAsJSON(engine.notFoundWords, saveJSONSetting === "2");
            }
        },
        ReadJSONBtn: () => {
            if (engine.notFoundWords.length) {
                const jsonData = jsonManager.convertArrayToJSON(
                    engine.notFoundWords,
                    getSaveJSONSetting() === "2"
                );
                dashboard.openJSONReadingPage(jsonData);
            }
        },
        saveJSONBtn: () => {
            if (engine.notFoundWords.length > 0) {
                jsonManager.saveNotFoundWordsAsJSON(
                    engine.notFoundWords,
                    getSaveJSONSetting() === "2"
                );
            }
        }
    };

    if (actionMap[id]) {
        actionMap[id]();
    }
}

function getSaveJSONSetting() {
    const selectedOption = document.querySelector('input[name="saveJSON"]:checked');
    return selectedOption ? selectedOption.value : "0";
}
