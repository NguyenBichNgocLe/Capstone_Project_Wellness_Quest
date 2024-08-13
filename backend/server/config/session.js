"use strict";

const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

//Express session middleware setup
const time = 3 * 24 * 60 * 60 * 1000;

//for storing sessions in MySQL
const sessionStore = new MySQLStore({
	host: process.env.DB_HOSTNAME,
	port: 3306,
	user: "root",
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	clearExpired: true,
	checkExpirationInterval: time,
	expiration: time,
});

//middleware that handles session info and uses store to map cookie to user info
const cookieSession = session({
	secret: process.env.ACCESS_TOKEN_SECRET,
	resave: false,
	saveUninitialized: false,
	store: sessionStore,
	cookie: {
		maxAge: time,
		sameSite: true,
		secure: process.env.NODE_ENV === "prod" ? true : false,
		sameSite: process.env.NODE_ENV === "prod" ? 'None' : false //This should be changed in a prod environment (Our current expo environment does not support https)
	},
});

module.exports = {
	sessionStore,
	cookieSession,
};
