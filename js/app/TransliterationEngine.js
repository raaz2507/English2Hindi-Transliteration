export class TransliterationEngine {
    constructor() {
        this.dictionary = null;
        this.notFoundWords = [];
        this.totalWordArray = [];
    }

    async initialize() {
        try {
            // The path is relative to the index.html file
            const response = await fetch('./dictionary.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.dictionary = await response.json();
            console.log("Dictionary loaded successfully.");
        } catch (error) {
            console.error("Failed to load dictionary:", error);
            this.dictionary = {}; // Fallback to an empty dictionary on error
        }
    }

    convertText(inputText) {
        if (this.dictionary === null) {
            console.error("Dictionary not initialized.");
            return "Error: Dictionary not loaded. Please refresh and try again.";
        }
        this.totalWordArray = this.#tokenize(inputText);
        const outputArr = this.#transliterate(this.totalWordArray);
        return outputArr.join('');
    }

    #tokenize(inputText) {
        // This regex splits the text by words and delimiters (punctuation, spaces), keeping the delimiters.
        // It's more robust than the previous loop-based approach.
        return inputText.split(/([a-zA-Z]+)/).filter(Boolean);
    }

    #transliterate(wordArray) {
        const outputArr = [];
        let notFoundWordArr = [];

        wordArray.forEach((word) => {
            const lowerCaseWord = word.toLowerCase();

            // Direct O(1) lookup in the flattened dictionary
            if (this.dictionary.hasOwnProperty(lowerCaseWord)) {
                outputArr.push(this.dictionary[lowerCaseWord]);
            } else {
                outputArr.push(word);
                // Add to not-found list only if it's a word, not a delimiter.
                if (/^[a-zA-Z]+$/.test(word)) {
                   notFoundWordArr.push(word);
                }
            }
        });

        this.notFoundWords = [...new Set(notFoundWordArr)]; // Store unique words
        return outputArr;
    }
}
