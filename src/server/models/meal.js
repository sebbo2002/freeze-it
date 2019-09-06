const MealLogic = require('../logic/meal');

module.exports = class MealModelDefinition {
    static getDefinition(DataTypes) {
        return {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM(MealLogic.getValidStatusValues()),
                allowNull: false,
                defaultValue: 'available'
            },
            servings: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            weight: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true
            },
            calories: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            cookedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false
            }
        };
    }
};