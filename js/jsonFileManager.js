const fontSize =document.getElementById('FontSize');
const openBtn = document.getElementById("openFile");
const ShortBtn = document.getElementById("Short");
const PreTextArea= document.getElementById('FilePreview');
const ShortTextArea= document.getElementById('ShortdJSON');

let preJOSNData;
let ShortedJSONData;
fontSize.addEventListener('change', e=>{
    PreTextArea.style.fontSize = `${e.target.value}px`;
    ShortTextArea.style.fontSize = `${e.target.value}px`
});

openBtn.addEventListener("change",openFile);
ShortBtn.addEventListener('click', ShortJSON);
function ShortJSON(){
    ShortedJSONData =JSON.stringify(preJOSNData);
    ShortTextArea.value = ShortedJSONData;
}
//JSON के keys को अल्फाबेटिकल ऑर्डर में sort करना:
function sortJsonByKey(jsonData) {
const sortedData = {};
Object.keys(jsonData).sort().forEach(key => {
    sortedData[key] = jsonData[key];
});
return sortedData;
}

//Inner Keys को भी Sort करना
function deepSortJson(jsonData) {
const sortedData = {};
Object.keys(jsonData).sort().forEach(key => {
    if (typeof jsonData[key] === 'object' && !Array.isArray(jsonData[key])) {
        sortedData[key] = deepSortJson(jsonData[key]);  // Recursive call
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

function openFile(event){
    const file = event.target.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = function(e) {
                preJOSNData = e.target.result;
                PreTextArea.value = preJOSNData;
            };
            reader.readAsText(file);
        } else {
            alert("Please select a valid JSON file.");
        }
}
