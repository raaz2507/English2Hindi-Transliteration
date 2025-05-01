document.addEventListener("DOMContentLoaded", () => {
	const JsonMagicSorter = new JsonOrganizer();
	const myDeshbord = new Deshbord();
	setEventOnElements(myDeshbord, JsonMagicSorter);
});

function setEventOnElements(myDeshbord, myJson){
	const {SortKeyAscBtn, SortKeyDescBtn, SortValueAscBtn, SortValueDescBtn, swapKey2ValueBtn}=myDeshbord;
	const {openFileBtn, copyInputBtn, PasteInputBtn, exportInputJson2FileBtn}=myDeshbord; 
	const	{copyOutputBtn, exportOutputJson2FileBtn}=myDeshbord;
	const {PreTextArea, sortTextArea}=myDeshbord;
	
	let preJsonData={};
	let outputJSONData={};
	
	(function getJsonFormLocalStorage(){
		const jsonData= localStorage.getItem("JSON_Dic_Data");
		console.log(jsonData);
		if (jsonData){
			preJsonData=	JSON.parse(jsonData); // localStorage से text लो
			updateInputTextArea();
			//localStorage.removeItem("JSON_Dic_Data"); //to empty local storage
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


class Deshbord {
	constructor(JsonMagicSorter) {
		this.#getElements();
		this.#setEventOnElements(JsonMagicSorter);
	}
	#getElements() {
		const elements={
			fontSize: "FontSize-range",
			
			//sorting method
			SortKeyAscBtn : "SortKeyAscBtn",
			SortKeyDescBtn : "SortKeyDescBtn",
			SortValueAscBtn : "SortValueAscBtn",
			SortValueDescBtn : "SortValueDescBtn",
			swapKey2ValueBtn :'swapKey2ValueBtn',
			
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
	export2JsonFile(text){
		try{
			//creae blob object
			const blob = new Blob([text], { type: 'text/plain' });
			
			let fileName=prompt("enter File Name");
			if (!fileName) fileName = "untitled";
			
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
	sortObjectByValue(obj,order) {
		let swaped= this.swapObjKeyValue(obj);
		console.log(swaped);
		const sorted= this.sortObjByKey(swaped, order);
		console.log(sorted);
		return this.swapObjKeyValue(sorted)
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
