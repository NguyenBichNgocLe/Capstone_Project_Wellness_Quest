"use strict";

const Challenge = require("../models/Challenge");
const User = require("../models/User");
const UserChallenge_Join = require("../models/UserChallenge_Join");

const express = require("express");
const { Op } = require("sequelize");
const challengeRouter = express.Router();
const { KalmanFilter } = require('kalman-filter');
challengeRouter.use(express.json());

//Returns all the challenges
challengeRouter.get("/", async (req, res, next) => {
	try {
		const challenges = await Challenge.findAll();  //returns all the challenges in the table
		return res.status(200).send(challenges);
	} catch (error) {
		console.error(error);
		return res.status(500).send({ error: "Could not get challenges" });
	}
});

//Returns all the challenges associated with the user
challengeRouter.get("/user", async (req, res, next) => {
	try {
		const { user_id } = req.session;

		//Returns all challenges associated to the user in the UserChallenge table
		const rawResult = await Challenge.findAll({ 
			include: [
				{
					model: User,
					through: {
						model: UserChallenge_Join,
					},
					where: {
						user_id,
					},
					attributes: ["username"],
				},
			],
		});

		const userChallenges = rawResult.map(challenge => {
			const { Users, ...rest } = challenge.dataValues;
			const { user_id, ...progress } = Users[0].UserChallenge_Join.dataValues;
			return { ...rest, ...progress };
		});

		return res.status(200).send(userChallenges);
	} catch (error) {
		console.error(error);
		return res.status(500).send({ error: "Could not get User's challenges" });
	}
});

//Returns the challenge with the specified challenge_id associated with the user
challengeRouter.get("/user/:challenge_id", async (req, res, next) => {
	try {
		const { user_id } = req.session;
		const { challenge_id } = req.params;

		//Returns the specified challenge associated with the user
		const rawResult = await Challenge.findOne({
			include: [
				{
					model: User,
					through: {
						model: UserChallenge_Join,
					},
					where: {
						user_id,
					},
					attributes: ["username"],
				},
			],
			where: { challenge_id },
		});

		if (!rawResult) return res.sendStatus(404);

		const { Users, ...rest } = rawResult.dataValues;
		const { user_id: _, ...progress } = Users[0].UserChallenge_Join.dataValues;
		const userChallenge = { ...rest, ...progress };

		return res.status(200).send(userChallenge);
	} catch (error) {
		console.error(error);
		return res.status(500).send({ error: "Could not get User's challenges" });
	}
});

//Adds challenge to currently logged in user
challengeRouter.post("/add", async (req, res, next) => {
	try {
		const challenge_id = req.query.challenge_id;
		const { user_id } = req.session;

		//Checks whether challenge_id was given
		if (challenge_id == undefined || challenge_id == '') {
			console.log("Empty challenge_id", req);
			return res.status(400).send({ error: "Missing challenge_id" });
		}

		const userInstance = await User.findByPk(user_id);	//Finds user
		const challengeInstance = await Challenge.findByPk(challenge_id); //Finds challenge
		
		//Associates challenge with user in UserChallenge_Join
		const userChallenges = await userInstance.addChallenge(challengeInstance, {
			through: "UserChallenge_Join",
			ignoreDuplicates: true,
		});

		if (!userChallenges || userChallenges[0] == 0) {
			return res.status(400).send({ error: "Challenge already added" });
		}

		return res.status(200).send(userChallenges);
	} catch (error) {
		console.log(error);
		return res.status(500).send({ error: "Could not add challenge to user's profile" });
	}
});

// GET the information of all finished challenges of the logged-in user
challengeRouter.get("/finished", async (req, res, next) => {
	try {
		
		const { user_id } = req.session;

		const rawResult = await Challenge.findAll({
			include: [
				{
					model: User,
					through: {
						model: UserChallenge_Join,
						where: {
							challenge_status: "finished"
						}
					},
					where: {
						user_id,
					},
					attributes: ["username"]
				}
			]
		});

		const finishedChallenges = rawResult.map(challenge => {
			const { Users, ...rest } = challenge.dataValues;
			const { user_id, ...progress } = Users[0].UserChallenge_Join.dataValues;
			return { ...rest, ...progress };
		});

		return res.status(200).send(finishedChallenges);
	} catch (error) {
		console.error(error);
		return res.status(500).send({ error: "Could not get finished challenges for the user" });
	}
});

//Returns the challenge requested
challengeRouter.get("/:challenge_id", async (req, res, next) => {
	try {
		const challenge_id = req.params.challenge_id;

		const challenge = await Challenge.findByPk(challenge_id);	//Finds challenge
		if (!challenge) return res.sendStatus(404);
		return res.status(200).send(challenge);
	} catch (error) {
		console.log(error);
		return res.status(500).send({ error: "Could not return requested challenge" });
	}
});

//Removes the specified challenge from the user's profile
challengeRouter.delete("/user/:challenge_id", async (req, res, next) => {
	try {
		const { challenge_id } = req.params;
		const { user_id } = req.session;
		await UserChallenge_Join.destroy({ where: { challenge_id, user_id } });  //Removes the current record for user-challenge
		return res.sendStatus(204);
	} catch (error) {
		console.log(error);
		return res.status(500).send({ error: "Unable to delete challenge" });
	}
});

//Parse GPS data then adds it to the specified challenges for the user
challengeRouter.post("/gps", async(req, res, next) => {
	try {
		const { user_id } = req.session;
		/**@type {Array<{challenge_id: number, location_object: {coords: {latitude: number, longitude: number, altitude: number | null, accuracy: number | null, altitudeAccuracy: number | null, heading: number | null, speed: number | null},timestamp: number, mocked?: boolean}>}} */
		const locations = req.body.locations;
		const locationMap = groupBy(locations, loc => loc.challenge_id)	


		//Iterates through each challenge_id to calculate the distance between the coordinates of location objects
		//Note: Only the distance between the coordinates are used
		
		for (const location of locationMap) {
			const coorArray = [location[0].challenge_id || -1, location.map(loc => loc.location_object)]
			let totalDistance = 0;


			let observation = new Array;
			
			// Drop bad data
			let prevLat = coorArray[1][0].coords.latitude;
			let prevLon = coorArray[1][0].coords.longitude;
			let prevTimestamp = coorArray[1][0].timestamp;
			for (let i = 1; i < coorArray[1].length; i++) {
				let distance;
				let currLat = coorArray[1][i].coords.latitude;
				let currLon = coorArray[1][i].coords.longitude;
				let currTimestamp = coorArray[1][i].timestamp;
				
				let la1 = prevLat * (Math.PI/180);
				let la2 = currLat * (Math.PI/180);
				let lo1 = prevLon * (Math.PI/180);
				let lo2 = currLon * (Math.PI/180);
				
				//Distance in miles
				distance = 2 * Math.asin(Math.sqrt(Math.pow((Math.sin((la1 - la2) / 2)), 2) + Math.cos(la2) * Math.cos(la2) * Math.pow(Math.sin((lo1 - lo2) / 2), 2))) * 3956;
				let time = (currTimestamp - prevTimestamp) * 2.77778E-7;
				let velocity = distance / time;

				if (velocity > 15 || velocity < 2) {
					coorArray[1].splice(i,1);
				}

				prevLat = currLat;
				prevLon = currLon;
				prevTimestamp = currTimestamp;
			}

			if(coorArray[1].length <= 1) return res.status(400).send("Not enough location data or speed was too high/low");
			for (let i = 0; i < coorArray[1].length; i++) {
				observation.push(new Array (parseInt(coorArray[1][i].coords.latitude), parseInt(coorArray[1][i].coords.longitude)))
			}

			const kFilter = new KalmanFilter({
				observation: {
					sensorDimension: 2,
					sensorCovariance: 4.5,
					name: 'sensor'
				},
				dynamic: {
					name: 'constant-speed',
					covariance: [0.25,0.25,0.25,0.25]
				}

			});

			const result = kFilter.filterAll(observation);

			for (let i = 0; i < result.length - 1; i++) {
				let distance;
				let lat1 = result[i][0]*(Math.PI/180);
				let lat2 = result[i+1][0]*(Math.PI/180);
				let lon1 = result[i][1]*(Math.PI/180);
				let lon2 = result[i+1][1]*(Math.PI/180);
				
				//Distance in miles
				distance = 2*Math.asin(Math.sqrt(Math.pow((Math.sin((lat1-lat2)/2)),2) + Math.cos(lat2)*Math.cos(lat2)* Math.pow(Math.sin((lon1-lon2)/2),2))) * 3956;
				
				totalDistance += distance;
			}
		
			//Distance in feet
			let totalDistanceFeet = (totalDistance * 5280);

			//Key is challenge_id
			const key = coorArray[0];
			
			//finds current challenge_id associated with user
			let currentUserChallenge = await UserChallenge_Join.findOne({
				where: { challenge_id: key, user_id },
			});

			if(!currentUserChallenge) return res.status(400).send("Challenge not started or is unavaible");
			
			//Updates current challenge_progress atomically, avoiding race conditions
			await currentUserChallenge.increment("challenge_progress", {by: totalDistanceFeet})

			//Find associated challenge
			const currentChallenge = await Challenge.findOne({
				where: { challenge_id: key }
			})

			if(!currentChallenge) return res.status(400).send("Challenge not started or is unavaible");

			//refetch due to atomic transaction
			currentUserChallenge = await UserChallenge_Join.findOne({
				where: { challenge_id: key, user_id },
			});

			//Updates challenge_status
			if (currentUserChallenge.challenge_progress >= currentChallenge.challenge_goal) {
				await currentUserChallenge.update({ challenge_status: "finished" });
				await currentUserChallenge.save();
				const userInstance = await User.findByPk(user_id)
				await userInstance.increment("xp", {by: currentChallenge.challenge_xp}) 
			}
			else if (currentUserChallenge.challenge_status === "not started") {
				await currentUserChallenge.update({ challenge_status: "started"})
			}

		}

		return res.sendStatus(200);
	} catch(error) {
		console.log(error);
		return res.status(500).send({ error: "Unable to update location data"});
	}
});

/**
 * Groups the elements of an array by a specified key.
 * 
 * @template T The type of elements in the array.
 * @template K The type of the key to group by.
 * 
 * @param {T[]} arr
 * @param {(item: T) => K} key 
 * 
 * @returns {{K: T[]}}
 */
function groupBy(arr, key) {
    return Object.values(
        arr.reduce((agg, curr) => {
            const _key = key(curr);
            (agg[_key] || (agg[_key] = [])).push(curr);
            return agg;
        }, {})
    );
}
module.exports = { challengeRouter };