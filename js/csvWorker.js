self.onmessage = function(e) {
    const { text, fileName, index } = e.data;
    
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const dataArray = [headers];
    
    const chunkSize = 1000;
    for (let i = 1; i < lines.length; i += chunkSize) {
        const chunk = lines.slice(i, i + chunkSize);
        chunk.forEach(line => {
            const row = line.split(',');
            if (row.length === headers.length) {
                dataArray.push(row);
            }
        });
    }

    self.postMessage({
        fileName: fileName,
        parsedData: dataArray,
        index: index
    });
}; 