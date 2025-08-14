export class UIElements {
    constructor() {
        this.#getElementsFromDOM();
    }

    #getElementsFromDOM() {
        const elementMap = {
            // Setting buttons
            fontSizeRange: 'font-size-range',

            // JSON related buttons
            readJSONBtn: 'ReadJSONBtn',
            saveJSONBtn: 'saveJSONBtn',

            // Display status elements
            totalWordDis: "total_words",
            notFoundWordsDis: "not_found_words",
            conversionPercentageDis: "con_per",

            // Input-textArea buttons
            pasteBtn: 'pasteBtn',
            openTextFileBtn: 'OpenTextFileBtn',
            saveInputTextBtn: 'saveInputTextBtn',
            publishInputTextBtn: 'PublishInputTextBtn',

            // Output-textArea buttons
            copyBtn: 'copyBtn',
            saveOutputTextBtn: 'saveOutputTextBtn',
            publishOutputTextBtn: 'PublishOutputTextBtn',

            // Main convert button
            convertBtn: 'convertBtn',

            // Text boxes
            inputTextBox: 'inputTextBox',
            outputTextBox: 'outputTextBox',

            // Main container for event delegation
            container: 'container',

            // Notification element
            notification: 'notification'
        };

        // Map elements to DOM properties
        for (const [key, value] of Object.entries(elementMap)) {
            this[key] = document.getElementById(value);
        }
    }
}
