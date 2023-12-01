const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class SectionEnrollment extends Model { }

    SectionEnrollment.init({
        moduleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'modules',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        sectionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sections',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        enrollmentBeginDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            validate: {
                isDate: true,
                isValidDate(value) {
                    if (this.enrollmentEndDate && value > this.enrollmentEndDate) {
                        throw new Error('Enrollment begin date must be before enrollment end date.');
                    }
                }
            }
        },
        enrollmentEndDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            validate: {
                isDate: true,
                isValidDate(value) {
                    if (this.enrollmentBeginDate && value < this.enrollmentBeginDate) {
                        throw new Error('Enrollment end date must be after enrollment begin date.');
                    }
                }
            }
        },
    }, { 
        sequelize, 
        modelName: 'SectionEnrollment', 
        tableName: 'section_enrollments',
    });

    return SectionEnrollment;
};
