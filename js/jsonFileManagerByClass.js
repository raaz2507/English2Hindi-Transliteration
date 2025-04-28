document.addEventListener("DOMContentLoaded", () => {
	const JsonMagicSorter = new JsonOrganizer();
	const myDeshbord = new Deshbord();
	setEventOnElements(myDeshbord, JsonMagicSorter);
});

function setEventOnElements(myDeshbord, myJson){
	const {SortKeyAscBtn, SortKeyDescBtn, SortValueAscBtn, SortValueDescBtn, swapKey2ValueBtn}=myDeshbord;
	const {exportInputJson2TxtBtn, exportOutputJson2TxtBtn}=myDeshbord;
	const {PreTextArea, sortTextArea}=myDeshbord;
	const {openFileBtn}=myDeshbord;
	// this.preJOSNData={};
	// this.sortedJSONData={};
	
	//event for open file btn
	openFileBtn.addEventListener("change", (e) => {
		console.log("openFIlesddd");
		const jsonObj=myDeshbord.openFile(e);
		console.log(jsonObj);
		PreTextArea.value = JSON.stringify(jsonObj, null, 2);
	});
	//event on export json Data
	exportInputJson2TxtBtn.addEventListener('click', ()=>{
		console.log('exprtinputData');
	});
	exportOutputJson2TxtBtn.addEventListener('click',()=>{
		console.log('exprtOutputData');
	});

	//event on swap key2 value
	swapKey2ValueBtn.addEventListener('click',()=>{
		let jsonData= getJsonFromTextArea(PreTextArea);
		const swapedValue= myJson.swapObjKeyValue(jsonData);
		sortTextArea.value = JSON.stringify(swapedValue, null, 1);
	})

	//event for sort json
	SortKeyAscBtn.addEventListener('click', ()=>{
		let jsonData= getJsonFromTextArea(PreTextArea);
		const sortedJsonData = myJson.sortObjByKey(jsonData, true);
		sortTextArea.value = JSON.stringify(sortedJsonData,null, 1);
	});

	SortKeyDescBtn.addEventListener('click', ()=>{
		let jsonData= getJsonFromTextArea(PreTextArea);
		const sortedJsonData = myJson.sortObjByKey(jsonData, false);
		sortTextArea.value = JSON.stringify(sortedJsonData, null, 1);
	});

	SortValueAscBtn.addEventListener('click', ()=>{
		console.log("clicked");
		let jsonData= getJsonFromTextArea(PreTextArea);
		const sortedJsonData = myJson.sortObjectByValue(jsonData, true);
		sortTextArea.value = JSON.stringify( sortedJsonData, null, 1 );
	});

	SortValueDescBtn.addEventListener('click', ()=>{
		console.log("clicked");
		let jsonData= getJsonFromTextArea(PreTextArea);
		const sortedJsonData = myJson.sortObjectByValue(jsonData, false);
		sortTextArea.value = JSON.stringify( sortedJsonData, null, 1 );
	});
	function getJsonFromTextArea(TextArea){
		if (!TextArea || TextArea.value===''){
			alert("text area empty or Not found");
		}
		try{
			const jsonObj = JSON.parse(TextArea.value);
			return jsonObj;
		}catch(error){
			alert("Invalid JSON format. Please check your input.");
			console.log(error);
			return {};
		}
	}
}


class Deshbord {
	constructor(JsonMagicSorter) {
		this.#getElements();
		this.#setEventOnElements(JsonMagicSorter);
		this.#setTextToPage();
	}
	#getElements() {
		const elements={
			fontSize: "FontSize-range",
			openFileBtn : "openFileBtn",
			
			//sorting method
			SortKeyAscBtn : "SortKeyAscBtn",
			SortKeyDescBtn : "SortKeyDescBtn",
			SortValueAscBtn : "SortValueAscBtn",
			SortValueDescBtn : "SortValueDescBtn",

			//saveJson file Btn
			exportOutputJson2TxtBtn: 'exportOutputJson2TxtBtn',
			exportInputJson2TxtBtn: 'exportInputJson2TxtBtn',
			
			//swapt key2value 
			swapKey2ValueBtn :'swapKey2ValueBtn',
			
			//display textArea
			PreTextArea : "FilePreview",
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
	async openFile(event) {
				return new Promise((resolve, reject) => {
						const file = event.target.files[0];
						if (file && file.type === "application/json") {
								const reader = new FileReader();
								reader.onload = function (e) {
										resolve(e.target.result);
								};
								reader.onerror = function () {
										reject("Error reading file.");
								};
								reader.readAsText(file);
						} else {
								reject("Please select a valid JSON file.");
						}
				});
		}
		#setTextToPage(){
			const jsonData= localStorage.getItem("JSON_Dic_Data");
			// console.log(jsonData);
			if (jsonData){
				this.PreTextArea.value=	jsonData; // localStorage से text लो
				// localStorage.setItem("JSON_Dic_Data", "");
			}
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
