const { Section } = require('../../../models');

const checkSectionsExistAndActive = async (req, res, next) => {
    const { fromSectionId, toSectionId } = req.body;
    console.log(`Checking fromSectionId: ${fromSectionId} and toSectionId: ${toSectionId}`);

    try {
        console.log(`Checking fromSectionId: ${fromSectionId} and toSectionId: ${toSectionId}`);

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

        if (!toSection.isActive) {
            console.log(`The target section with ID ${toSectionId} is not active`);
            return res.status(400).json({ error: `The target section with ID ${toSectionId} is not active` });
        }

        req.fromSection = fromSection;
        req.toSection = toSection;
        next();
    } catch (err) {
        console.error('Error checking sections:', err);
        next(err); // Pass the error to your error handler
    }
};

module.exports = checkSectionsExistAndActive;
