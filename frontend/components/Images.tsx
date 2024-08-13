import { Asset, useAssets } from "expo-asset";
import { Image, ImageProps } from "expo-image";

const exerciseChallenge = require("../assets/images/exercise_challenge.png");
const runChallenge = require("../assets/images/run_challenge.png");
const stepChallenge = require("../assets/images/step_challenge.png");
const clipboard = require("../assets/images/challenges_page.png");

const requires = [exerciseChallenge, runChallenge, stepChallenge, clipboard, runChallenge];

const challengeTypes = ["exercise", "run", "step", "clipboard", "walking"] as const;

type typesArray<T extends readonly any[]> = T[number];

type Images_t = { variant: typesArray<typeof challengeTypes>; imageProps?: Omit<ImageProps, "source"> };

//wrapper for a JPG image

const Images: React.FC<Images_t> = ({ variant, imageProps }) => {
	const [assets] = useAssets(requires);
	if (!assets) return <></>;
	return <Image source={assets[challengeTypes.findIndex(v => v === variant)] as any} {...imageProps} />;
};

export default Images