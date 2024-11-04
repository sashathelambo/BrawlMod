function populateTable() {
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');

    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    if (BrawlStarsEditor.data[BrawlStarsEditor.currentFileName] && BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].length > 0) {
        const headers = BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][0];
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHeader.appendChild(th);
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;
            document.getElementById('search-options').appendChild(option);
        });

        const booleanColumns = detectBooleanColumns();

        for (let rowIndex = 1; rowIndex < BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].length; rowIndex++) {
            const row = BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][rowIndex];
            const tr = document.createElement('tr');
            tr.dataset.row = rowIndex;
            tr.onclick = function() {
                if (BrawlStarsEditor.settings.enableRowDeleting) {
                    deleteRowAt(rowIndex);
                }
            };
            row.forEach((cell, cellIndex) => {
                const td = document.createElement('td');
                td.dataset.col = cellIndex;
                if (booleanColumns.has(cellIndex)) {
                    td.innerHTML = cell === '' ? 
                        `<select onchange="saveState(); saveData();">
                            <option value="" ${cell === '' ? 'selected' : ''}></option>
                            <option value="true" ${cell === 'true' ? 'selected' : ''}>true</option>
                            <option value="false" ${cell === 'false' ? 'selected' : ''}>false</option>
                        </select>` :
                        `<input type="text" value="${cell}" readonly>`;
                } else {
                    td.innerHTML = `<input type="text" value="${cell}" onchange="saveState(); saveData();">`;
                }
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        }
    }
}

function detectBooleanColumns() {
    const booleanColumns = new Set();
    if (BrawlStarsEditor.data[BrawlStarsEditor.currentFileName] && BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].length > 0) {
        for (let colIndex = 0; colIndex < BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][0].length; colIndex++) {
            for (let rowIndex = 1; rowIndex < BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].length; rowIndex++) {
                const cell = BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][rowIndex][colIndex].toLowerCase();
                if (cell === 'true' || cell === 'false') {
                    booleanColumns.add(colIndex);
                    break;
                }
            }
        }
    }
    return booleanColumns;
}

function deleteRowAt(rowIndex) {
    BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].splice(rowIndex, 1);
    populateTable();
    saveData();
}

function searchTable() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const searchOption = document.getElementById('search-options').value;
    const rows = document.querySelectorAll('table tbody tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let rowContainsSearchText = false;

        cells.forEach(cell => {
            const cellText = cell.querySelector('input, select') ? cell.querySelector('input, select').value.toLowerCase() : cell.innerText.toLowerCase();

            if (searchOption === 'all' && cellText.includes(searchInput)) {
                rowContainsSearchText = true;
            } else if (cell.dataset.col == searchOption && cellText.includes(searchInput)) {
                rowContainsSearchText = true;
            }
        });

        if (rowContainsSearchText) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function addNewRow() {
    if (BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].length > 0) {
        const newRow = new Array(BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][0].length).fill('');
        BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].push(newRow);
        populateTable();
        saveData();
    } else {
        alert('No columns available. Please add a column first.');
    }
}

function addNewColumn() {
    const columnName = prompt('Enter new column name:');
    if (columnName) {
        BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][0].push(columnName);
        for (let i = 1; i < BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].length; i++) {
            BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][i].push('');
        }
        populateTable();
        saveData();
    }
}

function changeAll() {
    const column = prompt('Enter the column name:');
    const newValue = prompt('Enter the new value:');
    if (column && newValue !== null) {
        const headers = BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][0];
        const colIndex = headers.indexOf(column);
        if (colIndex !== -1) {
            for (let i = 1; i < BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].length; i++) {
                BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][i][colIndex] = newValue;
            }
            populateTable();
            saveData();
        } else {
            alert('Column not found');
        }
    }
}

function resetValues() {
    if (BrawlStarsEditor.originalData[BrawlStarsEditor.currentFileName]) {
        BrawlStarsEditor.data[BrawlStarsEditor.currentFileName] = JSON.parse(JSON.stringify(BrawlStarsEditor.originalData[BrawlStarsEditor.currentFileName]));
        populateTable();
        saveData();
    }
}
