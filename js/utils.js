function saveState() {
    if (BrawlStarsEditor.undoStack.length >= BrawlStarsEditor.settings.historyLimit) {
        BrawlStarsEditor.undoStack.shift();
    }
    
    const currentState = {
        type: 'text',
        changes: collectTextChanges(),
        timestamp: Date.now()
    };
    
    BrawlStarsEditor.undoStack.push(currentState);
    BrawlStarsEditor.redoStack = [];
    
    updateUndoRedoButtons();
    saveData();
}

function collectTextChanges() {
    const changes = [];
    const table = document.getElementById('table-body');
    if (!table) return changes;
    
    table.querySelectorAll('td').forEach(cell => {
        const input = cell.querySelector('input, select');
        if (input && input.value !== input.defaultValue) {
            changes.push({
                row: cell.parentElement.dataset.row,
                col: cell.dataset.col,
                value: input.value,
                oldValue: input.defaultValue
            });
        }
    });
    
    return changes;
}

function undo() {
    if (BrawlStarsEditor.undoStack.length > 1) {
        const currentState = BrawlStarsEditor.undoStack.pop();
        BrawlStarsEditor.redoStack.push(currentState);
        
        if (currentState.type === 'text') {
            applyTextChanges(currentState.changes, true);
        } else {
            const previousState = BrawlStarsEditor.undoStack[BrawlStarsEditor.undoStack.length - 1];
            BrawlStarsEditor.data = JSON.parse(JSON.stringify(previousState.data));
            BrawlStarsEditor.currentFileName = previousState.currentFileName;
            populateTable();
        }
        
        updateUndoRedoButtons();
        saveData();
    }
}

function redo() {
    if (BrawlStarsEditor.redoStack.length > 0) {
        const nextState = BrawlStarsEditor.redoStack.pop();
        BrawlStarsEditor.undoStack.push(nextState);
        
        if (nextState.type === 'text') {
            applyTextChanges(nextState.changes, false);
        } else {
            BrawlStarsEditor.data = JSON.parse(JSON.stringify(nextState.data));
            BrawlStarsEditor.currentFileName = nextState.currentFileName;
            populateTable();
        }
        
        updateUndoRedoButtons();
        saveData();
    }
}

function applyTextChanges(changes, isUndo) {
    const table = document.getElementById('table-body');
    if (!table) return;
    
    changes.forEach(change => {
        const cell = table.querySelector(`tr[data-row="${change.row}"] td[data-col="${change.col}"]`);
        if (cell) {
            const input = cell.querySelector('input, select');
            if (input) {
                if (isUndo) {
                    input.value = change.oldValue;
                    input.defaultValue = change.oldValue;
                    updateDataFromInput(input, change.row, change.col);
                } else {
                    input.value = change.value;
                    input.defaultValue = change.value;
                    updateDataFromInput(input, change.row, change.col);
                }
            }
        }
    });
}

function updateDataFromInput(input, row, col) {
    if (BrawlStarsEditor.data[BrawlStarsEditor.currentFileName]) {
        BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][row][col] = input.value;
    }
}

function updateUndoRedoButtons() {
    const undoButton = document.querySelector('button[onclick="undo()"]');
    const redoButton = document.querySelector('button[onclick="redo()"]');
    
    if (undoButton) {
        undoButton.disabled = BrawlStarsEditor.undoStack.length <= 1;
        undoButton.style.opacity = BrawlStarsEditor.undoStack.length <= 1 ? '0.5' : '1';
    }
    
    if (redoButton) {
        redoButton.disabled = BrawlStarsEditor.redoStack.length === 0;
        redoButton.style.opacity = BrawlStarsEditor.redoStack.length === 0 ? '0.5' : '1';
    }
}

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z') {
            event.preventDefault();
            if (event.shiftKey) {
                redo();
            } else {
                undo();
            }
        } else if (event.key === 'y') {
            event.preventDefault();
            redo();
        }
    }
});

function saveData() {
    if (BrawlStarsEditor.settings.autosaveEnabled) {
        const dataToSave = {
            data: BrawlStarsEditor.data,
            currentFileName: BrawlStarsEditor.currentFileName,
            loadedFiles: BrawlStarsEditor.loadedFiles,
            settings: BrawlStarsEditor.settings,
            undoStack: BrawlStarsEditor.undoStack,
            redoStack: BrawlStarsEditor.redoStack,
            timestamp: Date.now(),
            initialized: true
        };
        
        try {
            localStorage.setItem('editorData', JSON.stringify(dataToSave));
            console.log('Data autosaved:', new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
}

function autosave() {
    if (BrawlStarsEditor.settings.autosaveEnabled) {
        saveData();
        setTimeout(autosave, BrawlStarsEditor.settings.autosaveInterval);
    }
}

function showLoading(message = 'Loading...') {
    const loadingContainer = document.getElementById('loading-container');
    const loadingText = loadingContainer.querySelector('.loading-text');
    const loadingProgress = loadingContainer.querySelector('.loading-progress');
    
    loadingContainer.style.display = 'block';
    loadingText.textContent = message;
    loadingProgress.style.width = '0%';
    
    return {
        updateProgress: (progress) => {
            loadingProgress.style.width = `${progress}%`;
            loadingText.textContent = `${message} ${Math.round(progress)}%`;
        },
        finish: () => {
            loadingProgress.style.width = '100%';
            setTimeout(() => {
                loadingContainer.style.display = 'none';
                loadingProgress.style.width = '0%';
            }, 500);
        }
    };
}

async function loadWithProgress(tasks, message) {
    const loading = showLoading(message);
    const totalTasks = tasks.length;
    let completed = 0;
    
    for (const task of tasks) {
        await task();
        completed++;
        loading.updateProgress((completed / totalTasks) * 100);
    }
    
    loading.finish();
}

async function handleFirstTimeOperation(operation) {
    const key = `first_${operation}`;
    if (!localStorage.getItem(key)) {
        const loading = showLoading('Initializing...');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += 5;
            loading.updateProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                loading.finish();
                localStorage.setItem(key, 'true');
            }
        }, 50);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
