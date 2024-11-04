window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, '\nURL:', url, '\nLine:', lineNo, '\nColumn:', columnNo, '\nError object:', error);
    return false;
};

window.BrawlStarsEditor = {
    data: {},
    currentFileName: '',
    loadedFiles: [],
    undoStack: [],
    redoStack: [],
    originalData: {},
    projectileData: {},
    settings: {
        autosaveEnabled: true,
        autosaveInterval: 10000,
        backgroundColor: '#121212',
        tabColor: '#66bb6a',
        animationsEnabled: true,
        lowEndModeEnabled: false,
        itemsPerPage: 10,
        dragDropEnabled: true,
        fastFileDeleteEnabled: false,
        fastRowsDeleteEnabled: true,
        floatColumnsEnabled: true,
        enableRowDragging: true,
        enableMoreBullets: false,
        historyLimit: 100,
        darkMode: true,
        enableRowDeleting: false,
        fullWidthEnabled: false,
        showArrows: false
    },
    deleteModeEnabled: false
};

function applySettings() {
    applyDarkMode();
    applyFloatingArrows();
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const loading = showLoading('Loading application...');
        let progress = 0;
        
        const tasks = [
            async () => {
                const savedData = localStorage.getItem('editorData');
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    BrawlStarsEditor.data = parsed.data || {};
                    BrawlStarsEditor.currentFileName = parsed.currentFileName || '';
                    BrawlStarsEditor.loadedFiles = parsed.loadedFiles || [];
                    BrawlStarsEditor.undoStack = parsed.undoStack || [];
                    BrawlStarsEditor.redoStack = parsed.redoStack || [];
                    if (parsed.settings) {
                        Object.assign(BrawlStarsEditor.settings, parsed.settings);
                    }
                }
                progress += 30;
                loading.updateProgress(progress);
            },
            async () => {
                await loadSettings();
                progress += 20;
                loading.updateProgress(progress);
            },
            async () => {
                initializeEventListeners();
                progress += 10;
                loading.updateProgress(progress);
            },
            async () => {
                initializeSettingsTabs();
                progress += 10;
                loading.updateProgress(progress);
            },
            async () => {
                initializeDropbox();
                progress += 10;
                loading.updateProgress(progress);
            },
            async () => {
                if (BrawlStarsEditor.currentFileName) {
                    populateTable();
                    updateFileButtons();
                }
                progress += 10;
                loading.updateProgress(progress);
            },
            async () => {
                autosave();
                applySettings();
                updateUndoRedoButtons();
                if (BrawlStarsEditor.undoStack.length === 0) {
                    saveState();
                }
                progress = 100;
                loading.updateProgress(progress);
            }
        ];
        
        for (const task of tasks) {
            await task();
        }
        
        loading.finish();
        
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('There was an error loading the application. Please refresh the page.');
    }
});

function initializeEventListeners() {
    const elements = [
        { id: 'autosave-toggle', event: 'change', handler: toggleAutosave },
        { id: 'autosave-interval', event: 'change', handler: updateAutosaveInterval },
        { id: 'background-color-picker', event: 'input', handler: updateBackgroundColor },
        { id: 'tab-color-picker', event: 'input', handler: updateTabColor },
        { id: 'dark-mode-toggle', event: 'change', handler: toggleDarkMode },
        { id: 'animations-toggle', event: 'change', handler: toggleAnimations },
        { id: 'show-arrows-toggle', event: 'change', handler: toggleFloatingArrows },
        { id: 'low-end-mode-toggle', event: 'change', handler: toggleLowEndMode },
        { id: 'items-per-page', event: 'input', handler: updateItemsPerPage },
        { id: 'history-limit', event: 'input', handler: updateHistoryLimit },
        { id: 'settings-float-toggle', event: 'change', handler: toggleSettingsFloat },
        { id: 'drag-drop-toggle', event: 'change', handler: toggleDragDrop },
        { id: 'fullscreen-toggle', event: 'change', handler: toggleFullscreen },
        { id: 'fast-file-delete-toggle', event: 'change', handler: toggleFastFileDelete },
        { id: 'fast-rows-delete-toggle', event: 'change', handler: toggleFastRowsDelete },
        { id: 'float-columns-toggle', event: 'change', handler: toggleFloatColumns },
        { id: 'enable-row-dragging-toggle', event: 'change', handler: toggleRowDragging },
        { id: 'enable-more-bullets-toggle', event: 'change', handler: toggleMoreBullets },
        { id: 'enable-row-deleting-toggle', event: 'change', handler: toggleRowDeleting }
    ];

    elements.forEach(element => {
        const el = document.getElementById(element.id);
        if (el) {
            el.addEventListener(element.event, element.handler);
        }
    });
}

async function handleFileLoad(file) {
    await handleFirstTimeOperation('file_load');
    // Rest of the file loading logic
}

async function populateTable() {
    if (!BrawlStarsEditor.initialized) {
        await handleFirstTimeOperation('table_init');
        BrawlStarsEditor.initialized = true;
    }
    // Rest of the table population logic
}

async function selectFile(fileName) {
    await handleFirstTimeOperation('file_select');
    // Rest of the file selection logic
}

function updateFileButtons() {
    const fileButtons = document.getElementById('file-buttons');
    if (fileButtons) {
        fileButtons.innerHTML = `
            <div class="trash-bin" id="trash-bin" onclick="toggleDeleteMode()">🗑️</div>
            <div class="file-list"></div>
        `;
        const fileList = fileButtons.querySelector('.file-list');
        if (fileList) {
            BrawlStarsEditor.loadedFiles.forEach(fileName => addFileButtons(fileName, fileList));
        }
    }
}

function addFileButtons(fileName, fileList) {
    const button = document.createElement('button');
    button.textContent = fileName;
    button.classList.add('file-button');
    button.draggable = true;
    button.ondragstart = function (e) {
        e.dataTransfer.setData('text/plain', fileName);
    };
    button.oncontextmenu = function(e) {
        e.preventDefault();
        showContextMenu(e, 'file-context-menu', fileName);
    };
    button.onclick = function() {
        if (BrawlStarsEditor.deleteModeEnabled) {
            if (BrawlStarsEditor.settings.fastFileDeleteEnabled || confirm(`Are you sure you want to delete ${fileName}?`)) {
                promptDeleteFile(fileName);
            }
        } else {
            BrawlStarsEditor.currentFileName = fileName;
            populateTable();
        }
    };
    fileList.appendChild(button);
}

function applyDarkMode() {
    const isDarkMode = BrawlStarsEditor.settings.darkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    document.body.style.backgroundColor = isDarkMode ? '#121212' : '#f2f2f2';
    const elements = document.querySelectorAll('.button, .search-container input, .search-container select, .dropbox, table, th, td');
    elements.forEach(el => el.classList.toggle('dark-mode', isDarkMode));
}

function applyFloatingArrows() {
    const floatingArrows = document.getElementById('floating-arrows');
    if (floatingArrows) {
        floatingArrows.style.display = BrawlStarsEditor.settings.showArrows ? 'flex' : 'none';
    }
}

function toggleAutosave() {
    BrawlStarsEditor.settings.autosaveEnabled = document.getElementById('autosave-toggle').checked;
    saveData();
}

function updateAutosaveInterval() {
    BrawlStarsEditor.settings.autosaveInterval = parseInt(document.getElementById('autosave-interval').value);
    saveData();
}

function updateBackgroundColor() {
    BrawlStarsEditor.settings.backgroundColor = document.getElementById('background-color-picker').value;
    document.body.style.backgroundColor = BrawlStarsEditor.settings.backgroundColor;
    saveData();
}

function updateTabColor() {
    BrawlStarsEditor.settings.tabColor = document.getElementById('tab-color-picker').value;
    document.querySelectorAll('th').forEach(th => {
        th.style.backgroundColor = BrawlStarsEditor.settings.tabColor;
    });
    saveData();
}

function toggleDarkMode() {
    BrawlStarsEditor.settings.darkMode = document.getElementById('dark-mode-toggle').checked;
    applyDarkMode();
    saveData();
}

function toggleAnimations() {
    BrawlStarsEditor.settings.animationsEnabled = document.getElementById('animations-toggle').checked;
    saveData();
}

function toggleFloatingArrows() {
    BrawlStarsEditor.settings.showArrows = document.getElementById('show-arrows-toggle').checked;
    applyFloatingArrows();
    saveData();
}

function toggleLowEndMode() {
    BrawlStarsEditor.settings.lowEndModeEnabled = document.getElementById('low-end-mode-toggle').checked;
    saveData();
}

function updateItemsPerPage() {
    BrawlStarsEditor.settings.itemsPerPage = parseInt(document.getElementById('items-per-page').value);
    populateTable();
    saveData();
}

function updateHistoryLimit() {
    BrawlStarsEditor.settings.historyLimit = parseInt(document.getElementById('history-limit').value);
    saveData();
}

function toggleSettingsFloat() {
    BrawlStarsEditor.settings.settingsFloat = document.getElementById('settings-float-toggle').checked;
    saveData();
}

function toggleDragDrop() {
    BrawlStarsEditor.settings.dragDropEnabled = document.getElementById('drag-drop-toggle').checked;
    const dropbox = document.getElementById('dropbox');
    dropbox.style.display = BrawlStarsEditor.settings.dragDropEnabled ? 'block' : 'none';
    saveData();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
    saveData();
}

function toggleFastFileDelete() {
    BrawlStarsEditor.settings.fastFileDeleteEnabled = document.getElementById('fast-file-delete-toggle').checked;
    saveData();
}

function toggleFastRowsDelete() {
    BrawlStarsEditor.settings.fastRowsDeleteEnabled = document.getElementById('fast-rows-delete-toggle').checked;
    saveData();
}

function toggleFloatColumns() {
    BrawlStarsEditor.settings.floatColumnsEnabled = document.getElementById('float-columns-toggle').checked;
    saveData();
}

function toggleRowDragging() {
    BrawlStarsEditor.settings.enableRowDragging = document.getElementById('enable-row-dragging-toggle').checked;
    saveData();
}

function toggleMoreBullets() {
    BrawlStarsEditor.settings.enableMoreBullets = document.getElementById('enable-more-bullets-toggle').checked;
    saveData();
}

function toggleRowDeleting() {
    BrawlStarsEditor.settings.enableRowDeleting = document.getElementById('enable-row-deleting-toggle').checked;
    saveData();
}
