const { User, SectionRoster } = require('../../../models');
const processCsv = require('../../csv_handling/GenCSVHandler');
console.log(processCsv);
const { rosterToSectionRowHandler } = require('./RosterSectionByCsv');

async function processRosterCsv(content, sectionId) {
    const newStudents = await processCsv(content, async (row, rowNumber) => {
        return await rosterToSectionRowHandler(row, rowNumber, sectionId);
    });
    return newStudents;
}

module.exports = {
    processRosterCsv
};