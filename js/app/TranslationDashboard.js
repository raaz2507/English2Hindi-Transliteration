export class TranslationDashboard {
    #elements;
    #notificationTimeout;

    constructor(elements) {
        this.#elements = elements;
        this.#notificationTimeout = null;
    }

    showNotification(message, duration = 3000) {
        const notification = this.#elements.notification;
        if (!notification) return;

        // Clear any existing timeout to prevent the notification from disappearing early
        if (this.#notificationTimeout) {
            clearTimeout(this.#notificationTimeout);
        }

        notification.textContent = message;
        notification.classList.add('show');

        this.#notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }

    updateDisplay(totalWords, notFoundWords) {
        const totalWordCount = totalWords.length;
        const notFoundWordCount = notFoundWords.length;
        this.#elements.totalWordDis.value = totalWordCount;
        this.#elements.notFoundWordsDis.value = notFoundWordCount;
        if (totalWordCount > 0) {
            const conversionPercentage = 100 - ((notFoundWordCount / totalWordCount) * 100);
            this.#elements.conversionPercentageDis.value = conversionPercentage.toFixed(2) + '%';
        } else {
            this.#elements.conversionPercentageDis.value = "0%";
        }
    }

    setTextBoxFontSize() {
        const fontSize = this.#elements.fontSizeRange.value + "px";
        this.#elements.inputTextBox.style.fontSize = fontSize;
        this.#elements.outputTextBox.style.fontSize = fontSize;
    }

    async pasteText() {
        try {
            const text = await navigator.clipboard.readText();
            this.#elements.inputTextBox.value = text;
            this.showNotification("Pasted text from clipboard.");
        } catch (err) {
            console.error("Error pasting text:", err);
            this.showNotification("Failed to paste text.", 5000);
        }
    }

    async copyText() {
        if (!this.#elements.outputTextBox.value) {
            this.showNotification("Nothing to copy!", 3000);
            return;
        }
        try {
            await navigator.clipboard.writeText(this.#elements.outputTextBox.value);
            this.showNotification("Copied to clipboard!");
        } catch (err) {
            console.error("Error copying text:", err);
            this.showNotification("Failed to copy text.", 5000);
        }
    }

    openJSONReadingPage(jsonData) {
        localStorage.setItem("JSON_Dic_Data", JSON.stringify(jsonData, null, 2));
        window.open('./jsonFileManage.html', '_blank');
    }

    openTextReadingPage(text) {
        localStorage.setItem("readingText", text);
        window.open("./ReadModePage.html", "_blank");
    }

    saveTxt(text) {
        let fileName = prompt("Enter file name:", "transliterated-text.txt");
        if (fileName) {
            if (!fileName.endsWith(".txt")) {
                fileName += ".txt";
            }
            const blob = new Blob([text], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    }
}
