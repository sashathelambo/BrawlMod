function loadCSV() {
    const input = document.getElementById('csvFileInput');
    input.value = ''; 
    input.click();
}

function loadCSVFile(event) {
    const files = event.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    const loadingContainer = document.getElementById('loading-container');
    const loadingProgress = loadingContainer.querySelector('.loading-progress');
    const loadingText = loadingContainer.querySelector('.loading-text');
    
    loadingContainer.style.display = 'block';
    loadingProgress.style.width = '0%';
    
    const worker = new Worker('js/csvWorker.js');
    
    let filesProcessed = 0;
    const totalFiles = files.length;
    const processedData = {};

    worker.onmessage = function(e) {
        const { fileName, parsedData, index } = e.data;
        processedData[fileName] = parsedData;
        filesProcessed++;
        
        const progress = (filesProcessed / totalFiles) * 100;
        loadingProgress.style.width = `${progress}%`;
        loadingText.textContent = `Processing files: ${Math.round(progress)}%`;

        if (filesProcessed === totalFiles) {
            Object.keys(processedData).forEach(fileName => {
                BrawlStarsEditor.data[fileName] = processedData[fileName];
                BrawlStarsEditor.originalData[fileName] = JSON.parse(JSON.stringify(processedData[fileName]));
                if (!BrawlStarsEditor.loadedFiles.includes(fileName)) {
                    BrawlStarsEditor.loadedFiles.push(fileName);
                }
            });

            if (!BrawlStarsEditor.currentFileName) {
                BrawlStarsEditor.currentFileName = Object.keys(processedData)[0];
            }

            requestAnimationFrame(() => {
                updateFileButtons();
                populateTable();
                loadingContainer.style.display = 'none';
                saveData();
            });
        }
    };

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            worker.postMessage({
                text: e.target.result,
                fileName: file.name,
                index: index
            });
        };
        reader.readAsText(file);
    });
}

function parseCSVEfficiently(text) {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            const lines = text.split('\n');
            const headers = lines[0].split(',');
            const dataArray = [headers];
            
            const chunkSize = 1000;
            let currentIndex = 1;

            function processChunk() {
                const endIndex = Math.min(currentIndex + chunkSize, lines.length);
                
                for (let i = currentIndex; i < endIndex; i++) {
                    const row = lines[i].split(',');
                    if (row.length === headers.length) {
                        dataArray.push(row);
                    }
                }

                currentIndex = endIndex;

                if (currentIndex < lines.length) {
                    requestAnimationFrame(processChunk);
                } else {
                    resolve(dataArray);
                }
            }

            processChunk();
        });
    });
}

function downloadCSV() {
    let csv = BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', BrawlStarsEditor.currentFileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function downloadJSON() {
    const jsonData = {
        data: BrawlStarsEditor.data,
        backgroundColor: BrawlStarsEditor.settings.backgroundColor,
        tabColor: BrawlStarsEditor.settings.tabColor,
        autosaveEnabled: BrawlStarsEditor.settings.autosaveEnabled,
        autosaveInterval: BrawlStarsEditor.settings.autosaveInterval,
        animationsEnabled: BrawlStarsEditor.settings.animationsEnabled,
        currentPosition: BrawlStarsEditor.currentFileName,
        loadedFiles: BrawlStarsEditor.loadedFiles,
        lowEndModeEnabled: BrawlStarsEditor.settings.lowEndModeEnabled,
        itemsPerPage: BrawlStarsEditor.settings.itemsPerPage,
        dragDropEnabled: BrawlStarsEditor.settings.dragDropEnabled,
        fastFileDeleteEnabled: BrawlStarsEditor.settings.fastFileDeleteEnabled,
        fastRowsDeleteEnabled: BrawlStarsEditor.settings.fastRowsDeleteEnabled,
        floatColumnsEnabled: BrawlStarsEditor.settings.floatColumnsEnabled,
        enableRowDeleting: BrawlStarsEditor.settings.enableRowDeleting,
        enableRowDragging: BrawlStarsEditor.settings.enableRowDragging,
        historyLimit: BrawlStarsEditor.settings.historyLimit,
        enableMoreBullets: BrawlStarsEditor.settings.enableMoreBullets
    };
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'data.json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function loadJSON() {
    document.getElementById('jsonFileInput').click();
}

function loadJSONFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const jsonData = JSON.parse(e.target.result);
            data = jsonData.data;
            updateSettings(jsonData);
            updateFileButtons();
            populateTable();
        };
        reader.readAsText(file);
    }
}

function createNewCSV() {
    const newName = prompt('Enter new CSV file name:');
    if (newName) {
        BrawlStarsEditor.data[newName] = [[]];
        BrawlStarsEditor.originalData[newName] = [[]];
        addFileButtons(newName);
        BrawlStarsEditor.loadedFiles.push(newName);
        BrawlStarsEditor.currentFileName = newName;
        populateTable();
        saveData();
    }
}

function renameCSVFile() {
    const oldName = BrawlStarsEditor.currentFileName;
    const newName = prompt('Enter new CSV file name:', oldName);
    if (newName && newName !== oldName) {
        BrawlStarsEditor.data[newName] = BrawlStarsEditor.data[oldName];
        delete BrawlStarsEditor.data[oldName];
        BrawlStarsEditor.loadedFiles = BrawlStarsEditor.loadedFiles.map(name => name === oldName ? newName : name);
        BrawlStarsEditor.currentFileName = newName;
        saveData();
        updateFileButtons();
    }
}

function deleteFile() {
    const menu = document.getElementById('file-context-menu');
    const fileName = menu.dataset.identifier;
    if (fastFileDeleteEnabled || confirm(`Are you sure you want to delete ${fileName}?`)) {
        promptDeleteFile(fileName);
    }
    menu.style.display = 'none';
}

function promptDeleteFile(fileName) {
    delete BrawlStarsEditor.data[fileName];
    BrawlStarsEditor.loadedFiles = BrawlStarsEditor.loadedFiles.filter(name => name !== fileName);
    if (fileName === BrawlStarsEditor.currentFileName) {
        BrawlStarsEditor.currentFileName = Object.keys(BrawlStarsEditor.data)[0] || '';
        populateTable();
    }
    saveData();
    updateFileButtons();
}

function openFile() {
    const menu = document.getElementById('file-context-menu');
    const fileName = menu.dataset.identifier;
    BrawlStarsEditor.currentFileName = fileName;
    populateTable();
    menu.style.display = 'none';
}

function openFileInNewTab() {
    const menu = document.getElementById('file-context-menu');
    const fileName = menu.dataset.identifier;
    window.open(`data:text/csv;charset=utf-8,${encodeURIComponent(BrawlStarsEditor.data[fileName].map(row => row.join(',')).join('\n'))}`, '_blank');
    menu.style.display = 'none';
}

function downloadFile() {
    const menu = document.getElementById('file-context-menu');
    const fileName = menu.dataset.identifier;
    const csv = data[fileName].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    menu.style.display = 'none';
}

function renameFile() {
    const menu = document.getElementById('file-context-menu');
    const oldName = menu.dataset.identifier;
    const newName = prompt('Enter new file name:', oldName);
    if (newName && newName !== oldName) {
        data[newName] = data[oldName];
        delete data[oldName];
        loadedFiles = loadedFiles.map(name => name === oldName ? newName : name);
        if (currentFileName === oldName) {
            currentFileName = newName;
        }
        saveData();
        updateFileButtons();
    }
    menu.style.display = 'none';
}

function initializeDropbox() {
    const dropbox = document.getElementById('dropbox');
    const trashBin = document.getElementById('trash-bin');
    
    trashBin.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.transform = 'scale(1.1)';
        this.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    });

    trashBin.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.transform = '';
        this.style.backgroundColor = '';
    });

    trashBin.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.transform = '';
        this.style.backgroundColor = '';
        
        const fileName = e.dataTransfer.getData('text/plain');
        if (fileName && BrawlStarsEditor.data[fileName]) {
            if (BrawlStarsEditor.settings.fastFileDeleteEnabled || confirm(`Are you sure you want to delete ${fileName}?`)) {
                promptDeleteFile(fileName);
            }
        }
    });

    dropbox.addEventListener('click', function(e) {
        document.getElementById('csvFileInput').click();
    });

    dropbox.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('dragover');
    });

    dropbox.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('dragover');
    });

    dropbox.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
}
