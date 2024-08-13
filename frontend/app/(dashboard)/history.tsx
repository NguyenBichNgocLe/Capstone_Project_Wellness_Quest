import { useFocusEffect } from "expo-router";
import { useEffect, useState } from "react";
import { ChallengeType } from "./dashboard";
import { axiosInstance } from "@/axiosConfig";
import { Box, Card, Heading, ScrollView, useToast } from "@gluestack-ui/themed";
import { errorToast } from "@/components/ToastFactory";
import ChallengeMapper from "@/components/ChallengeMapper";
import { useIsFocused } from "@react-navigation/native";

//shows list of finished challenges
const history: React.FC = () => {
	const [challengeHist, setChallengeHist] = useState<ChallengeType[]>([]);
	const toast = useToast();
	const isFocused = useIsFocused();

	useEffect(() => {
		//refetch every time moving to screen
		if (isFocused)
			!(async function () {
				try {
					const challengeHist = await axiosInstance.get<ChallengeType[]>("/challenges/finished");
					setChallengeHist(challengeHist.data);
				} catch (error) {
					console.log(error);
					errorToast(toast, error);
				}
			})();
	}, [isFocused]);

	return (
		<>
			<Card variant="elevated" m="$2" flexDirection="row" justifyContent="space-between">
				<Box>
					<Heading size="3xl">History</Heading>
				</Box>
			</Card>
			<ScrollView>
				<ChallengeMapper challenges={challengeHist} setInfo={() => {}} />
			</ScrollView>
		</>
	);
};

export default history;
