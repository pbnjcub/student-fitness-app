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

    try {
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
    } catch (err) {
        console.error('Failed to record anthropometric data:', err);
        throw err;  // Rethrow the error to be handled further up the call stack or to trigger a transaction rollback
    }
}

// Function to update anthropometric data for a student
async function updateAnthroData(existingAnthro, anthroData, transaction) {
    // Prepare the fields to be updated
    const fieldsToUpdate = {};
    if (anthroData.height !== undefined) fieldsToUpdate.height = anthroData.height;
    if (anthroData.weight !== undefined) fieldsToUpdate.weight = anthroData.weight;
    if (anthroData.teacherUserId !== undefined) fieldsToUpdate.teacherUserId = anthroData.teacherUserId;
    if (anthroData.dateRecorded !== undefined) fieldsToUpdate.dateRecorded = anthroData.dateRecorded;

    // Perform the update
    try {
        console.log('Updating anthro data:', fieldsToUpdate);
        await existingAnthro.update(fieldsToUpdate, { transaction: transaction });
        console.log('Anthro data updated successfully');
        return existingAnthro;
    } catch (err) {
        console.error('Error updating anthro data:', err);
        throw err;
    }

}





module.exports = { 
    recordAnthroData,
    updateAnthroData
};