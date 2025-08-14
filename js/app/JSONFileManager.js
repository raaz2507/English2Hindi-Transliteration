import { EngWord } from "../EnglishWord.js";

function sortObjectByValue(obj) {
    return Object.fromEntries(
        Object.entries(obj).sort(([, a], [, b]) => b - a)
    );
}

function filterEngWord(wordArr) {
    // EngWord is a large array of common English words.
    // This function filters them out from the not-found list.
    const lowercasedEngWord = new Set(EngWord.map(word => word.toLowerCase()));
    return wordArr.filter((word) => !lowercasedEngWord.has(word.toLowerCase()));
}

export class JSONFileManager {

    saveNotFoundWordsAsJSON(wordList, saveWithCount) {
        const data = this.convertArrayToJSON(wordList, saveWithCount);
        this.#saveJSONToFile(data, saveWithCount);
    }

    convertArrayToJSON(wordList, saveWithCount) {
        let data = {};
        let filteredWords = filterEngWord(wordList).map(word => word.toLowerCase());

        if (saveWithCount) {
            // Count frequency of words
            filteredWords.forEach(word => {
                if (word.length > 1) {
                    data[word] = (data[word] || 0) + 1;
                }
            });
            // Sort by frequency
            data = sortObjectByValue(data);
        } else {
            // Create simple JSON with empty values
            filteredWords.forEach(word => {
                if (word.length > 1) {
                    data[word] = "";
                }
            });
        }
        return data;
    }

    #saveJSONToFile(data, saveWithCount) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = saveWithCount ? "notFoundWords_withCount.json" : "notFoundWords.json";
        document.body.appendChild(a);
a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
