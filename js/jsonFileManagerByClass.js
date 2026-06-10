document.addEventListener("DOMContentLoaded", () => {
	const JsonMagicSorter = new JsonOrganizer();
	const browserDic = new BrowserDictionaryStore();
	const myDeshbord = new Deshbord();
	setEventOnElements(myDeshbord, JsonMagicSorter, browserDic);
});
async function setEventOnElementsNew(myDeshbord, myJson){
	const {SortKeyAscBtn, SortKeyDescBtn, SortValueAscBtn, SortValueDescBtn, swapKey2ValueBtn}=myDeshbord;
	const {openFileBtn, copyInputBtn, PasteInputBtn, exportInputJson2FileBtn}=myDeshbord; 
	const	{copyOutputBtn, exportOutputJson2FileBtn}=myDeshbord;
	const {PreTextArea, processedTextArea}=myDeshbord;
	
	let preJsonData={};
	let outputJSONData={};
	
	await (async function getJsonFormLocalStorage(){
		const jsonData= localStorage.getItem("JSON_Dic_Data");
		console.log(jsonData);
		if (jsonData && jsonData !== "null"){
			preJsonData=	JSON.parse(jsonData); // localStorage से text लो
			updateInputTextArea();
			localStorage.removeItem("JSON_Dic_Data"); //to empty local storage
			return;
		}

		localStorage.removeItem("JSON_Dic_Data");
		const translatedDictionary = await browserDic.getTranslatedDictionary();
		if (Object.keys(translatedDictionary).length) {
			preJsonData = translatedDictionary;
			updateInputTextArea();
		}
	})();
	const actionmap={
		//event on input-area json Data
		copyInputBtn: ()=> myDeshbord.copyText(JSON.stringify(preJsonData, null, 1)),
		

	};
	myDeshbord.container.addEventListener('click', (e)=>{
		const handler =actionmap[e.target.id];
		if (handler) handler();
	});
}
async function setEventOnElements(myDeshbord, myJson, browserDic){
	const {SortKeyAscBtn, SortKeyDescBtn, SortValueAscBtn, SortValueDescBtn, swapKey2ValueBtn}=myDeshbord;
	const {openFileBtn, copyInputBtn, PasteInputBtn, exportInputJson2FileBtn, clearInputDbBtn}=myDeshbord;
	const	{copyOutputBtn, exportOutputJson2FileBtn, clearProcessedDbBtn}=myDeshbord;
	const {aiTranslateBtn, stopAiTranslateBtn, aiTranslateProgress, aiTranslatePercent, downloadAiDicBtn, clearAiDicBtn}=myDeshbord;
	const {PreTextArea, processedTextArea}=myDeshbord;

	
	let preJsonData={};
	let outputJSONData={};
	let aiTranslationController = null;

	const savedInputDictionary = await browserDic.getInputDictionary();
	const savedProcessedDictionary = await browserDic.getProcessedDictionary();

	if (Object.keys(savedInputDictionary).length) {
		preJsonData = savedInputDictionary;
		updateInputTextArea();
	}

	if (Object.keys(savedProcessedDictionary).length) {
		outputJSONData = savedProcessedDictionary;
		updateOutputTextArea();
	}
	
	(function getJsonFormLocalStorage(){
		const jsonData= localStorage.getItem("JSON_Dic_Data");
		console.log(jsonData);
		if (jsonData){
			preJsonData=	JSON.parse(jsonData); // localStorage से text लो
			updateInputTextArea();
			localStorage.removeItem("JSON_Dic_Data"); //to empty local storage
		}
	})();

	if (Object.keys(preJsonData).length) {
		await browserDic.saveInputDictionary(preJsonData);
		await browserDic.addPendingWordsFromJSON(preJsonData);
	}

	const debounce = (callback, delay = 500) => {
		let timeoutId;
		return (...args) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => callback(...args), delay);
		};
	};

	const parseTextareaJSON = (textarea) => JSON.parse(textarea.value.trim() || "{}");

	const saveInputFromTextareaNow = async (showAlert = false) => {
		try {
			preJsonData = parseTextareaJSON(PreTextArea);
			await browserDic.saveInputDictionary(preJsonData);
			await browserDic.addPendingWordsFromJSON(preJsonData);
			return true;
		} catch (error) {
			if (showAlert) alert(`Input JSON is not valid: ${error.message}`);
			return false;
		}
	};

	const saveProcessedFromTextareaNow = async (showAlert = false) => {
		try {
			outputJSONData = parseTextareaJSON(processedTextArea);
			await browserDic.saveProcessedDictionary(outputJSONData);
			return true;
		} catch (error) {
			if (showAlert) alert(`Processed JSON is not valid: ${error.message}`);
			return false;
		}
	};

	const syncInputFromTextarea = debounce(async () => {
		await saveInputFromTextareaNow();
	});

	const syncProcessedFromTextarea = debounce(async () => {
		await saveProcessedFromTextareaNow();
	});

	const updateAIProgress = (current, total) => {
		const percent = total ? Math.min(100, Math.round((current / total) * 100)) : 0;
		aiTranslateProgress.value = percent;
		aiTranslatePercent.textContent = `${percent}%`;
	};

	const setAITranslating = (isTranslating) => {
		aiTranslateBtn.disabled = isTranslating;
		stopAiTranslateBtn.disabled = !isTranslating;
	};

	function updateInputTextArea(){
		if (preJsonData){
			try{
				PreTextArea.value = JSON.stringify(preJsonData, null , 1);
				myDeshbord.updateLineNumbers(PreTextArea, myDeshbord.inputLineNumbers);
			}catch(error){
				alert(`Not Valid JSON Data ${error.message}`)
			}
		}
	}


	function updateOutputTextArea(){
		console.log(JSON.stringify(outputJSONData));
		processedTextArea.value = JSON.stringify(outputJSONData, null, 1);
		myDeshbord.updateLineNumbers(processedTextArea, myDeshbord.processedLineNumbers);
		browserDic.saveProcessedDictionary(outputJSONData);
	}
	

	//event on input-area json Data
	PreTextArea.addEventListener("input", syncInputFromTextarea);
	processedTextArea.addEventListener("input", syncProcessedFromTextarea);
	PreTextArea.addEventListener("input", () => myDeshbord.updateLineNumbers(PreTextArea, myDeshbord.inputLineNumbers));
	processedTextArea.addEventListener("input", () => myDeshbord.updateLineNumbers(processedTextArea, myDeshbord.processedLineNumbers));
	PreTextArea.addEventListener("scroll", () => myDeshbord.syncLineNumberScroll(PreTextArea, myDeshbord.inputLineNumbers));
	processedTextArea.addEventListener("scroll", () => myDeshbord.syncLineNumberScroll(processedTextArea, myDeshbord.processedLineNumbers));
	myDeshbord.updateLineNumbers(PreTextArea, myDeshbord.inputLineNumbers);
	myDeshbord.updateLineNumbers(processedTextArea, myDeshbord.processedLineNumbers);
	
	openFileBtn.addEventListener("change", (event) => {
		//event for open file btn
    const file = event.target.files[0];
    if (!file) {
        alert("कोई फ़ाइल चुनी नहीं गई है!");
        return;
    }

    const fr = new FileReader();
    fr.readAsText(file);

    fr.addEventListener("load", async () => {
        try {
            preJsonData = JSON.parse(fr.result);  // ✅ अब object मिलेगा
            updateInputTextArea();                // ✅ TextArea अपडेट करो
            await browserDic.saveInputDictionary(preJsonData);
            await browserDic.addPendingWordsFromJSON(preJsonData);
			alert("JSON file data saved in browser IndexedDB.");
        } catch (error) {
            alert("Invalid JSON file: " + error.message);
        }
    });
	});
	
	copyInputBtn.addEventListener('click', async ()=>{
		if (!await saveInputFromTextareaNow(true)) return;
		myDeshbord.copyText(JSON.stringify(preJsonData, null, 1));
	});

	PasteInputBtn.addEventListener('click', async ()=>{
		try {
			preJsonData = JSON.parse(await navigator.clipboard.readText());
			updateInputTextArea();
			await browserDic.saveInputDictionary(preJsonData);
			await browserDic.addPendingWordsFromJSON(preJsonData);
		} catch (error) {
			alert(`Error to paste text ${error.message}`);
		}
		updateInputTextArea();
	});

	exportInputJson2FileBtn.addEventListener('click', async ()=>{
		if (!await saveInputFromTextareaNow(true)) return;
		myDeshbord.export2JsonFile( JSON.stringify( preJsonData, null, 1));
	});

	clearInputDbBtn.addEventListener('click', async ()=>{
		if (!confirm("Clear input JSON from IndexedDB?")) return;
		await browserDic.clearInputDictionary();
		preJsonData = {};
		updateInputTextArea();
		alert("Input JSON IndexedDB data cleared.");
	});

	//event on output-area
	copyOutputBtn.addEventListener('click', async ()=>{
		if (!await saveProcessedFromTextareaNow(true)) return;
		myDeshbord.copyText(JSON.stringify(outputJSONData, null, 1));
	});

	exportOutputJson2FileBtn.addEventListener('click', async ()=>{
		if (!await saveProcessedFromTextareaNow(true)) return;
		myDeshbord.export2JsonFile( JSON.stringify( outputJSONData, null, 1));
	});

	clearProcessedDbBtn.addEventListener('click', async ()=>{
		if (!confirm("Clear processed JSON from IndexedDB?")) return;
		await browserDic.clearProcessedDictionary();
		outputJSONData = {};
		updateOutputTextArea();
		alert("Processed JSON IndexedDB data cleared.");
	});

	aiTranslateBtn?.addEventListener('click', async ()=>{
		if (!await saveInputFromTextareaNow(true)) return;
		aiTranslationController = new AbortController();
		setAITranslating(true);
		updateAIProgress(0, 1);

		try {
			const translatedDictionary = await translateIndexedDBWordsByAI(browserDic, {
				signal: aiTranslationController.signal,
				onProgress: updateAIProgress
			});
			if (Object.keys(translatedDictionary).length) {
				outputJSONData = translatedDictionary;
				updateOutputTextArea();
			}
		} catch (error) {
			if (error.name === "AbortError") {
				alert("AI translation stopped.");
			} else {
				alert(`AI translation failed: ${error.message}`);
			}
		} finally {
			aiTranslationController = null;
			setAITranslating(false);
		}
	});

	stopAiTranslateBtn?.addEventListener('click', ()=>{
		aiTranslationController?.abort();
	});

	downloadAiDicBtn?.addEventListener('click', async ()=>{
		const translatedDictionary = await browserDic.getTranslatedDictionary();
		myDeshbord.export2JsonFile(JSON.stringify(translatedDictionary, null, 2), "Hindi2EnglishDicByAi");
	});

	clearAiDicBtn?.addEventListener('click', async ()=>{
		if (!confirm("Clear browser AI dictionary from IndexedDB?")) return;
		await browserDic.clearDictionary();
		alert("Browser AI dictionary cleared.");
	});

	//event on swap key2 value
	swapKey2ValueBtn.addEventListener('click', async ()=>{
		if (!await saveInputFromTextareaNow(true)) return;
		outputJSONData = myJson.swapObjKeyValue(preJsonData);
		updateOutputTextArea();
	});

	//event for sort json
	SortKeyAscBtn.addEventListener('click', async ()=>{
		if (!await saveInputFromTextareaNow(true)) return;
		outputJSONData = myJson.sortObjByKey(preJsonData, true);
		updateOutputTextArea();
	});

	SortKeyDescBtn.addEventListener('click', async ()=>{
		if (!await saveInputFromTextareaNow(true)) return;
		outputJSONData = myJson.sortObjByKey(preJsonData, false);
		updateOutputTextArea();
	});

	SortValueAscBtn.addEventListener('click', async ()=>{
		if (!await saveInputFromTextareaNow(true)) return;
		outputJSONData = myJson.sortObjectByValue(preJsonData, true);
		updateOutputTextArea();
	});

	SortValueDescBtn.addEventListener('click', async ()=>{
		if (!await saveInputFromTextareaNow(true)) return;
		outputJSONData = myJson.sortObjectByValue(preJsonData, false);
		updateOutputTextArea();
	});
	
}


async function translateIndexedDBWordsByAI(browserDic, options = {}){
	const {signal, onProgress = () => {}} = options;

	await browserDic.addPendingWordsFromJSON(await browserDic.getInputDictionary());

	const pendingWords = await browserDic.getPendingWordsFromInputDictionary();
	onProgress(0, pendingWords.length);

	if (!pendingWords.length) {
		alert("No pending words found in browser dictionary.");

		onProgress(100, 100);

		return {
			translated: await browserDic.getTranslatedDictionaryForInput(),
			notTranslated: {}
		};
	}

	const batchSize = 100;
	let translatedCount = 0;
	const notTranslated = {};

	for (let i = 0; i < pendingWords.length; i += batchSize) {
		if (signal?.aborted) {
			throw new DOMException("AI translation stopped.", "AbortError");
		}

		const batch = pendingWords.slice(i, i + batchSize);

		const translatedWords = await translateWordsByAI(batch, signal);

		if (Object.keys(translatedWords).length) {
			await browserDic.mergeDictionary(translatedWords, true);
			translatedCount += Object.keys(translatedWords).length;
		} else {
			// अगर पूरा batch translate नहीं हुआ, तो words अलग object में डाल दो
			for (const word of batch) {
				notTranslated[word] = (notTranslated[word] || 0) + 1;
			}
		}

		onProgress(Math.min(i + batch.length, pendingWords.length), pendingWords.length);
	}

	const translated = await browserDic.getTranslatedDictionaryForInput();

	if (translatedCount) {
		alert(`${translatedCount} words translated and saved in browser dictionary.`);
	} else {
		alert("No words were translated.");
	}

	return {
		translated,
		notTranslated
	};
}

async function translateWordsByAI(words, signal){
	const apiKey = getGeminiApiKey();
	if (!apiKey) return {};

	const prompt = `
Convert these roman/English words to Hindi Devanagari transliteration only.
Do not translate meaning.
Return only a valid JSON object where each key is the original word and each value is the Hindi transliteration.
Words:
${JSON.stringify(words)}
`;

	try {
		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
			{
				method: "POST",
				signal,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contents: [
						{
							parts: [{ text: prompt }]
						}
					]
				})
			}
		);

		if (!response.ok) {
			throw new Error(`Gemini API error: ${response.status}`);
		}

		const data = await response.json();
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
		return parseAIJSON(text);
	} catch (error) {
		if (error.name === "AbortError") throw error;
		console.error("AI translation failed:", error);
		alert(`AI translation failed: ${error.message}`);
		return {};
	}
}

function getGeminiApiKey(){
	const storageKey = "gemini_api_key";
	let apiKey = localStorage.getItem(storageKey);

	if (!apiKey) {
		apiKey = prompt("Enter Gemini API key:");
		if (apiKey) {
			localStorage.setItem(storageKey, apiKey.trim());
		}
	}

	return apiKey?.trim();
}

function parseAIJSON(text){
	const cleanText = text.replace(/```json|```/g, "").trim();

	try {
		return JSON.parse(cleanText);
	} catch {
		const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
		return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
	}
}

class BrowserDictionaryStore{
	#dbName = "English2HindiTransliteration";
	#storeName = "browserDictionary";
	#inputStoreName = "inputDictionary";
	#processedStoreName = "processedDictionary";
	#dictionaryKey = "aiDictionary";
	#inputDictionaryKey = "inputJSON";
	#processedDictionaryKey = "processedJSON";
	#dbPromise;

	#openDB(){
		if (this.#dbPromise) return this.#dbPromise;

		this.#dbPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(this.#dbName, 2);

			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(this.#storeName)) {
					db.createObjectStore(this.#storeName);
				}
				if (!db.objectStoreNames.contains(this.#inputStoreName)) {
					db.createObjectStore(this.#inputStoreName);
				}
				if (!db.objectStoreNames.contains(this.#processedStoreName)) {
					db.createObjectStore(this.#processedStoreName);
				}
			};

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});

		return this.#dbPromise;
	}

	async getDictionary(){
		return this.#getDictionaryFromStore(this.#storeName, this.#dictionaryKey);
	}

	async getInputDictionary(){
		return this.#getDictionaryFromStore(this.#inputStoreName, this.#inputDictionaryKey);
	}

	async saveInputDictionary(dictionary){
		return this.#saveDictionaryToStore(this.#inputStoreName, this.#inputDictionaryKey, dictionary);
	}

	async getProcessedDictionary(){
		return this.#getDictionaryFromStore(this.#processedStoreName, this.#processedDictionaryKey);
	}

	async saveProcessedDictionary(dictionary){
		return this.#saveDictionaryToStore(this.#processedStoreName, this.#processedDictionaryKey, dictionary);
	}

	async clearInputDictionary(){
		return this.saveInputDictionary({});
	}

	async clearProcessedDictionary(){
		return this.saveProcessedDictionary({});
	}

	async #getDictionaryFromStore(storeName, dictionaryKey){
		const db = await this.#openDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, "readonly");
			const store = transaction.objectStore(storeName);
			const request = store.get(dictionaryKey);

			request.onsuccess = () => resolve(request.result || {});
			request.onerror = () => reject(request.error);
		});
	}

	async #saveDictionary(dictionary){
		return this.#saveDictionaryToStore(this.#storeName, this.#dictionaryKey, dictionary);
	}

	async #saveDictionaryToStore(storeName, dictionaryKey, dictionary){
		const db = await this.#openDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, "readwrite");
			const store = transaction.objectStore(storeName);
			const request = store.put(dictionary, dictionaryKey);

			request.onsuccess = () => resolve(dictionary);
			request.onerror = () => reject(request.error);
		});
	}

	async mergeDictionary(newDictionary, overwriteFilled = false){
		const currentDictionary = await this.getDictionary();

		for (const [word, value] of Object.entries(newDictionary || {})) {
			const key = String(word).trim().toLowerCase();
			if (!key || key.length <= 1) continue;

			const normalizedValue = String(value || "").trim();

			if (overwriteFilled || !(key in currentDictionary)) {
				currentDictionary[key] = normalizedValue;
			}
		}

		return this.#saveDictionary(currentDictionary);
	}

	async addPendingWordsFromJSON(jsonData){
		const currentDictionary = await this.getDictionary();
		const words = this.#extractWords(jsonData);

		for (const word of words) {
			const key = String(word).trim().toLowerCase();
			if (!key || key.length <= 1) continue;

			if (!(key in currentDictionary) || this.#isCountValue(currentDictionary[key])) {
				currentDictionary[key] = "";
			}
		}

		return this.#saveDictionary(currentDictionary);
	}

	#extractWords(jsonData){
		if (Array.isArray(jsonData)) {
			return jsonData;
		}

		if (typeof jsonData === 'object' && jsonData !== null) {
			return Object.keys(jsonData);
		}

		return [];
	}

	#isCountValue(value){
		return /^\d+$/.test(String(value || "").trim());
	}

	async getPendingWords(){
		const dictionary = await this.getDictionary();
		return Object.entries(dictionary)
			.filter(([, value]) => !String(value || "").trim() || this.#isCountValue(value))
			.map(([word]) => word);
	}

	async getPendingWordsFromInputDictionary(){
		const inputDictionary = await this.getInputDictionary();
		const aiDictionary = await this.getDictionary();

		return this.#extractWords(inputDictionary)
			.map((word) => String(word).trim().toLowerCase())
			.filter((word) => word.length > 1)
			.filter((word) => !String(aiDictionary[word] || "").trim() || this.#isCountValue(aiDictionary[word]));
	}

	async getTranslatedDictionary(){
		const dictionary = await this.getDictionary();
		return Object.fromEntries(
			Object.entries(dictionary)
				.filter(([, value]) => String(value || "").trim() && !this.#isCountValue(value))
				.sort(([a], [b]) => a.localeCompare(b))
		);
	}

	async getTranslatedDictionaryForInput(){
		const inputWords = new Set(
			this.#extractWords(await this.getInputDictionary())
				.map((word) => String(word).trim().toLowerCase())
				.filter((word) => word.length > 1)
		);
		const dictionary = await this.getDictionary();

		return Object.fromEntries(
			Object.entries(dictionary)
				.filter(([word, value]) => inputWords.has(word))
				.filter(([, value]) => String(value || "").trim() && !this.#isCountValue(value))
				.sort(([a], [b]) => a.localeCompare(b))
		);
	}

	async clearDictionary(){
		return this.#saveDictionary({});
	}
}

class Deshbord {
	constructor(JsonMagicSorter) {
		this.#getElements();
		this.#setEventOnElements(JsonMagicSorter);
	}
	#getElements() {
		const elements={
			container: "container",
			fontSize: "FontSize-range",
			//sorting method
			SortKeyAscBtn : "SortKeyAscBtn",
			SortKeyDescBtn : "SortKeyDescBtn",
			SortValueAscBtn : "SortValueAscBtn",
			SortValueDescBtn : "SortValueDescBtn",
			swapKey2ValueBtn :'swapKey2ValueBtn',
			aiTranslateBtn: "aiTranslateBtn",
			stopAiTranslateBtn: "stopAiTranslateBtn",
			aiTranslateProgress: "aiTranslateProgress",
			aiTranslatePercent: "aiTranslatePercent",
			downloadAiDicBtn: "downloadAiDicBtn",
			clearAiDicBtn: "clearAiDicBtn",
			
			//input-area Btn
			openFileBtn : "openFileBtn",
			copyInputBtn : 'copyInputBtn',
			PasteInputBtn: "PasteInputBtn",
			exportInputJson2FileBtn: 'exportInputJson2FileBtn',
			clearInputDbBtn: "clearInputDbBtn",
			//display textArea
			PreTextArea : "FilePreview",
			inputLineNumbers: "FilePreviewLineNumbers",
			
			//output area Btn
			copyOutputBtn: "copyOutputBtn",
			exportOutputJson2FileBtn: 'exportOutputJson2FileBtn',
			clearProcessedDbBtn: "clearProcessedDbBtn",
			//display textArea
			processedTextArea : "procesedJSON",
			processedLineNumbers: "procesedJSONLineNumbers",
		};
		for( const [key, value] of Object.entries(elements)){
			this[key]= document.getElementById(value);
		}
	}
	#setEventOnElements(myJson) { 

		//this for change font size
		this.fontSize.addEventListener("change", (e) => {
			this.PreTextArea.style.fontSize = `${e.target.value}px`;
			this.processedTextArea.style.fontSize = `${e.target.value}px`;
			this.inputLineNumbers.style.fontSize = `${e.target.value}px`;
			this.processedLineNumbers.style.fontSize = `${e.target.value}px`;
			this.updateLineNumbers(this.PreTextArea, this.inputLineNumbers);
			this.updateLineNumbers(this.processedTextArea, this.processedLineNumbers);
		});
	}  
	updateLineNumbers(textarea, lineNumberElement) {
		const lineCount = Math.max(textarea.value.split("\n").length, 1);
		lineNumberElement.textContent = Array.from({ length: lineCount }, (_, index) => index + 1).join("\n");
		this.syncLineNumberScroll(textarea, lineNumberElement);
	}

	syncLineNumberScroll(textarea, lineNumberElement) {
		lineNumberElement.scrollTop = textarea.scrollTop;
	}

	export2JsonFile(text, defaultFileName = "untitled"){
		try{
			//creae blob object
			const blob = new Blob([text], { type: 'text/plain' });
			
			let fileName=prompt("enter File Name", defaultFileName);
			if (!fileName) fileName = defaultFileName;
			
			//create temp Objrect
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = `${fileName}.json`;
			
			link.click(); //for start download
			URL.revokeObjectURL(link.href);//remkove download link
			alert("file Save Sussefuly !!!");
		}catch(error){
			alert(`Error saving file: ${error.message}`);
		}
	}

	copyText(textContent) {
    if (!navigator.clipboard) {
        alert("Clipboard API is not supported in your browser.");
        return;
    }

    navigator.clipboard
        .writeText(textContent)
        .then(() => {
            console.log("Text copied successfully!");
            alert("Text copied to clipboard ✨");
        })
        .catch((err) => {
            console.error(`Error copying text: ${err}`);
            alert(`Error copying text: ${err}`);
        });
	}

	pasteText(targetTextArea) {
		navigator.clipboard
			.readText()
			.then((text) => {
				targetTextArea = JSON.parse(text);
				console.log("paste Text Sussefuly...");
			})
			.catch((err) => {
				alert(`Error to paste text ${err}`);
			});
	}
}

class JsonOrganizer{
	async fetchJson(file) {
		try {
			const response = await fetch(file);
			if (!response.ok) {
				throw new Error("Network Response was not ok..");
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error(`There was a problem reading JSON Data ${error}`);
			return null;
		}
	}
	
	sortObjByKey(obj, order=true){
		if (typeof obj==='object' && obj !== null){
			let sortedObj ={};
			let keys=[];
			// console.log(obj);
			if (order){
				keys=Object.keys(obj).sort((a,b)=> a.localeCompare(b));
			}else{
				keys=Object.keys(obj).sort((a,b)=> b.localeCompare(a));
			}
			
			keys.forEach((key)=>{
				if(typeof obj[key] === 'object' && obj[key] !== null){
					obj[key] = this.sortObjByKey(obj[key], order);
				}
				sortedObj[key]=obj[key];
			});
			// console.log(sortedObj);

			return sortedObj;
		}
		return obj;
	}
	

	sortObjectByValue(obj, order = true) {
		if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
			return obj;
		}

		const valueToText = (value) => {
			if (value === null || value === undefined) return "";
			if (typeof value === 'object') return JSON.stringify(value);
			return String(value);
		};

		const entries = Object.entries(obj).map(([key, value]) => [
			key,
			typeof value === 'object' && value !== null && !Array.isArray(value)
				? this.sortObjectByValue(value, order)
				: value
		]);

		entries.sort((a, b) => {
			const firstValue = valueToText(a[1]);
			const secondValue = valueToText(b[1]);
			return order
				? firstValue.localeCompare(secondValue, undefined, { numeric: true })
				: secondValue.localeCompare(firstValue, undefined, { numeric: true });
		});

		return Object.fromEntries(entries);
	}

	swapObjKeyValue(obj) {
		if (typeof obj==='object' && obj!==null){
			let swapedObj={};
			// console.log(keyValuArry);
			for (const [key, value] of Object.entries(obj)){
				if(typeof value=== 'object' && value !== null){
					swapedObj[key]= this.swapObjKeyValue(value);
				}else{
					swapedObj[value]=key;
				}
			}
			return swapedObj;
		}
		return obj;
	}

}
//Values के आधार पर Sort करना
function sortJsonByValue(jsonData) {
	const sortedData = {};
	Object.entries(jsonData)
		.sort((a, b) => a[1].localeCompare(b[1]))
		.forEach(([key, value]) => {
			sortedData[key] = value;
		});
	return sortedData;
}
