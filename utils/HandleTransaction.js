const { sequelize } = require('../models'); 

const handleTransaction = async (operation) => {
    const transaction = await sequelize.transaction();
    try {
        await operation(transaction);
        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

module.exports = { handleTransaction };
