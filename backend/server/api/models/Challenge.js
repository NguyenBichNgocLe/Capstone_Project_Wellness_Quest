"use strict";

const { Sequelize } = require("sequelize");
const database = require("../../config/database");

/**
 * @template M
 * @typedef {import('sequelize').ModelStatic<M>} ModelCtor
 */

/**
 * @template TModelAttributes, TCreationAttributes
 * @typedef {import('sequelize').Model<TModelAttributes, TCreationAttributes>} Model
 */

/**
 * @typedef {{
 *  challenge_name: string,
 *  challenge_desc: string,
 *  challenge_goal: number,
 * 	challenge_xp: number,
 *	challenge_type: "walking" | "step"
 * }} Challenge_create_t
 *
 * @typedef {Challenge_create_t & {challenge_id: number } } Challenge_t
 */

/**
 * Challenges are what uses complete for XP, challenges can be things like walking a certain distance or taking a certain number of steps
 * @type {ModelCtor<Model<Challenge_t, Challenge_create_t>>}
 */
const Challenge = database.define(
	"Challenge",
	{
		challenge_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		challenge_name: {
			type: Sequelize.STRING(250),
			allowNull: false,
		},
		challenge_desc: {
			type: Sequelize.STRING(250),
			allowNull: false,
		},
		challenge_type: {
			type: Sequelize.ENUM("walking", "step"),
			allowNull: false,
		},
		challenge_goal: {
			//meters or step
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		challenge_xp: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
	},
	{ freezeTableName: true, timestamps: false },
);

module.exports = Challenge;
