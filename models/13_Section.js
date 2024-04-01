const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Section extends Model { }

    Section.init({
        sectionCode: {
            type: DataTypes.STRING(7),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Section code is required'
                },
                notEmpty: {
                    msg: 'Please provide a section code'
                },
                len: {
                    args: [7],
                    msg: 'Section code must be in the following format: "nnnn-nn" where n is a number'
                }
            },
        },
        gradeLevel: {
            type: DataTypes.ENUM('6', '7', '8', '9', '10-11-12'),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Grade level is required'
                },
                notEmpty: {
                    msg: 'Please provide a grade level'
                },
                isIn: {
                    args: [['6', '7', '8', '9', '10-11-12']],
                    msg: 'Grade level must be either "6", "7", "8", "9", or "10-11-12"'
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
