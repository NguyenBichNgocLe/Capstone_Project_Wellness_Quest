import { Platform } from "react-native";

export const isMobile = Platform.OS === "android" || Platform.OS === "ios";
export const isWeb = !isMobile;