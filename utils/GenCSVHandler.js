
const Papa = require('papaparse');

function processCsv(content, rowHandler) {
  console.log('Processing CSV');
  console.log(content)
  
    return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];

    Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      step: (row, parser) => {
        try {
          const result = rowHandler(row.data);
          if (result.error) {
            errors.push(result.error);
            parser.abort();
          } else {
            results.push(result.data);
          }
        } catch (error) {
          errors.push({ error: error.message });
          parser.abort();
        }
      },
      complete: () => {
        if (errors.length > 0) {
          reject(errors);
        } else {
          resolve(results);
        }
      }
    });
  });
}

module.exports = processCsv;
