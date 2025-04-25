import { Dictionary } from "./Hindi2EnglishDic.js";
import { EngWord } from "./EnglishWord.js";


document.addEventListener('DOMContentLoaded', ()=>{

	 //ye web page se saare element ko capture kar leta hai
	const allElements= new UIElements();
	
	//ye dom ko deshbord ki karha funchelty provide karata hai 
	const tran_Dash=new TranslationDashboard(allElements);

	//ye main-core hai janha text translate hota hai
	const tran_Engine= new TransliterationEngine();

	setEventsOnBtn(allElements, tran_Dash, tran_Engine);
});


function	setEventsOnBtn(elmt, Dashbord, tran_Engine){
	//action button event
	elmt.pasteBtn.addEventListener('click',()=> Dashbord.pasteText(elmt.inputTextBox));
	elmt.copyBtn.addEventListener('click', ()=>Dashbord.copyText(elmt.outputTextBox));
	
	//convert text
	elmt.convertBtn.addEventListener('click', ()=> {
		//this function translate and show string to output box
		elmt.outputTextBox.value = tran_Engine.convertText(elmt.inputTextBox.value);
		//this function update display
		Dashbord.updateDisplay(tran_Engine.totalWordLength, tran_Engine.notFoundWordsLength);
	});

	//setting btn
	elmt.fontSizeRange.addEventListener("input", ()=> Dashbord.setTextBoxFontSize(elmt.fontSizeRange, elmt.inputTextBox, elmt.outputTextBox));
	
	//converted Text seve ro Read Related Butoon
	elmt.ReadingModeBtn.addEventListener('click', ()=> Dashbord.openReadingPage(elmt.outputTextBox.value));
	elmt.saveTxt.addEventListener('click', ()=>	Dashbord.saveTxt(elmt.outputTextBox.value));
}

class TransliterationEngine{
	
	constructor(){
		this.notFoundWordsLength=0;
		this.totalWordLength=0;
	}
	convertText(inputText) {
		let WordArr=this.#StringToArre(inputText);
		console.log(WordArr);
		this.totalWordLength = WordArr.length; //geting data for display
		let outputArr = this.#tranText(WordArr);
		console.log(outputArr);
		let outputStr = this.#Arry2StringForOutput(outputArr);
		console.log(outputStr);
		return outputStr;
		// outputTextBox.value = outputStr;
		//	// text को localStorage में store करो
		//	localStorage.setItem("readingText", outputStr);
		// updateDisplay();
	}

	#StringToArre(inputText){
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
		
	#tranText(wordArr) {
		const dic = Dictionary;
		let Lword;
		let outputArr = [];
		let notFoundWord = [];
		let wordFound = false;
		//Word arre ke each word ko access karega
		wordArr.forEach((word) => {
			wordFound = false;
			//check karega ki spaical char hai ya nahi
			let specialCharFleg=this.#isSpecialChar(word);
			if (!specialCharFleg) {
				Lword = word.toLowerCase();
				//Dic ke sub dic ko access karega
				for (let subDis in dic) {
					//dic ke subDic me word milega to fleg ko true set karga.
					//aur word ko translated wordArre me add kar dega.

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
				if(!specialCharFleg){
					notFoundWord.push(word);
				}
			}
		});

		if (notFoundWord.length > 0 && (saveFileSet() || saveFileSetWithCount())) {
			saveNotFoundWord(notFoundWord);
		}
		this.notFoundWordsLength = notFoundWord.length; //word length for Not Found Words	for display
		return outputArr;

		/* block function Define */
		function saveFileSet() {
			let shouldSave = document.querySelector('input[name="saveJSON"]:checked').value;
			return shouldSave === "true" ? true : false;
		}
		function saveFileSetWithCount() {
			let value = document.querySelector('input[name="saveJSON"]:checked').value;
			return value === "true";
		}
		function saveNotFoundWord(wordList) {
			let data = {};
			let filteredWords = filterEngWord(wordList).map(word => word.toLowerCase());
			const saveWithCount = saveFileSetWithCount();
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
		function sortObjectByValue(obj) {
			return Object.fromEntries(
					Object.entries(obj).sort(([, a], [, b]) => b - a)
			);
		}
		function filterEngWord(wordArr) {
			const engWord = EngWord; //fetchJson('EnglishWord.json');
			const filterdList = wordArr.filter((word) => !engWord.includes(word));
			return filterdList;
		}
	}
	
	#isSpecialChar(word) {
		const specialCharRegex =
			/[.,?!'\-:;"@#$%^&*()_+=\[\]{}<>\\/|0-9]|\n|\t/g;
		return word.length === 1 && specialCharRegex.test(word);
	}
	#Arry2StringForOutput(outputArr) {
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
	async fetchJson(filename = "./Hindi2EnglishDic.json") {
		try {
			const response = await fetch(filename);
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
}

class UIElements{
	constructor(){
		this.getVerFormDom();
	}

	getVerFormDom(){
		//setting btn
		this.fontSizeRange= document.getElementById('font-size-range');
		this.saveJSON= document.querySelector('input[name="saveJSON"]:checked');

		//Display status elements
		this.totalWordDis=document.getElementById("total_words");
		this.notFoundWordsDis=document.getElementById("not_found_words");
		this.conversionPercentageDis=document.getElementById("con_per");

		//action btn
		this.pasteBtn= document.getElementById('pasteBtn');
		this.convertBtn= document.getElementById('convertBtn');
		this.copyBtn= document.getElementById('copyBtn');

		//converted Text save or read related button
		this.ReadingModeBtn= document.getElementById('ReadingModeBtn');
		this.saveTxt=document.getElementById('saveTxt');

		//text box
		this.inputTextBox = document.getElementById('input-text');
		this.outputTextBox = document.getElementById('output-text');
	}
}

class TranslationDashboard{
	#elmt;
	constructor(elmt){
		this.#elmt=elmt;
	}
	updateDisplay(totalWords, notFoundWords){
		this.#elmt.totalWordDis.placeholder = totalWords;
		this.#elmt.notFoundWordsDis.placeholder= notFoundWords;
		this.#elmt.conversionPercentageDis.placeholder= 100-((notFoundWords/totalWords)*100).toFixed(2);
	}

	setTextBoxFontSize(fontSizeRanger=this.#elmt.fontSizeRange, inputTextBox=this.#elmt.inputTextBox, outputTextBox=this.#elmt.outputTextBox){
		inputTextBox.style.fontSize = fontSizeRanger.value + "px";
		outputTextBox.style.fontSize = fontSizeRanger.value + "px";
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

	openReadingPage(text=this.#elmt.outputTextBox.value) {
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