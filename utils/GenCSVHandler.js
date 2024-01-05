
const Papa = require('papaparse');

function processCsv(content, rowHandler) {
  
    return new Promise((resolve, reject) => {
    const results = [];
    const allErrors = [];

    Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      step: (row, parser) => {
        const result = rowHandler(row.data);
        if (result.error) {
          allErrors.push(result.error);
          // parser.abort();
        } else {
          results.push(result.data);
        }
      },
      complete: () => {
        if (allErrors.length > 0) {
          console.log('errors within GenCSVHandler:', allErrors)
          reject(allErrors);
        } else {
          console.log('results within GenCSVHandler:', results)

          resolve(results);
        }
      }
    });
  });
}

module.exports = processCsv;
