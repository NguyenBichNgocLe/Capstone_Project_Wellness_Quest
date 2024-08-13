"use strict";

const Sequelize = require("sequelize");

/** @type {import('sequelize').Sequelize} */
const database = new Sequelize(process.env.DB_NAME, "root", process.env.DB_PASSWORD, {
	host: process.env.DB_HOSTNAME,
	dialect: "mysql",
	port: process.env.DB_PORT,
	logQueryParameters: true,
});

database
	.authenticate()
	.then(() => {
		console.log("Connection established");
	})
	.catch(err => {
		console.error("Error occurred when connecting ", err);
	});

module.exports = database;
