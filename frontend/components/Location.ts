import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosInstance } from "@/axiosConfig";

const LOCATION_TASK_NAME = "background-track-location";
export const LOCATION_DATA = "challenge_data";
export const CHALLENGE_ID_ACTIVE = "challenge_id_active";

//runtime storage of info
let locationData: Array<{ challenge_id: number; location_object: Location.LocationObject }> = [];

let timer: NodeJS.Timeout;

//dumps all of the data into into local storage

//avoid infinite recursion
let stupid_hack = 0

const storeData = async () => {
	const stored_data = await AsyncStorage.getItem(LOCATION_DATA);
	const obj_data: typeof locationData = stored_data ? JSON.parse(stored_data) : [];
	const new_data = [...obj_data, ...locationData];
	await AsyncStorage.setItem(LOCATION_DATA, JSON.stringify(new_data));
	//cant store too much info in local storage
	if (new_data.length > 300000 + stupid_hack) {
		await syncInfo();
		stupid_hack += 40;
	}
	stupid_hack = 0;
	locationData = [];
};

//checks permissions and starts location tracking
export const startChallenge = (challenge_id: number) => async () => {
	//permissions
	const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
	if (foregroundStatus !== "granted") {
		console.log("NO FOREGROUND");
		startChallenge(challenge_id)()
		return;
	}
	const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
	if (backgroundStatus !== "granted") {
		console.log("NO BACKGROUND");
		startChallenge(challenge_id)()
		return;
	}

	//set up function for handing location info
	TaskManager.defineTask<{ locations: Location.LocationObject[] }>(LOCATION_TASK_NAME, ({ data, error }) => {
		if (error) {
			console.error(error);
			return;
		}
		if (data) {
			console.log(data.locations[0].coords);
			locationData.push({ challenge_id, location_object: data.locations[0] });
		}
	});

	//start tracking location
	await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
		accuracy: Location.Accuracy.BestForNavigation,
	});

	//local save, every 5 min
	clearInterval(timer);
	timer = setInterval(async () => {
		await storeData();
	}, 1000 * 60 * 5);

	await AsyncStorage.setItem(CHALLENGE_ID_ACTIVE, `${challenge_id}`);
	console.log("HERE");
};

//stops tracking and stores location data
export const endChallenge = async () => {
	if (TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
		await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
		clearInterval(timer);
		await storeData();
	}
	await AsyncStorage.setItem(CHALLENGE_ID_ACTIVE, "-1");
};

//segmenting info for transfer
export function splitArray<T>(array: T[], chunkSize: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) chunks.push(array.slice(i, i + chunkSize));

	return chunks;
}

//sends location information to server. if successful delete local storage info
export const syncInfo = async () => {
	// const active_id = await AsyncStorage.getItem(LOCATION_TASK_NAME)
	// if (!active_id || +active_id < 1)
	// 	return true;

	let goodResponse = false;
	await storeData();
	const locationDataRaw = JSON.parse(await AsyncStorage.getItem(LOCATION_DATA) || "[]") as Location.LocationObject[];
	const locationData = locationDataRaw.slice(5)
	goodResponse = true; //didnt throw
	if (locationData.length) {
		goodResponse = false; //but now theres data to transfer
		const responses = await Promise.all(
			splitArray(locationData, 20).map(
				async locationSlice => await axiosInstance.post("/challenges/gps", { locations: locationSlice }),
			),
		);
		goodResponse = responses.map(r => r.status < 300).reduce((prev, curr) => prev && curr);
	}
	if (goodResponse) await AsyncStorage.removeItem(LOCATION_DATA); //throw out ANYTHING in there

	return goodResponse;
};
