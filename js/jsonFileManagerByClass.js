document.addEventListener("DOMContentLoaded", () => {
	const myDeshbord = new Deshbord();
	const sortJson = new sortJSONData();
	setTextToPage(myDeshbord);
});
function setTextToPage(dashBord){
	console.log(localStorage.getItem("JSON_Dic_Data"));
	dashBord.PreTextArea.innerText=  localStorage.getItem("JSON_Dic_Data"); // localStorage से text लो
	localStorage.setItem("JSON_Dic_Data", " ");
}
class Deshbord {
	constructor() {
		this.#getElements();
		this.#setEvent();
	}
	#getElements() {
		this.fontSize = document.getElementById("FontSize-range");
		this.openFileBtn = document.getElementById("openFile");

        //openFile
		this.SortKeyAsc = document.getElementById("SortKeyAsc");
        this.SortKeyDesc = document.getElementById("SortKeyDesc");
        this.SortValueAsc = document.getElementById("SortValueAsc");
        this.SortValueDesc = document.getElementById("SortValueDesc");

        //display textArea
		this.PreTextArea = document.getElementById("FilePreview");
		this.sortTextArea = document.getElementById("sortdJSON");
	}
	#setEvent() {
		this.openFileBtn.addEventListener("change", () => {
			this.PreTextArea.value = this.#openFile(e);
		}); //event for open File

		//this for change font size
		this.fontSize.addEventListener("change", (e) => {
			PreTextArea.style.fontSize = `${e.target.value}px`;
			sortTextArea.style.fontSize = `${e.target.value}px`;
		});

		//This for sort JSON
		this.SortKeyAsc.addEventListener("click", ()=>sortJSON());
	}
	#openFile(event) {
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
}

class sortJSONData {
	constructor() {}
	sortJSON(preJOSNData) {
		sortedJSONData = JSON.stringify(preJOSNData);
		sortTextArea.value = sortedJSONData;
	}
}

let preJOSNData;
let sortedJSONData;

//JSON के keys को अल्फाबेटिकल ऑर्डर में sort करना:
function sortJsonByKey(jsonData) {
	const sortedData = {};
	Object.keys(jsonData)
		.sort()
		.forEach((key) => {
			sortedData[key] = jsonData[key];
		});
	return sortedData;
}

//Inner Keys को भी Sort करना
function deepSortJson(jsonData) {
	const sortedData = {};
	Object.keys(jsonData)
		.sort()
		.forEach((key) => {
			if (typeof jsonData[key] === "object" && !Array.isArray(jsonData[key])) {
				sortedData[key] = deepSortJson(jsonData[key]); // Recursive call
			} else {
				sortedData[key] = jsonData[key];
			}
		});
	return sortedData;
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
