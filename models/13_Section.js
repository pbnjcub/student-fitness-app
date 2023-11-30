const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Section extends Model { }

    Section.init({
        sectionCode: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Section code is required'
                },
                notEmpty: {
                    msg: 'Please provide a section code'
                },
                len: {
                    args: [1, 10],
                    msg: 'Section code must be between 1 and 10 characters in length'
                }
            },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            validate: {
                isBoolean: {
                    msg: 'Section active status must be a boolean value'
                }
            },
        },
    },
    { 
        sequelize, 
        modelName: 'Section', 
        tableName: 'sections',
    });

    return Section;
};
