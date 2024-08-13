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
 * @typedef {{
 * 	 username: string,
 *   first_name: string,
 *   last_name: string,
 *   email: string,
 *   pass_hash: string,
 * }} User_create_t
 *
 * @typedef {User_create_t & {user_id: string, session_id: string?, xp: number}} User_t
 */

/**
 * Stores user_id, name, email, and password hash
 * User logs in with email and password
 * bcrypt is used to hash/check password
 * user_id is a UUID
 * xp is used to determine user's level
 * @type {ModelCtor<Model<User_t, User_create_t>>}
 */
const User = database.define(
	"User",
	{
		user_id: {
			type: Sequelize.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		username: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		first_name: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		last_name: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		email: {
			type: Sequelize.STRING(100),
			allowNull: false,
		},
		pass_hash: {
			type: Sequelize.STRING(100),
			allowNull: false,
		},
		session_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		xp: {
			type: DataTypes.BIGINT,
			defaultValue: 0,
			allowNull: false,
		},
	},
	{ freezeTableName: true, timestamps: false },
);

module.exports = User;
