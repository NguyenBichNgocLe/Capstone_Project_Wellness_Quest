"use strict";

const { Sequelize, DataTypes } = require("sequelize");
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
 * @typedef {{challenge_status: "not started" | "started" | "finished", challenge_progress: number, user_id: string, challenge_id: number}} UserChallenge_Join_t
 */

/**
 * Denotes user's challenge instance
 * @type {ModelCtor<Model<UserChallenge_Join_t, UserChallenge_Join_t>>}
 */
const UserChallenge_Join = database.define(
	"UserChallenge_Join",
	{
		challenge_status: {
			type: DataTypes.ENUM("not started", "started", "finished"),
			defaultValue: "not started",
			allowNull: false,
		},
		challenge_progress: {
			type: Sequelize.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	},
	{ freezeTableName: true },
);

module.exports = UserChallenge_Join;
