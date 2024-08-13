import { axiosInstance } from "../../axiosConfig";
import { useEffect, useRef, useState } from "react";
import { Link, router } from "expo-router";
import { Box, Card, Heading, ScrollView, Text, useToast } from "@gluestack-ui/themed";
import React from "react";
import { AxiosResponse } from "axios";
import { useIsFocused } from "@react-navigation/native";
import { errorToast } from "@/components/ToastFactory";
import ProgressBar from "@/components/Progressbar";
import ChallengeMapper from "@/components/ChallengeMapper";
import ConfirmChallengeModal from "@/components/ConfirmChallengeModal";
import { Image } from "expo-image";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOCATION_DATA, syncInfo } from "@/components/Location";

export type UserInfoType = {
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	logged_in: boolean;
	level: number;
	remainingXp: number;
	xpToNextLvl: number;
};

const Dashboard: React.FC = () => {
	const [userInfo, setUserInfo] = useState<UserInfoType | null>(null);
	const isFocused = useIsFocused();

	useEffect(() => {
		if (!isFocused) return;
		axiosInstance
			.get("/users/info")
			.then(
				resolve => {
					const response = resolve as AxiosResponse<UserInfoType>;
					if (!response.data.logged_in) {
						router.navigate("/");
						return;
					}
					setUserInfo(response.data);
				},
				reject => {
					console.log(reject);
					router.navigate("/");
				},
			)
			.catch(error => {
				console.log(error);
			});
	}, [isFocused]);

	if (!userInfo || !userInfo.logged_in) return <></>;

	return <DashboardInside userInfo={userInfo} />;
};

export type ChallengeType = {
	challenge_id: number;
	challenge_name: string;
	challenge_desc: string;
	challenge_goal: number;
	challenge_xp: number;
	challenge_type: "walking" | "step";
	createdAt: string;
	updatedAt: string;
	challenge_status: "not started" | "started" | "finished";
	challenge_progress: number;
};

const DashboardInside: React.FC<{ userInfo: UserInfoType }> = ({ userInfo }) => {
	const [challenges, setChallenges] = useState<ChallengeType[]>([]);
	//to not show anything while waiting
	const [state, setState] = useState<"loading" | "ready">("loading");
	const toast = useToast();
	const isFocused = useIsFocused();
	//init to -1 which wont show modal
	const [info, setInfo] = useState<Partial<Omit<ChallengeType, "challenge_id">> & { challenge_id: number }>({
		challenge_id: -1
	});
	const [showModal, setShowModal] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		//fetch info every time focusing on the screen and no modal is shown
		if (isFocused && !showModal)
			!(async function getUserChallenges() {
				try {
					const userChallenges = await axiosInstance.get("/challenges/user");
					setChallenges(
						// Array(20).fill(userChallenges.data[0]),
						userChallenges.data,
					);

					setState("ready");
				} catch (error) {
					errorToast(toast, error);
					//retry in 5 seconds, this isnt recursion
					setTimeout(getUserChallenges, 5000);
				}
			})();
	}, [isFocused, showModal]);

	//not shown is challenge_id = 1 so if its higher then someone clicked a button
	useEffect(() => {
		if (info.challenge_id >= 0) setShowModal(true);
	}, [info]);

	//reset challenge_id to show after exiting modal because of previous useEffect trigger
	useEffect(() => {
		if (!showModal) setInfo({ challenge_id: -1 });
	}, [showModal]);

	if (state === "loading")
		return (
			<Box justifyContent="center">
				<Heading>Loading Info...</Heading>
				<ActivityIndicator size="large" />
			</Box>
		);

	return (
		<>
			<UserCard userInfo={userInfo} />
			{challenges.length ? (
				<>
					<Text ml="$2" ref={ref}>
						Active Challenges
					</Text>
					<ConfirmChallengeModal
						showModal={showModal}
						setShowModal={setShowModal}
						focusRef={ref}
						challenge_info={info}
						variant="remove"
					/>
					<ScrollView showsVerticalScrollIndicator={false} fadingEdgeLength={20} maxHeight="$2/5">
						<ChallengeMapper challenges={challenges.filter(chal => chal.challenge_status !== "finished")} setInfo={setInfo} />
					</ScrollView>
				</>
			) : (
				<Text ml="$2">No Active Challenges</Text>
			)}
		</>
	);
};

export const UserCard: React.FC<{ userInfo: UserInfoType }> = ({ userInfo }) => {
	const xp = userInfo.remainingXp;
	const xpTotalToLvlUp = userInfo.remainingXp + userInfo.xpToNextLvl;
	return (
		<Card variant="elevated" m="$2">
			<Heading size="3xl">{userInfo.username}</Heading>
			<Text>Level {userInfo.level}</Text>
			<ProgressBar value={(xp / xpTotalToLvlUp) * 100} />
			<Box flexDirection="row-reverse">
				<Text size="sm">
					{xp}/{xpTotalToLvlUp}
				</Text>
			</Box>
		</Card>
	);
};

export default Dashboard;
