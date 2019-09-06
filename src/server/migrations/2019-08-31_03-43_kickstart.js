'use strict';

module.exports = {
    async up (q, models, sequelize, DataTypes) {
        await q.dropAllTables();

        // users
        await q.createTable('users', {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: false
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE
            }
        }, {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        });


        // meal
        const MealLogic = require('../logic/meal');
        await q.createTable('meals', {
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
        }, {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        });
    },
    async down (q) {
        await q.dropAllTables();
    }
};
