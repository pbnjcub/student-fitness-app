const { StudentAnthro, StudentHistAnthro } = require('../../../models'); // Adjust the path to your models as needed

// Function to record anthropometric data for a student
async function recordAnthroData(studentUserId, anthroData, transaction) {
    const mainAnthroData = {
        studentUserId,
        height: anthroData.height,
        weight: anthroData.weight,
        teacherUserId: anthroData.teacherUserId,
        dateRecorded: anthroData.dateRecorded || new Date(),
    };

    // Check for existing data
    const existingAnthro = await StudentAnthro.findOne({
        where: { studentUserId },
        transaction: transaction
    });

    // If existing data is found, move it to history and delete it
    if (existingAnthro) {
        await StudentHistAnthro.create({
            originalAnthroId: existingAnthro.id,
            teacherUserId: existingAnthro.teacherUserId,
            studentUserId: existingAnthro.studentUserId,
            dateRecorded: existingAnthro.dateRecorded,
            height: existingAnthro.height,
            weight: existingAnthro.weight,
        }, { transaction: transaction });

        // Delete the existing record
        await existingAnthro.destroy({ transaction: transaction });
    }

    // Create a new record regardless of whether an existing record was found
    const newAnthro = await StudentAnthro.create(mainAnthroData, { transaction: transaction });

    return newAnthro; // Return the newly created data
}



module.exports = { recordAnthroData };