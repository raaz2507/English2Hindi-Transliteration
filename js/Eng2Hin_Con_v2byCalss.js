import { Dictionary } from "./Hindi2EnglishDic.js";
import { ignoreWords } from "./ignoreWoldList.js";

document.addEventListener('DOMContentLoaded', ()=>{
	//ye main-core hai janha text translate hota hai
	const tran_Engine= new TransliterationEngine();
	const jsonFile =new JSONFileMange();
	const browserDic = new BrowserDictionaryStore();
	//ye dom ko deshbord ki karha funchelty provide karata hai 
	const tran_Dash=new TranslationDashboard(tran_Engine, jsonFile, browserDic);

	
	// setEventsOnBtn(allElements, tran_Dash, tran_Engine, jsonFile);
});

function setEventsOnBtn(elmt, Dashbord, tran_Engine, jsonFile) {
	const { inputTextBox, outputTextBox, fontSizeRange, OpenTextFileBtn } = elmt;
	const container = document.getElementById("contener");

	
}



class TranslationDashboard{
	#elemts={};
	#tran_Engine;
	#jsonFile;
	#browserDic;
	constructor(tran_Engine, jsonFile, browserDic){
		this.#tran_Engine = tran_Engine;
		this.#jsonFile = jsonFile;
		this.#browserDic = browserDic;
		this.#geElemetFormDom();
		this.#setEventsOnBtn();
	}
	#geElemetFormDom(){
		const elemtsMap={
			//setting btn
			fontSizeRange:{id:'font-size-range', cls:'', ele:'', event: ''},
			fontSizeDisplay:{id:'fontSizeDisplay', cls:'', ele:'', event: ''},

			//JSON related Btn
			ReadJSONBtn:{id:'ReadJSONBtn', cls:'', ele:'', event: ''},
			saveJSONBtn:{id:'saveJSONBtn', cls:'', ele:'', event: ''},

			//Display status elements
			totalWordDis:{id:'total_words', cls:'', ele:'', event: ''},
			notFoundWordsDis:{id:'not_found_words', cls:'', ele:'', event: ''},
			conversionPercentageDis:{id:'con_per', cls:'', ele:'', event: ''},

			//input-textArea btn
			pasteBtn :{id:'pasteBtn', cls:'', ele:'', event: ''},
			OpenTextFileBtn:{id:'OpenTextFileBtn', cls:'', ele:'', event: ''},
			saveInputTextBtn:{id:'saveInputTextBtn', cls:'', ele:'', event: ''},
			PublishInputTextBtn:{id:'PublishInputTextBtn', cls:'', ele:'', event: ''},

			//outputTextArea btn
			copyBtn:{id:'copyBtn', cls:'', ele:'', event: ''},
			saveOutputTextBtn:{id:'saveOutputTextBtn', cls:'', ele:'', event: ''},
			PublishOutputTextBtn:{id:'PublishOutputTextBtn', cls:'', ele:'', event: ''},

			//outputTextArea btn
			convertBtn:{id:'convertBtn', cls:'', ele:'', event: ''},

			//converted Text save or read related button
			ReadingModeBtn:{id:'ReadingModeBtn', cls:'', ele:'', event: ''},
			saveTxt:{id:'saveTxt', cls:'', ele:'', event: ''},

			//text box
			inputTextBox:{id:'inputTextBox', cls:'', ele:'', event: ''},
			outputTextBox: {id:'outputTextBox', cls:'', ele:'', event: ''}
		};
		//map Elements To DOM
		for(const [key, value] of Object.entries(elemtsMap)){
			// console.log(key, value, value['id']);
			if( value['id'] ){
				this.#elemts[key]= document.getElementById(value['id']);
			}
		}
		// console.log(this.#elemts);
	}

	#setEventsOnBtn(){
		const { inputTextBox, outputTextBox, fontSizeRange , OpenTextFileBtn } = this.#elemts;

		// 🎯 Font size adjustment
		fontSizeRange?.addEventListener("input", ()=>this.#setTextBoxFontSize());

		// 📂 File input handling
		OpenTextFileBtn?.addEventListener("change", (e) => {
			const file = e.target.files[0];
			if (!file || !inputTextBox) return;

			const reader = new FileReader();

			reader.onload = (e) => {
				inputTextBox.value = e.target.result;
			};

			reader.readAsText(file);
		});

		// 💡 Action Map using dictionary instead of switch-case
		const actionMap = {
			pasteBtn: () => this.pasteText(inputTextBox),

			saveInputTextBtn: () => this.saveTxt(inputTextBox?.value || ""),

			PublishInputTextBtn: () => this.openTextReadingPage(inputTextBox?.value || ""),

			copyBtn: () => this.copyText(outputTextBox),

			saveOutputTextBtn: () => this.saveTxt(outputTextBox?.value || ""),

			PublishOutputTextBtn: () => this.openTextReadingPage(outputTextBox?.value || ""),

			convertBtn: async () => {
				if (!inputTextBox || !outputTextBox) return;

				const browserDictionary = await this.#browserDic.getDictionary();
				this.#tran_Engine.setBrowserDictionary(browserDictionary);
				outputTextBox.value = this.#tran_Engine.convertText(inputTextBox.value);
				this.#updateDisplay(this.#tran_Engine.totalWordArr, this.#tran_Engine.notFoundWords);
				const notFoundDictionary = this.#jsonFile.convertArre2JSON(this.#tran_Engine.notFoundWords);
				await this.#browserDic.mergeDictionary(notFoundDictionary);

				const saveJSONFlag = saveFileSet();
				const JSONWithCountFlag = saveFileSetWithCount();

				if (this.#tran_Engine.notFoundWords.length > 0 && (saveJSONFlag || JSONWithCountFlag)) {
					this.#jsonFile.saveNotFoundWordAsJSON(this.#tran_Engine.notFoundWords, JSONWithCountFlag);
				}
			},

			ReadJSONBtn: () => {
				if (this.#tran_Engine.notFoundWords.length) {
					const jsonData = this.#jsonFile.convertArre2JSON(
						this.#tran_Engine.notFoundWords,
						saveFileSetWithCount()
					);
					this.openJSONReadingPage(jsonData);
					return;
				}

				this.openJSONReadingPage(null);
			},

			saveJSONBtn: () => {
				if (this.#tran_Engine.notFoundWords.length > 0) {
					this.#jsonFile.saveNotFoundWordAsJSON(
						this.#tran_Engine.notFoundWords,
						saveFileSetWithCount()
					);
				}
			}
		};

		// 🔘 Event delegation using actionMap
		document.body?.addEventListener("click", (e) => {
			const handler = actionMap[e.target.id];
			if (handler) handler(); // Run mapped function if exists
		});

		// 🧩 Helper functions
		function saveFileSet() {
			const select = document.querySelector('input[name="saveJSON"]:checked')?.value;
			return select === "1";
		}

		function saveFileSetWithCount() {
			const select = document.querySelector('input[name="saveJSON"]:checked')?.value;
			return select === "2";
		}
	}

	#updateDisplay(totalWords, notFoundWords){
		const total = totalWords?.length || 0;
		const notFound = notFoundWords?.length || 0;
		const conversionPercentage = total ? 100 - ((notFound / total) * 100).toFixed(2) : 0;

		if (this.#elemts.totalWordDis) this.#elemts.totalWordDis.value = total;
		if (this.#elemts.notFoundWordsDis) this.#elemts.notFoundWordsDis.value= notFound;
		if (this.#elemts.conversionPercentageDis) this.#elemts.conversionPercentageDis.value= conversionPercentage;
	}

	#setTextBoxFontSize(){
		const {fontSizeRange, fontSizeDisplay, inputTextBox, outputTextBox}=this.#elemts;
		if (!fontSizeRange) return;

		if (inputTextBox) inputTextBox.style.fontSize = fontSizeRange.value + "px";
		if (outputTextBox) outputTextBox.style.fontSize = fontSizeRange.value + "px";
		if (fontSizeDisplay) fontSizeDisplay.value = fontSizeRange.value; //font size display
	}

	//copy and paset methods
	pasteText(inputTextBox=this.#elemts.inputTextBox) {
		navigator.clipboard
			.readText()
			.then((text) => {
				inputTextBox.value = text;
				console.log("paste Text Sussefuly...");
			})
			.catch((err) => {
				alert(`Error to paste text ${err}`);
			});
	}

	copyText(outputTextBox=this.#elemts.outputTextBox) {
		navigator.clipboard
			.writeText(outputTextBox.value)
			.then(() => {
				console.log("Text Copied....");
			})
			.catch((err) => {
				console.error(`Error Copying text.: ${err}`);
				alert(`Error Copying text.: ${err}`);
			});
	}
	openJSONReadingPage(JSON_Data){
		//console.log(JSON_Data);
		localStorage.setItem("JSON_Dic_Data",JSON.stringify(JSON_Data, null, 1) );
		//console.log(localStorage.getItem("JSON_Dic_Data"));
		window.open('./jsonFileManage.html', '_blank');
	}
	openTextReadingPage(text=this.#elemts.outputTextBox.value) {
		localStorage.setItem("readingText", text);
		window.open("./ReadModePage.html", "_blank");
	}

	saveTxt(text =this.#elemts.outputTextBox){
		let fileName = prompt("Enter file name:", "myfile");

		// 🔸 Agar user ne cancel nahi kiya
		if (fileName) {
			if (!fileName.endsWith(".txt")) {
				fileName += ".txt";	// default extension .txt
			}
			const blob = new Blob([text], { type: "text/plain" });
			const link = document.createElement("a");

			link.href = URL.createObjectURL(blob);
			link.download = fileName; // तुम यहाँ अपनी file का नाम रख सकते हो

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}

class TransliterationEngine{
	
	constructor(){
		this.cache = new Map();
		this.browserDictionary = {};
		this.notFoundWords=[];
		this.totalWordArr=[];
	}
	setBrowserDictionary(dictionary = {}){
		this.browserDictionary = dictionary && typeof dictionary === "object" ? dictionary : {};
	}
	convertText(inputText) {
		this.notFoundWords = [];
		this.totalWordArr = [];

		const { text, map } = this.#protectHTML(String(inputText || ""));
		let wordArr=this.#StringToArre(text);

		this.totalWordArr=wordArr.filter(word => !this.#isWhiteSpace(word) && !this.#isHTMLToken(word));
		
		// console.log(totalWordArr);
		let outputArr = this.#transText(wordArr);
		// console.log(outputArr);
		let outputStr = this.#Arry2StringForOutput(outputArr);
		// console.log(outputStr);
		return this.#restoreHTML(outputStr, map);
	}

	#StringToArre(inputText){
		let wordsArr = inputText.match(/@@HTML_\d+@@|[\p{L}\p{M}_']+|\d+|\s+|[^\p{L}\p{M}\d\s]/gu) || [];
		// console.log(wordsArr);
		return wordsArr;
	}

	#protectHTML(input) {
		const map = new Map();
		let id = 0;

		const text = input.replace(/<[^>]+>/g, (tag) => {
			const key = `@@HTML_${id++}@@`;
			map.set(key, tag);
			return key;
		});

		return { text, map };
	}

	#restoreHTML(text, map) {
		for (const [key, value] of map.entries()) {
			text = text.replaceAll(key, value);
		}
		return text;
	}

	#StringToArre_old(inputText){
		let arr = [];
		let word = "";
		
		for (let char of inputText) {
			if (isAlphabet(char)) {
				word += char;
			} else {
				//jab non alfabate value milegi tab ek complite single word maan lega
				if (word !== "") {
					arr.push(word); //arre me word daal dega
					word = ""; //word ver ko empty kar dega
				}
				//agar space milega tab ek complete single word maan lega
				if (char !== " ") {
					arr.push(char);
				}
			}
		}

		if (word !== "") {
			arr.push(word);
		}
		return arr;

		function isAlphabet(char) {
			let desimalValu = char.charCodeAt(0);
			return (desimalValu >= 65 && desimalValu <= 90) || (desimalValu >= 97 && desimalValu <= 122);
		}
		function isHindiChar(char){
			let desimalvalue =char.charCodeAt(0);
			return (desimalvalue>=2305 && desimalvalue<=2416); //devnagri(hindi) 2305-2416
		}
	}

	#transText(wordArr) {
		const dic = Dictionary; //its importing form Hindi2English.js file 
		let Lword;
		const outputArr = [];
		const notFoundWordArr=[];
		let wordFound = false; //flag value set 

		//Word arre ke each word ko access karega
		if (!wordArr?.length) return [];
		wordArr.forEach((word) => {
			if (this.#isHTMLToken(word) || this.#isWhiteSpace(word)) {
				outputArr.push(word);
				return;
			}

			wordFound = false;
			//check karega ki spaical char hai ya nahi
			let engWordFlag =this.#isEnglishWord(word);
			if (engWordFlag) {
				Lword = word.toLowerCase();

				if (this.cache.has(Lword)) {
					outputArr.push(this.cache.get(Lword));
					return;
				}

				//Dic ke sub dic ko access karega
				for (let subDis in dic) {
					/*dic ke subDic me word milega to fleg ko true set karga.aur word ko translated wordArre me add kar dega.*/

					if (Object.prototype.hasOwnProperty.call(dic[subDis], Lword)) {
						const translatedWord = dic[subDis][Lword];
						this.cache.set(Lword, translatedWord);
						outputArr.push(translatedWord);
						wordFound = true;
						break;
					}
				}

				if (!wordFound && this.browserDictionary[Lword]) {
					this.cache.set(Lword, this.browserDictionary[Lword]);
					outputArr.push(this.browserDictionary[Lword]);
					wordFound = true;
				}
			}
			// agar dic me word nahi mila to notFoundWord Aree me word ko push kar dega.
			if (!wordFound) {
				outputArr.push(word);
				if(engWordFlag ){
					notFoundWordArr.push(word);
				}
			}
		});
		this.notFoundWords = notFoundWordArr;
		// console.log(this.notFoundWords);
		return outputArr;
	}
	
	#isSpecialChar(word) {
		// const specialCharRegex =/[.,?!'\-:;"@#$%^&*()_+=\[\]{}<>\\/|0-9]|\n|\t/g;
		return /^[^\p{L}\p{M}\p{N}\s]$/u.test(word) && !( this.#isEmoji(word) || this.#isNumber(word));
	}
	#isNumber(word) {
		return /^\p{N}+$/u.test(word);
	}
	#isEmoji(word) {
		return /^\p{Extended_Pictographic}$/u.test(word);
	}
	#isHTMLToken(word) {
		return /^@@HTML_\d+@@$/.test(word);
	}
	#isWhiteSpace(word) {
		return /^\s+$/.test(word);
	}
	#isEnglishWord(word) {
		return /^(?=.*[a-zA-Z])[a-zA-Z']+$/.test(word);
	}
	#isHindiWord(word) {
		const hindiRegex = /^[\p{Script=Devanagari}\p{M}]+$/u;
		return hindiRegex.test(word);
	}
	#Arry2StringForOutput(outputArr){

		const noSpaceBefore = /^[,!.?:;]$/;     // इनसे पहले space नहीं
		const noSpaceAfter  = /^[@#₹/\\-]$/;    // इनके बाद space नहीं

		let outputStr = "";
		if (!outputArr?.length) return "";
		outputArr.forEach((word, index) => {

			if (this.#isWhiteSpace(word)) {
				outputStr += word;
				return;
			}

			let prevWord = outputArr[index - 1];

			if (!prevWord) {
				outputStr += word;
				return;
			}

			if (this.#isHTMLToken(word) || this.#isHTMLToken(prevWord) || this.#isWhiteSpace(prevWord)) {
				outputStr += word;
			}
			else if (noSpaceBefore.test(word)) {
				outputStr = outputStr.trimEnd() + word;
			}
			else if (noSpaceAfter.test(prevWord)) {
				outputStr += word;
			}
			else {
				outputStr += " " + word;
			}

		});

		return outputStr;
	}

	#Arry2StringForOutput_old(outputArr) {
		let outputStr = "";
		outputArr.forEach((word) => {
			if (this.#isSpecialChar(word)) {
				outputStr += word; // स्पेशल कैरेक्टर को सीधे जोड़ो
			} else {
				outputStr += word + " "; // स्पेशल कैरेक्टर के बाद स्पेस मत दो
			}
		});

		return outputStr.trim(); // आखिरी में एक्स्ट्रा स्पेस हटा दो
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

}

class JSONFileMange{
	async fetchJson(file = "./Hindi2EnglishDic.json") {
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

	saveNotFoundWordAsJSON(wordList, saveWithCount){
		const data= this.convertArre2JSON(wordList, saveWithCount);
		this.#saveJSON2File(data,saveWithCount);
	}

	convertArre2JSON(wordList, saveWithCount = false){
		if (!Array.isArray(wordList)) return {};

		let data = {};

		for (const item of wordList) {
			if (!item) continue;

			const word = String(item).trim().toLowerCase();

			if (word.length <= 1 || ignoreWords.has(word)) {
				continue;
			}

			data[word] = saveWithCount ? (data[word] || 0) + 1 : "";
		}

		if (saveWithCount){
			data= sortObjectByValue(data);
		}
		return data;

		function sortObjectByValue(obj) {
			return Object.fromEntries(
					Object.entries(obj).sort(([, a], [, b]) => b - a)
			);
		}
	}

	#saveJSON2File(data, saveWithCount, fileName) {
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
	
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName || (saveWithCount ? "notFoundWords_withCount.json" : "notFoundWords.json");
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
}
