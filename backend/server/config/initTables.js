const Challenge = require("../api/models/Challenge");
const User = require("../api/models/User");

async function addInitialData() {
	if (process.env.NODE_ENV === "dev") {
		await User.upsert({
			user_id: "user_id",
			username: "username",
			email: "email@email.com",
			pass_hash: "$2y$10$SPs.zs3imYyVErkcdupswu9zi8A90JAveMMNqM7gWBU9SKUep5aL.",
			first_name: "firstname",
			last_name: "lastname",
			xp: 0,
			session_id: "",
		});
	}

	const [MAY1] = await Challenge.upsert({
		challenge_id: 1,
		challenge_name: "Step Count Challenge",
		challenge_desc: "This week take the long route and walk 70000 steps in total",
		challenge_type: "walking",
		challenge_goal: 70000,
		challenge_xp: 150,
	});
	const [MAY2] = await Challenge.upsert({
		challenge_id: 2,
		challenge_name: "Interval Walking Challenge",
		challenge_desc: "Try walking in intervals such as 1 minute fast and 4 minutes slow",
		challenge_type: "walking",
		challenge_goal: 50000,
		challenge_xp: 150,
	});

	const [MAY3] = await Challenge.upsert({
		challenge_id: 3,
		challenge_name: "Destination Walking challenge",
		challenge_desc: "Commit to walking to a specific location within your community",
		challenge_type: "walking",
		challenge_goal: 250,
		challenge_xp: 150,
	});

	const [MAY4] = await Challenge.upsert({
		challenge_id: 4,
		challenge_name: "Meditation Walking challenge",
		challenge_desc: "During your walk, focus on being fully present in the moment.",
		challenge_type: "walking",
		challenge_goal: 250,
		challenge_xp: 150,
	});

	if (process.env.NODE_ENV === "dev") {
		const userInstance = await User.findByPk("user_id");
		const userChallenge1 = await userInstance.addChallenge(MAY1, {
			through: "UserChallenge_Join",
			ignoreDupliates: true,
		});
		const userChallenge2 = await userInstance.addChallenge(MAY2, {
			through: "UserChallenge_Join",
			ignoreDupliates: true,
		});
		const userChallenge3 = await userInstance.addChallenge(MAY3, {
			through: "UserChallenge_Join",
			ignoreDupliates: true,
		});
		const userChallenge4 = await userInstance.addChallenge(MAY4, {
			through: "UserChallenge_Join",
			ignoreDupliates: true,
		});
	}
}

module.exports = addInitialData;
