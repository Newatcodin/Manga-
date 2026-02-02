let library = {};   // {seriesName: [files]}
let currentSeries = "";
let pages = [];
let currentPage = 0;

const fileInput = document.getElementById("file-input");
const pageContainer = document.getElementById("page-container");
const nextBtn = document.getElementById("next-page");
const prevBtn = document.getElementById("prev-page");
const seriesSelector = document.getElementById("series-selector");
const seriesList = document.getElementById("series-list");
const reader = document.getElementById("reader");

// Drag & Drop Support
seriesSelector.addEventListener("dragover", e => {
  e.preventDefault();
  seriesSelector.classList.add("dragover");
});
seriesSelector.addEventListener("dragleave", () => seriesSelector.classList.remove("dragover"));
seriesSelector.addEventListener("drop", e => {
  e.preventDefault();
  seriesSelector.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});

// File input support
fileInput.addEventListener("change", () => handleFiles(fileInput.files));

// Handle file upload
function handleFiles(fileList) {
  library = {};

  Array.from(fileList)
    .filter(f => f.type.startsWith("image/"))
    .forEach(file => {
      const pathParts = file.webkitRelativePath.split("/");
      const seriesName = pathParts[0] || "Unknown";
      if(!library[seriesName]) library[seriesName] = [];
      library[seriesName].push(file);
    });

  for(let series in library){
    library[series].sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric:true}));
  }

  seriesList.innerHTML = "";
  Object.keys(library).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    seriesList.appendChild(option);
  });

  seriesList.style.display = "inline-block";
  reader.style.display = "block";

  const lastSeries = localStorage.getItem("lastSeries");
  currentSeries = lastSeries && library[lastSeries] ? lastSeries : seriesList.value;
  seriesList.value = currentSeries;

  pages = library[currentSeries];
  const lastPage = parseInt(localStorage.getItem(`lastPage_${currentSeries}`));
  currentPage = (!isNaN(lastPage) && lastPage < pages.length) ? lastPage : 0;

  showPage();
}

// Series switch
seriesList.addEventListener("change", () => {
  currentSeries = seriesList.value;
  pages = library[currentSeries];
  const lastPage = parseInt(localStorage.getItem(`lastPage_${currentSeries}`));
  currentPage = (!isNaN(lastPage) && lastPage < pages.length) ? lastPage : 0;
  localStorage.setItem("lastSeries", currentSeries);
  showPage();
});

// Show page
function showPage() {
  pageContainer.innerHTML = "";
  if(pages.length === 0) return;

  const readerFile = new FileReader();
  readerFile.onload = e => {
    const img = document.createElement("img");
    img.src = e.target.result;
    pageContainer.appendChild(img);
  };
  readerFile.readAsDataURL(pages[currentPage]);

  localStorage.setItem(`lastPage_${currentSeries}`, currentPage);
  localStorage.setItem("lastSeries", currentSeries);
}

// Next/Prev buttons
nextBtn.addEventListener("click", () => {
  if(currentPage < pages.length - 1){
    currentPage++;
    showPage();
  }
});
prevBtn.addEventListener("click", () => {
  if(currentPage > 0){
    currentPage--;
    showPage();
  }
});