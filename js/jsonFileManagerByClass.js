document.addEventListener("DOMContentLoaded", () => {
	const JsonMagicSorter = new JsonOrganizer();
	const myDeshbord = new Deshbord();
	main(myDeshbord, JsonMagicSorter);
});

function main(myDeshbord, myJson){
	const {SortKeyAsc, SortKeyDesc, SortValueAsc, SortValueDesc}=myDeshbord;
	const {PreTextArea, sortTextArea}=myDeshbord;
	const {openFileBtn}=myDeshbord;
	// this.preJOSNData={};
	// this.sortedJSONData={};
	
	//event for open file btn


	//event for sort json
	SortKeyAsc.addEventListener('click', ()=>{
		let jsonData= JSON.parse(PreTextArea.value);
		const sortedJsonData = myJson.sortObjectByKey(jsonData, true);
		sortTextArea.value = JSON.stringify(sortedJsonData,null, 1);
	});

	SortKeyDesc.addEventListener('click', ()=>{
		let jsonData= JSON.parse(PreTextArea.value);
		const sortedJsonData = myJson.sortObjectByKey(jsonData, false);
		sortTextArea.value = JSON.stringify(sortedJsonData, null, 1);
	});

	SortValueAsc.addEventListener('click', ()=>{
		sortTextArea.value = myJson.SortValueAsc(PreTextArea.value);
	});

	SortValueDesc.addEventListener('click', ()=>{
		sortTextArea.value = myJson.SortValueDesc(PreTextArea.value);
	});
}


class Deshbord {
	constructor(JsonMagicSorter) {
		this.#getElements();
		this.#setEventOnElements(JsonMagicSorter);
		this.#setTextToPage();
	}
	#getElements() {
		this.fontSize = document.getElementById("FontSize-range");
		this.openFileBtn = document.getElementById("openFileBtn");

		//openFile
		this.SortKeyAsc = document.getElementById("SortKeyAsc");
		this.SortKeyDesc = document.getElementById("SortKeyDesc");
		this.SortValueAsc = document.getElementById("SortValueAsc");
		this.SortValueDesc = document.getElementById("SortValueDesc");

		//saveJson file Btn
		this.exportOutputJson2TxtBtn = document.getElementById('exportOutputJson2TxtBtn');
		this.exportInputJson2TxtBtn = document.getElementById('exportInputJson2TxtBtn');
		//display textArea
		this.PreTextArea = document.getElementById("FilePreview");
		this.sortTextArea = document.getElementById("sortdJSON");
	}
	#setEventOnElements(myJson) {
		
		//event for open File
		this.openFileBtn.addEventListener("change", (e) => {
			const jsonObj=this.#openFile(e);
			console.log(jsonObj);
			this.PreTextArea.value = JSON.stringify(jsonObj, null, 2);
		}); 

		//this for change font size
		this.fontSize.addEventListener("change", (e) => {
			this.PreTextArea.style.fontSize = `${e.target.value}px`;
			this.sortTextArea.style.fontSize = `${e.target.value}px`;
		});
	}
	async #openFile(event) {
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
			if (jsonData!==''){
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

	sortObjectByKey(obj, ascendingOrder = true) {
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        let sorted = {};
        Object.keys(obj)
            .sort((a, b) => {
                if (ascendingOrder) {
									console.log("a");
                    return a.localeCompare(b);
                } else {
										console.log("d");
                    return b.localeCompare(a);
                }
            })
            .forEach(key => {
                sorted[key] = this.sortObjectByKey(obj[key], ascendingOrder); // Recursive call ke sath order pass karo
            });
        return sorted;
    }
    return obj;
	}

}
class JsonOrganizerOld {
	constructor() {
		// this.preJOSNData={};
		// this.sortedJSONData={};
	}
	SortValueAsc(){
		console.log("define the function");
	}
	SortValueDesc(){
		console.log("define the function");
	}

	sortJSON(preJOSNData) {
		console.log('sortJosnColled');
		let sortedJSONData;
		sortedJSONData = JSON.stringify(preJOSNData);
		sortTextArea.value = sortedJSONData;
	}
	//JSON के keys को अल्फाबेटिकल ऑर्डर में sort करना:
	sortJsonByKey(jsonData) {
		const sortedData = {};
		Object.keys(jsonData)
			.sort()
			.forEach((key) => {
				sortedData[key] = jsonData[key];
			});
		return sortedData;
	}
	//Inner Keys को भी Sort करना
	SortJsonByDeepInnerKey(jsonData) {
		const sortedData = {};
		Object.keys(jsonData)
			.sort()
			.forEach((key) => {
				if (typeof jsonData[key] === "object" && !Array.isArray(jsonData[key])) {
					sortedData[key] = this.SortJsonByDeepInnerKey(jsonData[key]); // Recursive call
				} else {
					sortedData[key] = jsonData[key];
				}
			});
		return sortedData;
	}
	//Values के आधार पर Sort करना
	sortJsonByValue(jsonData) {
		const sortedData = {};
		Object.entries(jsonData)
			.sort((a, b) => a[1].localeCompare(b[1]))
			.forEach(([key, value]) => {
				sortedData[key] = value;
			});
		return sortedData;
	}
}