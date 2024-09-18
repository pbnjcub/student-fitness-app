const { Section } = require('../../../models');

const checkSectionsExistByIdWhenTransferStudents = async (req, res, next) => {
    const { fromSectionId, toSectionId } = req.body;
    console.log(`Checking if sections exist for fromSectionId: ${fromSectionId} and toSectionId: ${toSectionId}`);

    try {
        const fromSection = await Section.findByPk(fromSectionId);
        const toSection = await Section.findByPk(toSectionId);

        if (!fromSection) {
            console.log(`The origin section with ID ${fromSectionId} was not found`);
            return res.status(404).json({ error: `The origin section with ID ${fromSectionId} does not exist` });
        }

        if (!toSection) {
            console.log(`The target section with ID ${toSectionId} was not found`);
            return res.status(404).json({ error: `The target section with ID ${toSectionId} does not exist` });
        }

        req.fromSection = fromSection;
        req.toSection = toSection;
        next();
    } catch (err) {
        console.error('Error checking section existence:', err);
        next(err);
    }
};

module.exports = checkSectionsExistByIdWhenTransferStudents;
