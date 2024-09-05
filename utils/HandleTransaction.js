const { sequelize } = require('../models'); 

const handleTransaction = async (operation) => {
    const transaction = await sequelize.transaction();
    try {
        await operation(transaction);
        console.log('Transaction committed successfully');
        await transaction.commit();
    } catch (err) {
        console.error('Error in transaction:', err);
        await transaction.rollback();
        throw err;
    }
};

module.exports = { handleTransaction };
