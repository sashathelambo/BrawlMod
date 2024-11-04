let autosaveEnabled = true;
let autosaveInterval = 10000;
let backgroundColor = '#f2f2f2';
let tabColor = '#4CAF50';
let animationsEnabled = true;
let lowEndModeEnabled = false;
let itemsPerPage = 10;
let dragDropEnabled = true;
let fastFileDeleteEnabled = false;
let fastRowsDeleteEnabled = true;
let floatColumnsEnabled = true;
let enableRowDragging = true;
let enableMoreBullets = false;
let historyLimit = 100;

function toggleAutosave() {
    BrawlStarsEditor.settings.autosaveEnabled = document.getElementById('autosave-toggle').checked;
    saveData();
}

function updateAutosaveInterval() {
    BrawlStarsEditor.settings.autosaveInterval = parseInt(document.getElementById('autosave-interval').value);
    saveData();
}

function updateBackgroundColor() {
    if (!BrawlStarsEditor.settings.darkMode) {
        const color = document.getElementById('background-color-picker').value;
        document.documentElement.style.setProperty('--bg-color', color);
        BrawlStarsEditor.settings.backgroundColor = color;
        saveData();
    }
}

function updateTabColor() {
    if (!BrawlStarsEditor.settings.darkMode) {
        const color = document.getElementById('tab-color-picker').value;
        document.documentElement.style.setProperty('--primary-color', color);
        BrawlStarsEditor.settings.tabColor = color;
        saveData();
    }
}

function toggleDarkMode() {
    const isDarkMode = document.getElementById('dark-mode-toggle').checked;
    const backgroundPicker = document.getElementById('background-color-picker');
    const tabColorPicker = document.getElementById('tab-color-picker');
    
    if (!isDarkMode) {
        localStorage.setItem('lastBackgroundColor', backgroundPicker.value);
        localStorage.setItem('lastTabColor', tabColorPicker.value);
        BrawlStarsEditor.settings.lastBackgroundColor = backgroundPicker.value;
        BrawlStarsEditor.settings.lastTabColor = tabColorPicker.value;
    }
    
    BrawlStarsEditor.settings.darkMode = isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    
    requestAnimationFrame(() => {
        applyDarkModeState(isDarkMode);
        saveSettings();
    });
}

function applyDarkModeState(isDarkMode) {
    const backgroundPicker = document.getElementById('background-color-picker');
    const tabColorPicker = document.getElementById('tab-color-picker');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    if (darkModeToggle) darkModeToggle.checked = isDarkMode;
    
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    if (backgroundPicker && tabColorPicker) {
        backgroundPicker.disabled = isDarkMode;
        tabColorPicker.disabled = isDarkMode;
        backgroundPicker.parentElement.style.opacity = isDarkMode ? '0.5' : '1';
        tabColorPicker.parentElement.style.opacity = isDarkMode ? '0.5' : '1';
    }
    
    if (isDarkMode) {
        applyDarkModeColors();
    } else {
        applyLightModeColors();
    }
}

function applyDarkModeColors() {
    const root = document.documentElement;
    const darkColors = {
        '--bg-color': '#121212',
        '--text-color': '#e0e0e0',
        '--primary-color': '#66bb6a',
        '--secondary-color': '#4caf50',
        '--accent-color': '#64b5f6',
        '--border-color': '#333',
        '--card-background': '#1e1e1e',
        '--input-background': '#2d2d2d',
        '--shadow-color': 'rgba(0, 0, 0, 0.3)',
        '--hover-color': '#2d2d2d',
        '--active-color': '#333333'
    };
    
    Object.entries(darkColors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
    
    document.body.style.backgroundColor = darkColors['--bg-color'];
}

function applyLightModeColors() {
    const root = document.documentElement;
    const lightColors = {
        '--bg-color': BrawlStarsEditor.settings.lastBackgroundColor || '#f2f2f2',
        '--text-color': '#333',
        '--primary-color': BrawlStarsEditor.settings.lastTabColor || '#4CAF50',
        '--secondary-color': '#45a049',
        '--accent-color': '#2196F3',
        '--border-color': '#ddd',
        '--card-background': '#fff',
        '--input-background': '#fff',
        '--shadow-color': 'rgba(0, 0, 0, 0.1)',
        '--hover-color': '#f5f5f5',
        '--active-color': '#e0e0e0'
    };
    
    Object.entries(lightColors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
    
    document.body.style.backgroundColor = lightColors['--bg-color'];
}

function toggleAnimations() {
    animationsEnabled = document.getElementById('animations-toggle').checked;
    saveData();
}

function toggleFloatingArrows() {
    const floatingArrows = document.getElementById('floating-arrows');
    floatingArrows.style.display = document.getElementById('show-arrows-toggle').checked ? 'block' : 'none';
    saveData();
}

function toggleLowEndMode() {
    lowEndModeEnabled = document.getElementById('low-end-mode-toggle').checked;
    saveData();
}

function updateItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById('items-per-page').value);
    populateTable();
    saveData();
}

function updateHistoryLimit() {
    historyLimit = parseInt(document.getElementById('history-limit').value);
    saveData();
}

function toggleSettingsFloat() {
    const settingsPopout = document.getElementById('settings-popout');
    settingsPopout.classList.toggle('settings-float');
    saveData();
}

function toggleDragDrop() {
    dragDropEnabled = document.getElementById('drag-drop-toggle').checked;
    const dropbox = document.getElementById('dropbox');
    dropbox.style.display = dragDropEnabled ? 'block' : 'none';
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

function toggleSettings(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const settingsPopout = document.getElementById('settings-popout');
    const settingsButton = document.querySelector('.settings-button');
    
    if (settingsPopout && settingsButton) {
        const isCurrentlyOpen = settingsPopout.classList.contains('show');
        
        if (isCurrentlyOpen) {
            settingsPopout.classList.remove('show');
            settingsButton.classList.remove('active');
        } else {
            settingsPopout.classList.add('show');
            settingsButton.classList.add('active');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const settingsButton = document.querySelector('.settings-button');
    const settingsPopout = document.getElementById('settings-popout');
    
    if (settingsButton) {
        const newButton = settingsButton.cloneNode(true);
        settingsButton.parentNode.replaceChild(newButton, settingsButton);
        newButton.addEventListener('click', toggleSettings);
    }
    
    document.addEventListener('click', function(event) {
        if (!settingsPopout || !settingsButton) return;
        
        if (settingsPopout.classList.contains('show') && 
            !settingsPopout.contains(event.target) && 
            !settingsButton.contains(event.target)) {
            
            settingsPopout.classList.remove('show');
            settingsButton.classList.remove('active');
        }
    });
    
    if (settingsPopout) {
        settingsPopout.classList.remove('show');
    }
});

function toggleFullWidth() {
    const container = document.querySelector('.container');
    const tableContainer = document.querySelector('.table-container');
    const content = document.querySelector('.content');
    const fileList = document.querySelector('.file-list');
    
    if (!container) return;
    
    const isFullWidth = !container.classList.contains('full-width');
    
    container.classList.toggle('full-width');
    if (tableContainer) tableContainer.classList.toggle('full-width');
    if (content) content.classList.toggle('full-width');
    if (fileList) fileList.classList.toggle('full-width');
    
    BrawlStarsEditor.settings.fullWidthEnabled = isFullWidth;
    saveSettings();
    applySettings();
}

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const fullWidthToggle = document.getElementById('full-width-toggle');
    
    if (container && fullWidthToggle) {
        fullWidthToggle.checked = BrawlStarsEditor.settings.fullWidthEnabled;
        if (BrawlStarsEditor.settings.fullWidthEnabled) {
            container.classList.add('full-width');
        }
    }
});

function saveSettings() {
    const settings = {
        autosaveEnabled: document.getElementById('autosave-toggle').checked,
        autosaveInterval: parseInt(document.getElementById('autosave-interval').value),
        backgroundColor: document.getElementById('background-color-picker').value,
        tabColor: document.getElementById('tab-color-picker').value,
        darkMode: document.getElementById('dark-mode-toggle').checked,
        animationsEnabled: document.getElementById('animations-toggle').checked,
        showArrows: document.getElementById('show-arrows-toggle').checked,
        lowEndModeEnabled: document.getElementById('low-end-mode-toggle').checked,
        itemsPerPage: parseInt(document.getElementById('items-per-page').value),
        dragDropEnabled: document.getElementById('drag-drop-toggle').checked,
        fastFileDeleteEnabled: document.getElementById('fast-file-delete-toggle').checked,
        fastRowsDeleteEnabled: document.getElementById('fast-rows-delete-toggle').checked,
        floatColumnsEnabled: document.getElementById('float-columns-toggle').checked,
        enableRowDragging: document.getElementById('enable-row-dragging-toggle').checked,
        enableMoreBullets: document.getElementById('enable-more-bullets-toggle').checked,
        historyLimit: parseInt(document.getElementById('history-limit').value),
        fullWidthEnabled: document.getElementById('full-width-toggle').checked,
        settingsFloat: document.getElementById('settings-float-toggle').checked
    };

    Object.assign(BrawlStarsEditor.settings, settings);
    localStorage.setItem('editorSettings', JSON.stringify(BrawlStarsEditor.settings));
}

function loadSettings() {
    return new Promise((resolve) => {
        const savedSettings = localStorage.getItem('editorSettings');
        
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            Object.assign(BrawlStarsEditor.settings, settings);
        }
        
        initializeDarkMode();
        resolve();
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadSettings();
    
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', toggleDarkMode);
    }
    
    addAutoSaveToInputs();
    initializeSettingsTabs();
});

function addAutoSaveToInputs() {
    const inputs = document.querySelectorAll('.settings-content input, .settings-content select');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            saveSettings();
            applySettings();
        });
    });
}

function applySettings() {
    const settings = BrawlStarsEditor.settings;
    const container = document.querySelector('.container');
    const tableContainer = document.querySelector('.table-container');
    const content = document.querySelector('.content');
    const fileList = document.querySelector('.file-list');
    
    if (container) container.classList.toggle('full-width', settings.fullWidthEnabled);
    if (tableContainer) tableContainer.classList.toggle('full-width', settings.fullWidthEnabled);
    if (content) content.classList.toggle('full-width', settings.fullWidthEnabled);
    if (fileList) fileList.classList.toggle('full-width', settings.fullWidthEnabled);
    
    document.body.style.backgroundColor = settings.backgroundColor;
    document.body.classList.toggle('dark-mode', settings.darkMode);
    document.documentElement.classList.toggle('dark-mode', settings.darkMode);
    document.getElementById('floating-arrows').style.display = settings.showArrows ? 'flex' : 'none';
}

function startScrolling(direction) {
    const container = document.querySelector('.container');
    const scrollAmount = 100;
    const scrollInterval = 50;

    function scroll() {
        switch (direction) {
            case 'up':
                container.scrollBy(0, -scrollAmount);
                break;
            case 'down':
                container.scrollBy(0, scrollAmount);
                break;
            case 'left':
                container.scrollBy(-scrollAmount, 0);
                break;
            case 'right':
                container.scrollBy(scrollAmount, 0);
                break;
        }
    }

    scroll();
    window.scrollInterval = setInterval(scroll, scrollInterval);
}

function stopScrolling() {
    if (window.scrollInterval) {
        clearInterval(window.scrollInterval);
    }
}

function initializeSettingsTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const tab = button.dataset.tab;
            const tabContent = document.getElementById(`${tab}-tab`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
}

function initializeDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDarkMode = savedDarkMode === 'true';
    
    BrawlStarsEditor.settings.darkMode = isDarkMode;
    BrawlStarsEditor.settings.lastBackgroundColor = localStorage.getItem('lastBackgroundColor') || '#f2f2f2';
    BrawlStarsEditor.settings.lastTabColor = localStorage.getItem('lastTabColor') || '#4CAF50';
    
    const backgroundPicker = document.getElementById('background-color-picker');
    const tabColorPicker = document.getElementById('tab-color-picker');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    if (darkModeToggle) darkModeToggle.checked = isDarkMode;
    
    if (backgroundPicker && tabColorPicker) {
        backgroundPicker.disabled = isDarkMode;
        tabColorPicker.disabled = isDarkMode;
        backgroundPicker.parentElement.style.opacity = isDarkMode ? '0.5' : '1';
        tabColorPicker.parentElement.style.opacity = isDarkMode ? '0.5' : '1';
        
        backgroundPicker.value = BrawlStarsEditor.settings.lastBackgroundColor;
        tabColorPicker.value = BrawlStarsEditor.settings.lastTabColor;
    }
    
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    requestAnimationFrame(() => {
        if (isDarkMode) {
            applyDarkModeColors();
        } else {
            applyLightModeColors();
        }
    });
}
