
import axios from "axios";
import { Platform } from "react-native";

const serverIP = `${process.env.EXPO_ENV}` === "production" ? "wellnessquest.uk" : (Platform.OS === "android" ? process.env.SERVER_IP || "10.0.2.2" : "localhost")
const BASE_URL = `${process.env.EXPO_ENV}` === "production" ? `https://${serverIP}:4848` : (process.env.EXPO_APP_DATA_ENDPOINT || `http://${serverIP}:4848`)

const axiosInstance = axios.create({
	baseURL: BASE_URL,
	withCredentials: true,
});

export {axiosInstance, BASE_URL};