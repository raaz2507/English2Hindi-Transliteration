import { Dictionary } from "./Hindi2EnglishDic.js";
import { EngWord } from "./EnglishWord.js";

document.addEventListener('DOMContentLoaded', ()=>{
	 //ye web page se saare element ko capture kar leta hai
	const allElements= new UIElements();
	
	//ye dom ko deshbord ki karha funchelty provide karata hai 
	const tran_Dash=new TranslationDashboard(allElements);

	//ye main-core hai janha text translate hota hai
	const tran_Engine= new TransliterationEngine();
	const jsonFile =new JSONFileMange();
	setEventsOnBtn(allElements, tran_Dash, tran_Engine, jsonFile);
});

function setEventsOnBtn(elmt, Dashbord, tran_Engine, jsonFile) {
	const { inputTextBox, outputTextBox, fontSizeRange, OpenTextFileBtn } = elmt;
	const container = document.getElementById("contener");

	// 🎯 Font size adjustment
	fontSizeRange.addEventListener("input", () =>
		Dashbord.setTextBoxFontSize(fontSizeRange, inputTextBox, outputTextBox)
	);

	// 📂 File input handling
	OpenTextFileBtn.addEventListener("change", (e) => {
		const file = e.target.files[0];
		const reader = new FileReader();

		reader.onload = (e) => {
			inputTextBox.value = e.target.result;
		};

		reader.readAsText(file);
	});

	// 💡 Action Map using dictionary instead of switch-case
	const actionMap = {
		pasteBtn: () => Dashbord.pasteText(inputTextBox),

		saveInputTextBtn: () => Dashbord.saveTxt(inputTextBox.value),

		PublishInputTextBtn: () => Dashbord.openTextReadingPage(inputTextBox.value),

		copyBtn: () => Dashbord.copyText(outputTextBox),

		saveOutputTextBtn: () => Dashbord.saveTxt(outputTextBox.value),

		PublishOutputTextBtn: () => Dashbord.openTextReadingPage(outputTextBox.value),

		convertBtn: () => {
			outputTextBox.value = tran_Engine.convertText(inputTextBox.value);
			Dashbord.updateDisplay(tran_Engine.totalWordArr, tran_Engine.notFoundWords);

			const saveJSONFlag = saveFileSet();
			const JSONWithCountFlag = saveFileSetWithCount();

			if (tran_Engine.notFoundWords.length > 0 && (saveJSONFlag || JSONWithCountFlag)) {
				jsonFile.saveNotFoundWordAsJSON(tran_Engine.notFoundWords, JSONWithCountFlag);
			}
		},

		ReadJSONBtn: () => {
			if (tran_Engine.notFoundWords.length) {
				const jsonData = jsonFile.convertArre2JSON(
					tran_Engine.notFoundWords,
					saveFileSetWithCount()
				);
				Dashbord.openJSONReadingPage(jsonData);
			}
		},

		saveJSONBtn: () => {
			if (tran_Engine.notFoundWords.length > 0) {
				jsonFile.saveNotFoundWordAsJSON(
					tran_Engine.notFoundWords,
					saveFileSetWithCount()
				);
			}
		}
	};

	// 🔘 Event delegation using actionMap
	container.addEventListener("click", (e) => {
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

	convertArre2JSON(wordList, saveWithCount){
		let data = {};
		let filteredWords = filterEngWord(wordList).map(word => word.toLowerCase());
		// const saveWithCount = saveFileSetWithCount();
		if (saveWithCount) {
			// Count frequency
			filteredWords.forEach(word => {
				if (word.length > 1) {
					data[word] = (data[word] || 0) + 1;
				}
			});
		} else {
			// Simple empty JSON keys
			filteredWords.forEach(word => {
				if (word.length > 1) {
					data[word] = "";
				}
			});
		}
		if (saveWithCount){
			data= sortObjectByValue(data);
		}
		return data;

		function filterEngWord(wordArr) {
			const engWord = EngWord; //fetchJson('EnglishWord.json');
			const filterdList = wordArr.filter((word) => !engWord.includes(word));
			return filterdList;
		}
		function sortObjectByValue(obj) {
			return Object.fromEntries(
					Object.entries(obj).sort(([, a], [, b]) => b - a)
			);
		}
	}

	#saveJSON2File(data, saveWithCount) {
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
class UIElements{
	constructor(){
		this.#getVerFormDom();
	}
	#getVerFormDom(){
		const elemtsMap={
			//setting btn
			fontSizeRange:'font-size-range',
			fontSizeDisplay: 'fontSizeDisplay',

			//JSON related Btn
			ReadJSONBtn:'ReadJSONBtn',
			saveJSONBtn: 'saveJSONBtn',

			//Display status elements
			totalWordDis:"total_words",
			notFoundWordsDis: "not_found_words",
			conversionPercentageDis: "con_per",

			//input-textArea btn
			pasteBtn : 'pasteBtn',
			OpenTextFileBtn: 'OpenTextFileBtn',
			saveInputTextBtn: 'saveInputTextBtn',
			PublishInputTextBtn: 'PublishInputTextBtn',

			//outputTextArea btn
			copyBtn: 'copyBtn',
			saveOutputTextBtn: 'saveOutputTextBtn',
			PublishOutputTextBtn: 'PublishOutputTextBtn',

			//outputTextArea btn
			convertBtn:'convertBtn',

			//converted Text save or read related button
			ReadingModeBtn: 'ReadingModeBtn',
			saveTxt: 'saveTxt',

			//text box
			inputTextBox: 'inputTextBox',
			outputTextBox: 'outputTextBox'
		};
		//map Elements To DOM
		for(const [key, value] of Object.entries(elemtsMap)){
			this[key]= document.getElementById(value);
		}
	}
}

class TranslationDashboard{
	#elmt;
	
	constructor(elmt){
		this.#elmt=elmt;
	}
	updateDisplay(totalWords, notFoundWords){
		this.#elmt.totalWordDis.value = totalWords.length;
		this.#elmt.notFoundWordsDis.value= notFoundWords.length;
		this.#elmt.conversionPercentageDis.value= 100-((notFoundWords.length/totalWords.length)*100).toFixed(2);
	}

	setTextBoxFontSize(fontSizeRanger=this.#elmt.fontSizeRange, inputTextBox=this.#elmt.inputTextBox, outputTextBox=this.#elmt.outputTextBox){
		const {fontSizeDisplay}=this.#elmt;
		inputTextBox.style.fontSize = fontSizeRanger.value + "px";
		outputTextBox.style.fontSize = fontSizeRanger.value + "px";
		fontSizeDisplay.value = fontSizeRanger.value; //font size display
	}

	//copy and paset methods
	pasteText(inputTextBox=this.#elmt.inputTextBox) {
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

	copyText(outputTextBox=this.#elmt.outputTextBox) {
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
	openTextReadingPage(text=this.#elmt.outputTextBox.value) {
		localStorage.setItem("readingText", text);
		window.open("./ReadModePage.html", "_blank");
	}

	saveTxt(text =this.#elmt.outputTextBox){
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
		this.notFoundWords=[];
		this.totalWordArr=[];
	}
	convertText(inputText) {
		let wordArr=[];

		wordArr=this.#StringToArre(inputText);

		this.totalWordArr=wordArr;
		
		// console.log(totalWordArr);
		let outputArr = this.#transText(wordArr);
		// console.log(outputArr);
		let outputStr = this.#Arry2StringForOutput(outputArr);
		// console.log(outputStr);
		return outputStr;
	}

	#StringToArre(inputText){
		let wordsArr = inputText.match(/[\p{L}\p{M}_]+|\d+|\n|\t|[^\p{L}\p{M}\d\s]/gu);;
		console.log(wordsArr);
		return wordsArr;
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
		wordArr.forEach((word) => {
			wordFound = false;
			//check karega ki spaical char hai ya nahi
			let engWordFlag =this.#isEnglishWord(word);
			if (engWordFlag) {
				Lword = word.toLowerCase();
				//Dic ke sub dic ko access karega
				for (let subDis in dic) {
					/*dic ke subDic me word milega to fleg ko true set karga.aur word ko translated wordArre me add kar dega.*/

					if (dic[subDis].hasOwnProperty(Lword)) {
						outputArr.push(dic[subDis][Lword]);
						wordFound = true;
						break;
					}
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
		console.log(this.notFoundWords);
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
	#isEnglishWord(word) {
		return /^[a-zA-Z]+$/.test(word);
	}
	#isHindiWord(word) {
		const hindiRegex = /^[\p{Script=Devanagari}\p{M}]+$/u;
		return hindiRegex.test(word);
	}
	#Arry2StringForOutput(outputArr){

		const noSpaceBefore = /^[,!.?:;]$/;     // इनसे पहले space नहीं
		const noSpaceAfter  = /^[@#₹/\\-]$/;    // इनके बाद space नहीं

		let outputStr = "";

		outputArr.forEach((word, index) => {

			if (word === "\n" || word === "\t") {
				outputStr += word;
				return;
			}

			let prevWord = outputArr[index - 1];

			if (!prevWord) {
				outputStr += word;
				return;
			}

			if (noSpaceBefore.test(word)) {
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
