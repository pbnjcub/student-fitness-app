const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Module extends Model { }

    Module.init({
        title: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Module title is required'
                },
                notEmpty: {
                    msg: 'Please provide a module title'
                },
                len: {
                    args: [1, 50],
                    msg: 'Module title must be between 1 and 50 characters in length'
                }
            },
        },
        moduleLevel: {
            type: DataTypes.ENUM('upper school', 'middle school', 'lower school'),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Module level is required'
                },
                notEmpty: {
                    msg: 'Please provide a module level'
                },
                isIn: {
                    args: [['upper school', 'middle school', 'lower school']],
                    msg: 'Module level must be either "upper school", "middle school", or "lower school"'
                }
            },
        },
        description: {
            type: DataTypes.STRING(250),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 250],
                    msg: 'Module description must be between 1 and 250 characters in length'
                }
            },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            validate: {
                isBoolean: {
                    msg: 'Module active status must be a boolean value'
                }
            },
        },
    }, { 
        sequelize, 
        modelName: 'Module', 
        tableName: 'modules',
        timestamps: false,
    });

    return Module;
};
