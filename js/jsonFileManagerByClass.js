document.addEventListener("DOMContentLoaded", () => {
	const JsonMagicSorter = new JsonOrganizer();
	const browserDic = new BrowserDictionaryStore();
	const myDeshbord = new Deshbord();
	setEventOnElements(myDeshbord, JsonMagicSorter, browserDic);
});
function setEventOnElementsNew(myDeshbord, myJson){
	const {SortKeyAscBtn, SortKeyDescBtn, SortValueAscBtn, SortValueDescBtn, swapKey2ValueBtn}=myDeshbord;
	const {openFileBtn, copyInputBtn, PasteInputBtn, exportInputJson2FileBtn}=myDeshbord; 
	const	{copyOutputBtn, exportOutputJson2FileBtn}=myDeshbord;
	const {PreTextArea, sortTextArea}=myDeshbord;
	
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
	const {openFileBtn, copyInputBtn, PasteInputBtn, exportInputJson2FileBtn}=myDeshbord; 
	const	{copyOutputBtn, exportOutputJson2FileBtn}=myDeshbord;
	const {aiTranslateBtn, downloadAiDicBtn, clearAiDicBtn}=myDeshbord;
	const {PreTextArea, sortTextArea}=myDeshbord;

	
	let preJsonData={};
	let outputJSONData={};
	
	(function getJsonFormLocalStorage(){
		const jsonData= localStorage.getItem("JSON_Dic_Data");
		console.log(jsonData);
		if (jsonData){
			preJsonData=	JSON.parse(jsonData); // localStorage से text लो
			updateInputTextArea();
			localStorage.removeItem("JSON_Dic_Data"); //to empty local storage
		}
	})();

	function updateInputTextArea(){
		if (preJsonData){
			try{
				PreTextArea.value = JSON.stringify(preJsonData, null , 1);
			}catch(error){
				alert(`Not Valid JSON Data ${error.message}`)
			}
		}
	}


	function updateOutputTextArea(){
		console.log(JSON.stringify(outputJSONData));
		sortTextArea.value = JSON.stringify(outputJSONData, null, 1);
	}
	

	//event on input-area json Data
	
	openFileBtn.addEventListener("change", (event) => {
		//event for open file btn
    const file = event.target.files[0];
    if (!file) {
        alert("कोई फ़ाइल चुनी नहीं गई है!");
        return;
    }

    const fr = new FileReader();
    fr.readAsText(file);

    fr.addEventListener("load", () => {
        try {
            preJsonData = JSON.parse(fr.result);  // ✅ अब object मिलेगा
            updateInputTextArea();                // ✅ TextArea अपडेट करो
        } catch (error) {
            alert("Invalid JSON file: " + error.message);
        }
    });
	});
	
	copyInputBtn.addEventListener('click', ()=>{
		myDeshbord.copyText(JSON.stringify(preJsonData, null, 1));
	});

	PasteInputBtn.addEventListener('click', ()=>{
		myDeshbord.pasteText(preJsonData);
		updateInputTextArea();
	});

	exportInputJson2FileBtn.addEventListener('click', ()=>{
		myDeshbord.export2JsonFile( JSON.stringify( preJsonData, null, 1));
	});

	//event on output-area
	copyOutputBtn.addEventListener('click', ()=>{
		myDeshbord.copyText(JSON.stringify(outputJSONData, null, 1));
	});

	exportOutputJson2FileBtn.addEventListener('click',()=>{
		myDeshbord.export2JsonFile( JSON.stringify( outputJSONData, null, 1));
	});

	aiTranslateBtn?.addEventListener('click', async ()=>{
		const translatedDictionary = await translateIndexedDBWordsByAI(browserDic);
		if (Object.keys(translatedDictionary).length) {
			preJsonData = translatedDictionary;
			updateInputTextArea();
		}
	});

	downloadAiDicBtn?.addEventListener('click', async ()=>{
		const translatedDictionary = await browserDic.getTranslatedDictionary();
		myDeshbord.export2JsonFile(JSON.stringify(translatedDictionary, null, 2), "Hindi2EnglishDicByAi");
	});

	clearAiDicBtn?.addEventListener('click', async ()=>{
		if (!confirm("Clear browser AI dictionary from IndexedDB?")) return;
		await browserDic.clearDictionary();
		preJsonData = {};
		outputJSONData = {};
		updateInputTextArea();
		updateOutputTextArea();
		alert("Browser dictionary cleared.");
	});

	//event on swap key2 value
	swapKey2ValueBtn.addEventListener('click',()=>{
		outputJSONData = myJson.swapObjKeyValue(preJsonData);
		updateOutputTextArea();
	});

	//event for sort json
	SortKeyAscBtn.addEventListener('click', ()=>{
		outputJSONData = myJson.sortObjByKey(preJsonData, true);
		updateOutputTextArea();
	});

	SortKeyDescBtn.addEventListener('click', ()=>{
		outputJSONData = myJson.sortObjByKey(preJsonData, false);
		updateOutputTextArea();
	});

	SortValueAscBtn.addEventListener('click', ()=>{
		outputJSONData = myJson.sortObjectByValue(preJsonData, true);
		updateOutputTextArea();
	});

	SortValueDescBtn.addEventListener('click', ()=>{
		outputJSONData = myJson.sortObjectByValue(preJsonData, false);
		updateOutputTextArea();
	});
	
}


async function translateIndexedDBWordsByAI(browserDic){
	const pendingWords = await browserDic.getPendingWords();

	if (!pendingWords.length) {
		alert("No pending words found in browser dictionary.");
		return await browserDic.getTranslatedDictionary();
	}

	const batchSize = 100;
	let translatedCount = 0;

	for (let i = 0; i < pendingWords.length; i += batchSize) {
		const batch = pendingWords.slice(i, i + batchSize);
		const translatedWords = await translateWordsByAI(batch);
		await browserDic.mergeDictionary(translatedWords, true);
		translatedCount += Object.keys(translatedWords).length;
	}

	if (translatedCount) {
		alert(`${translatedCount} words translated and saved in browser dictionary.`);
	} else {
		alert("No words were translated.");
	}

	return await browserDic.getTranslatedDictionary();
}

async function translateWordsByAI(words){
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
	#dictionaryKey = "aiDictionary";
	#dbPromise;

	#openDB(){
		if (this.#dbPromise) return this.#dbPromise;

		this.#dbPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(this.#dbName, 1);

			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(this.#storeName)) {
					db.createObjectStore(this.#storeName);
				}
			};

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});

		return this.#dbPromise;
	}

	async getDictionary(){
		const db = await this.#openDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(this.#storeName, "readonly");
			const store = transaction.objectStore(this.#storeName);
			const request = store.get(this.#dictionaryKey);

			request.onsuccess = () => resolve(request.result || {});
			request.onerror = () => reject(request.error);
		});
	}

	async #saveDictionary(dictionary){
		const db = await this.#openDB();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(this.#storeName, "readwrite");
			const store = transaction.objectStore(this.#storeName);
			const request = store.put(dictionary, this.#dictionaryKey);

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

	async getPendingWords(){
		const dictionary = await this.getDictionary();
		return Object.entries(dictionary)
			.filter(([, value]) => !String(value || "").trim())
			.map(([word]) => word);
	}

	async getTranslatedDictionary(){
		const dictionary = await this.getDictionary();
		return Object.fromEntries(
			Object.entries(dictionary)
				.filter(([, value]) => String(value || "").trim())
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
			downloadAiDicBtn: "downloadAiDicBtn",
			clearAiDicBtn: "clearAiDicBtn",
			
			//input-area Btn
			openFileBtn : "openFileBtn",
			copyInputBtn : 'copyInputBtn',
			PasteInputBtn: "PasteInputBtn",
			exportInputJson2FileBtn: 'exportInputJson2FileBtn',
			//display textArea
			PreTextArea : "FilePreview",
			
			//output area Btn
			copyOutputBtn: "copyOutputBtn",
			exportOutputJson2FileBtn: 'exportOutputJson2FileBtn',
			//display textArea
			sortTextArea : "sortdJSON",
		};
		for( const [key, value] of Object.entries(elements)){
			this[key]= document.getElementById(value);
		}
	}
	#setEventOnElements(myJson) { 

		//this for change font size
		this.fontSize.addEventListener("change", (e) => {
			this.PreTextArea.style.fontSize = `${e.target.value}px`;
			this.sortTextArea.style.fontSize = `${e.target.value}px`;
		});
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
		const sorted = {};

		for (const key in obj) {
			if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
				// Nested object => recursive call
				sorted[key] = this.sortObjectByValue(obj[key], order);
			} else {
				// Not nested, ignore here
			}
		}

		// If it's a flat object (i.e., no nested keys), sort directly
		if (Object.keys(sorted).length === 0) {
			const entries = Object.entries(obj).sort((a, b) =>
				order ? a[1].localeCompare(b[1]) : b[1].localeCompare(a[1])
			);
			return Object.fromEntries(entries);
		}

		return sorted;
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
