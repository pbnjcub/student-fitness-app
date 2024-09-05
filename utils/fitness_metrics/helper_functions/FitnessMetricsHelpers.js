const { StudentAnthro, StudentHistAnthro } = require('../../../models'); 
// Function to transfer current anthropometric data to historical data
async function transferAnthroToHist(id) {
    try {
        // Check for existing data
        const existingAnthro = await StudentAnthro.findOne({
            where: { studentUserId: id }, // Use the function parameter correctly
            // transaction: transaction // Ensure this operation is part of the transaction
        });

        // If existing data is found, move it to history
        if (existingAnthro) {
            // Prepare the object to be transferred
            const newHistAnthroObj = {
                originalAnthroId: existingAnthro.id,
                teacherUserId: existingAnthro.teacherUserId,
                studentUserId: existingAnthro.studentUserId,
                dateRecorded: existingAnthro.dateRecorded,
                height: existingAnthro.height,
                weight: existingAnthro.weight,
            };

            console.log('Data to be transferred inside transferAnthroToHist:', newHistAnthroObj);
            
            // Attempt to transfer existing data to the historical table
            const newHistRecord = await StudentHistAnthro.create(newHistAnthroObj);

            console.log("Historical data transferred successfully");
            console.log("New historical record:", newHistRecord);

            // return existingAnthro;
            return existingAnthro;
        } else {
            console.log('No existing data found to transfer');
            return null; // Return null if no data is found to indicate no transfer was needed
        }
    } catch (error) {
        console.error('Error transferring data to historical record:', error);
        throw error; // Rethrow to handle it further up in the call stack or let the transaction fail
    }
}

// Function to record anthropometric data for a student
async function recordAnthroData(studentUserId, anthroData) {
    const mainAnthroData = {
        studentUserId,
        teacherUserId: anthroData.teacherUserId,
        height: anthroData.height,
        weight: anthroData.weight,
        dateRecorded: anthroData.dateRecorded || new Date(),
    };

    try {
        // Create a new record regardless of whether an existing record was found
        const newAnthro = await StudentAnthro.create(mainAnthroData);
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

async function fetchAnthropometricData(studentUserId) {
    try {
        // Fetch current anthropometric data
        const currentData = await StudentAnthro.findAll({
            where: { studentUserId },
            order: [['dateRecorded', 'DESC']]
        });

        // Fetch historical anthropometric data
        const historicalData = await StudentHistAnthro.findAll({
            where: { studentUserId },
            order: [['dateRecorded', 'DESC']]
        });

        // Combine or process data as needed
        return {
            current: currentData,
            historical: historicalData
        };
    } catch (err) {
        console.error('Error fetching anthropometric data:', err);
        throw new Error('Failed to fetch anthropometric data');
    }
}






module.exports = { 
    transferAnthroToHist,
    recordAnthroData,
    updateAnthroData,
    fetchAnthropometricData
};