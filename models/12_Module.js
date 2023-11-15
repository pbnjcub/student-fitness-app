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
        description: {
            type: DataTypes.STRING(250),
            allowNull: true,
            validate: {
                len: {
                    args: [1, 250],
                    msg: 'Module description must be between 1 and 250 characters in length'
                }
            },
        },
    }, { 
        sequelize, 
        modelName: 'Module', 
        tableName: 'modules',
    });

    return Module;
};
