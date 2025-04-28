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


function	setEventsOnBtn(elmt, Dashbord, tran_Engine, jsonFile){
	//setting btn
	elmt.fontSizeRange.addEventListener("input", ()=> Dashbord.setTextBoxFontSize(elmt.fontSizeRange, elmt.inputTextBox, elmt.outputTextBox));
	
	//json file releted btn convertArre2JSON(wordList, saveWithCount)
	elmt.ReadJSONBtn.addEventListener('click', ()=>{
		if(tran_Engine.notFoundWords.length){
			Dashbord.openJSONReadingPage(jsonFile.convertArre2JSON(tran_Engine.notFoundWords, saveFileSetWithCount()));
		}
	});
	elmt.saveJSONBtn.addEventListener('click', ()=>{
		if (tran_Engine.notFoundWords.length > 0) {
			jsonFile.saveNotFoundWordAsJSON(tran_Engine.notFoundWords, saveFileSetWithCount());
		}
	});

	//inputTextArea Btn
	elmt.pasteBtn.addEventListener('click',()=> Dashbord.pasteText(elmt.inputTextBox));
	elmt.saveInputTextBtn.addEventListener('click', ()=>Dashbord.saveTxt(elmt.inputTextBox.value));
	elmt.PublishInputTextBtn.addEventListener('click', ()=>Dashbord.openTextReadingPage(elmt.inputTextBox.value));
	elmt.OpenTextFileBtn.addEventListener("change", (e)=> {
		let file = e.target.files[0];
		
		let reader = new FileReader();
		reader.onload = (e) => {
			elmt.inputTextBox.value = e.target.result; // File content aa gaya
		};
		
		reader.readAsText(file); // ya readAsDataURL(file) for images
	});

	//OutputTextArea Btn
	elmt.copyBtn.addEventListener('click', ()=>Dashbord.copyText(elmt.outputTextBox));
	elmt.saveOutputTextBtn.addEventListener('click', ()=>	Dashbord.saveTxt(elmt.outputTextBox.value));
	elmt.PublishOutputTextBtn.addEventListener('click', ()=>Dashbord.openTextReadingPage(elmt.outputTextBox.value));
	
	//convert text
	elmt.convertBtn.addEventListener('click', ()=> {
		//this function translate and show string to output box
		elmt.outputTextBox.value = tran_Engine.convertText(elmt.inputTextBox.value);
		//this function update display
		Dashbord.updateDisplay(tran_Engine.totalWordArr, tran_Engine.notFoundWords);

		//Automatic JSON Save File
		let saveJSONFlag = saveFileSet();
		let JSONWithCountFlag= saveFileSetWithCount();
		
		if (tran_Engine.notFoundWords.length > 0 && (saveJSONFlag || JSONWithCountFlag)) {
			jsonFile.saveNotFoundWordAsJSON(tran_Engine.notFoundWords, JSONWithCountFlag);
		}
		
	});

	function saveFileSet() {
		let select = document.querySelector('input[name="saveJSON"]:checked').value ;
		return select ? select=== "1": false; //agar null value hoti hai to use filter karta hai
	}

	function saveFileSetWithCount() {
		let select = document.querySelector('input[name="saveJSON"]:checked').value ;
		return select ? select === "2": false;
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
		//setting btn
		this.fontSizeRange= document.getElementById('font-size-range');

		//JSON related Btn
		this.ReadJSONBtn=document.getElementById('ReadJSONBtn');
		this.saveJSONBtn=document.getElementById('saveJSONBtn');


		//Display status elements
		this.totalWordDis=document.getElementById("total_words");
		this.notFoundWordsDis=document.getElementById("not_found_words");
		this.conversionPercentageDis=document.getElementById("con_per");

		//input-textArea btn
		this.pasteBtn= document.getElementById('pasteBtn');
		this.OpenTextFileBtn = document.getElementById('OpenTextFileBtn');
		this.saveInputTextBtn = document.getElementById('saveInputTextBtn');
		this.PublishInputTextBtn = document.getElementById('PublishInputTextBtn');

		//outputTextArea btn
		this.copyBtn= document.getElementById('copyBtn');
		this.saveOutputTextBtn= document.getElementById('saveOutputTextBtn');
		this.PublishOutputTextBtn =document.getElementById('PublishOutputTextBtn');

		//conversion button
		this.convertBtn= document.getElementById('convertBtn');
		
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
		this.#elmt.totalWordDis.placeholder = totalWords.length;
		this.#elmt.notFoundWordsDis.placeholder= notFoundWords.length;
		this.#elmt.conversionPercentageDis.placeholder= 100-((notFoundWords.length/totalWords.length)*100).toFixed(2);
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
		let {totalWordArr}=this;
		totalWordArr=this.#StringToArre(inputText);
		// console.log(totalWordArr);
		let outputArr = this.#tranText(totalWordArr);
		// console.log(outputArr);
		let outputStr = this.#Arry2StringForOutput(outputArr);
		// console.log(outputStr);
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
		let wordFound = false;
		let notFoundWordArr=[];
		//Word arre ke each word ko access karega
		wordArr.forEach((word) => {
			wordFound = false;
			//check karega ki spaical char hai ya nahi
			let specialCharFleg=this.#isSpecialChar(word);
			if (!specialCharFleg) {
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
				if(!specialCharFleg){
					notFoundWordArr.push(word);
				}
			}
		});
		this.notFoundWords= notFoundWordArr;
		return outputArr;
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

}
