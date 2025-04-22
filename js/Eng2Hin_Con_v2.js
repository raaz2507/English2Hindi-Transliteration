import {Dictionary} from './Hindi2EnglishDic.js';
import {EngWord} from './EnglishWord.js';

document.addEventListener("DOMContentLoaded", ()=>{

});
window.addEventListener("load", updateDisplay);
	const inputTextBox = document.getElementById("input-text");
	const outputTextBox = document.getElementById("output-text");
	const fontsizeBtn = document.getElementById("font-size-range");

	fontsizeBtn.addEventListener("input", () => {
		inputTextBox.style.fontSize = fontsizeBtn.value + "px";
		outputTextBox.style.fontSize = fontsizeBtn.value + "px";
	});
	function copyText() {
		navigator.clipboard
			.writeText(outputTextBox.value)
			.then(() => {
				// alert("Text Copied....");
			})
			.catch((err) => {
				console.error(`Error Copying text.: ${err}`);
				alert(`Error Copying text.: ${err}`);
			});
	}
	function pasteText() {
		navigator.clipboard
			.readText()
			.then((text) => {
				inputTextBox.value = text;
			})
			.catch((err) => {
				alert(`Error to paste text ${err}`);
			});
	}
	
	const total_word=document.getElementById("total_words");
	const not_found_words=document.getElementById("not_found_words");
	const con_per=document.getElementById("con_per");
	let TotalWord=0;
	let Not_Found_Words=0;
	function updateDisplay(){
		total_word.placeholder= TotalWord;
		not_found_words.placeholder=Not_Found_Words;
		let per= 100-((Not_Found_Words/TotalWord)*100);
		con_per.placeholder= isNaN(per) ? '0' : per;
	}
	async function fetchJson(filename = "./Hindi2EnglishDic.json") {
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
	function saveFileSet() {
		let shouldSave = document.querySelector('input[name="saveJSON"]:checked').value;
		return shouldSave === "true" ? true : false;
	}
	function convertText() {
		let inputText = inputTextBox.value;
		let WordArr = preProcess(inputText);
		TotalWord = WordArr.length; //geting data for display
		let outputArr = tranText(WordArr);
		// console.log(outputArr);
		let outputStr = postProcess(outputArr);
		outputTextBox.value = outputStr;
		 // text को localStorage में store करो
		 localStorage.setItem("readingText", outputStr);
		updateDisplay();
	}

	function isAlphabet(char) {
		let assi = char.charCodeAt(0);
		return (assi >= 65 && assi <= 90) || (assi >= 97 && assi <= 122);
	}

	function isSpecialChar(word) {
		const specialCharRegex =
			/[.,?!'\-:;"@#$%^&*()_+=\[\]{}<>\\/|0-9]|\n|\t/g;
		return word.length === 1 && specialCharRegex.test(word);
	}
	/*
function isAlphabet(word) {
return /^[A-Za-z]+$/.test(word);
}
function isSpecialChar(word) {
const specialCharRegex = /^[^A-Za-z]+$/; // सिर्फ नॉन-अल्फाबेटिकल चेक
return specialCharRegex.test(word);
}
*/
	function postProcess(outputArr) {
		let outputStr = "";
		outputArr.forEach((word) => {
			if (isSpecialChar(word)) {
				outputStr += word; // स्पेशल कैरेक्टर को सीधे जोड़ो
			} else {
				outputStr += word + " "; // स्पेशल कैरेक्टर के बाद स्पेस मत दो
			}
		});

		return outputStr.trim(); // आखिरी में एक्स्ट्रा स्पेस हटा दो
	}
	function preProcess(inputText) {
		let arr = [];
		let word = "";

		for (let char of inputText) {
			if (isAlphabet(char)) {
				word += char;
			} else {
				if (word !== "") {
					arr.push(word);
					word = "";
				}
				if (char !== " ") {
					arr.push(char);
				}
			}
		}

		if (word !== "") {
			arr.push(word);
		}

		return arr;
	}

	function tranText(wordArr) {
		const dic = Dictionary;
		let Lword;
		let outputArr = [];
		let notFoundWord = [];
		let wordFound = false;
		//Word arre ke each word ko access karega
		wordArr.forEach((word) => {
			wordFound = false;
			//check karega ki spaical char hai ya nahi
			if (!isSpecialChar(word)) {
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
				notFoundWord.push(word);
			}
		});

		if (notFoundWord.length > 0 && saveFileSet()) {
			saveNotFoundWord(notFoundWord);
		}
		Not_Found_Words= notFoundWord.length; //word length for Not Found Words  for display
		return outputArr;
	}
	function filterEngWord(wordArr) {
		const engWord = EngWord; //fetchJson('EnglishWord.json');
		const filterdList = wordArr.filter((word) => !engWord.includes(word));
		return filterdList;
	}
	function saveNotFoundWord(wordList) {
		let data = {};
		filterEngWord(wordList).forEach((word) => {
			if (word.length !== 1) data[word.toLowerCase()] = "";
		});

		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "notFoundWords.json"; // Download file का नाम
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
  function openReadingPage() {
    window.open("./ReadModePage.html", "_blank");
	}
	function saveTxt(){
		let fileName = prompt("Enter file name:", "myfile");

		// 🔸 Agar user ne cancel nahi kiya
		if (fileName) {
			if (!fileName.endsWith(".txt")) {
				fileName += ".txt";  // default extension .txt
			}
		
			const text = localStorage.getItem("readingText");//"Hello meri jaan 💖, yeh file download ho rahi hai!";
			const blob = new Blob([text], { type: "text/plain" });
			const link = document.createElement("a");

			link.href = URL.createObjectURL(blob);
			link.download = fileName; // तुम यहाँ अपनी file का नाम रख सकते हो

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}

	// exporting funciton 
	window.pasteText = pasteText;
	window.convertText= convertText;
	window.copyText=copyText;
	window.openReadingPage=openReadingPage;
	window.saveTxt=saveTxt;