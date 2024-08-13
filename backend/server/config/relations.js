const User = require("../api/models/User");
const Challenge = require("../api/models/Challenge");
const UserChallenge_Join = require("../api/models/UserChallenge_Join");
const database = require("./database");
const addInitialData = require("./initTables");

User.belongsToMany(Challenge, {
	through: UserChallenge_Join,
	foreignKey: "user_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
Challenge.belongsToMany(User, {
	through: UserChallenge_Join,
	foreignKey: "challenge_id",
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});

async function databaseInit() {
	await database.sync();
	console.log("Database connection established, loading defaults...");
	await addInitialData();
	console.log("Database ready.");
}

module.exports = { databaseInit };
