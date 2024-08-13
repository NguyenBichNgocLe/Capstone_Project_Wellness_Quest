"use strict";

const util = require("util");
const User = require("../models/User");
const { sessionStore } = require("../../config/session");

const Email = require("email-validator");
const bcrypt = require("bcryptjs");

const express = require("express");
const { Op } = require("sequelize");
const userRouter = express.Router();
userRouter.use(express.json());

//Returns info about the user
userRouter.get("/info", async (req, res, next) => {
	try {
		const { username, email, first_name, last_name, user_id } = req.session;
		if (!user_id)
			return res.status(200).send({
				logged_in: false,
			});

		const { xp } = await User.findOne({
			where: { user_id },
		});

		const xpStuff = xpParser(xp);

		return res.status(200).send({
			username,
			email,
			first_name,
			last_name,
			...xpStuff,
			logged_in: !!username,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send({ error: "Error fetching user information" });
	}
});

//Takes in user information for account creation
userRouter.post("/register", async (req, res, next) => {
	try {
		//Regex for password checking (Modified form of regexr.com/3bfsi)
		const regex = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/g);

		// Check if user is already logged in
		if (isLoggedIn(req.session)) return res.status(406).send({ error: "User is already logged in" });

		const { username, email, password, first_name, last_name } = req.body;

		// Check all information is provided and valid

		if (!username) return res.status(400).send({ error: "Username not provided" });

		if (!email) return res.status(400).send({ error: "Email not provided" });

		if (!Email.validate(email)) return res.status(400).send({ error: "Not a valid email address" });

		if (!password) return res.status(400).send({ error: "Password not provided" });

		if (!regex.test(password)) {
			return res.status(400).send({ error: "Password needs at 8 characters with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character"});
		}

		if (!first_name) return res.status(400).send({ error: "First name not provided" });

		if (!last_name) return res.status(400).send({ error: "Last name not provided" });

		//Check if user is already in DB
		const user = await User.findOne({
			where: {
				[Op.or]: [{ email }, { username }],
			},
		});

		if (user) return res.status(409).send({ error: "User already exists" });

		//Hash password
		const pass_hash = await bcrypt.hash(password, 10);

		//Create user and create user session
		const session_id = req.session.id;
		const newUser = await User.create({
			username,
			first_name,
			last_name,
			email,
			pass_hash,
			session_id,
		});

		//req = createSession(req, newUser);
		//await util.promisify(req.session.save).bind(req.session)(); //prevent race condition

		return res.status(200).send({ response: `User ${username} created` });
	} catch (error) {
		console.error(error);
		return res.status(500).send({ error: "Error registering user" });
	}
});

//Login route for all existing users
userRouter.post("/login", async (req, res, next) => {
	try {
		const { email, password } = req.body;

		// Find user by email in db
		const user = await User.findOne({ where: { email } });
		if (!user) return res.status(404).send({ error: "User not found" });

		// Validate User
		const valid = await bcrypt.compare(password, user.pass_hash);
		if (!valid) return res.status(401).send({ error: "Incorrect password" });

		// Handle session
		await deleteOldSession(req.session.id, user);
		req = createSession(req, user);
		//forcing this to resolve fully before continuing because of race conditions
		await util.promisify(req.session.save).bind(req.session)();

		return res.status(200).send({ text: "User logged in" });
	} catch (error) {
		console.error(error);
		return res.status(500).send({ error: "Error logging in user" });
	}
});

//Logout user and destroy current user session
userRouter.post("/logout", async (req, res, next) => {
	try {
		if (!isLoggedIn(req.session)) return res.status(200).send({ error: "User not logged in, cannot logout" });

		res.clearCookie("connect.sid"); //connect.sid is default session cookie name.
		//forcing this to resolve fully before continuing because of race conditions
		await util.promisify(req.session.destroy).bind(req.session)();

		return res.status(200).send("User logged out");
	} catch (error) {
		console.error(error);
		return res.status(500).send({ error: "Error logging out user" });
	}
});

//Deletes the currently logged-in user's profile
userRouter.delete("/delete", async (req, res, next) => {
	if (process.env.DB_HOSTNAME !== "localhost") return res.sendStatus(405);
	try {
		if (!isLoggedIn(req.session)) return res.sendStatus(401);

		const { user_id } = req.session;
		User.destroy({ where: { user_id } });
		await util.promisify(req.session.destroy).bind(req.session)();
		return res.sendStatus(204);
	} catch (error) {
		console.error(error);
		return res.status(500).send({ error: "Error deleting user" });
	}
});

//Returns whether the user is logged in or not
function isLoggedIn(session) {
	const { user_id, username } = session;
	return user_id && username;
}

//Creates a session token for the user
function createSession(req, user) {
	const { user_id, username, email, first_name, last_name, xp } = user;
	Object.assign(req.session, {
		user_id,
		username,
		email,
		first_name,
		last_name,
		xp,
	});

	// yes req is pass by reference however its more readable
	return req;
}

//Deletes user's previous session
async function deleteOldSession(new_session_id, user) {
	const old_session_id = user.dataValues.session_id;
	user.set({ session_id: new_session_id });
	await user.save();
	await sessionStore.destroy(old_session_id);
	return user;
}

//Parses current xp to determine level, remaining xp, and xp to next level
function xpParser(xp) {
	const scalingFactor = 100;
	const level = Math.floor(Math.sqrt(xp / scalingFactor));
	const remainingXp = xp - level * level * scalingFactor;
	const xpToNextLvl = (level + 1) * (level + 1) * scalingFactor - xp;
	return { level: level + 1, remainingXp, xpToNextLvl };
}

module.exports = { userRouter };
