import { useEffect, useRef, useState } from "react";
import { ChallengeType } from "./dashboard";
import { Box, Card, Heading, ScrollView, Text } from "@gluestack-ui/themed";
import { axiosInstance } from "@/axiosConfig";
import { useToast } from "@gluestack-ui/themed";
import { errorToast } from "@/components/ToastFactory";
import ChallengeMapper from "@/components/ChallengeMapper";
import { useIsFocused } from "@react-navigation/native";
import ConfirmChallengeModal from "@/components/ConfirmChallengeModal";
import Images from "@/components/Images";

const Challenges: React.FC = () => {
	const [challengeComp, setChallengeComp] = useState<ChallengeType[]>([]);
	const toast = useToast();
	const isFocused = useIsFocused();
	const [info, setInfo] = useState<Partial<Omit<ChallengeType, "challenge_id">> & { challenge_id: number }>({
		challenge_id: -2,
	});
	const [showModal, setShowModal] = useState(false);
	const ref = useRef(null);

	//used to always refresh info after exiting modal
	useEffect(() => {
		if (isFocused && !showModal) {
			!(async function () {
				try {
					const allChallenges = await axiosInstance.get<ChallengeType[]>("/challenges");
					const userChallenges = await axiosInstance.get<ChallengeType[]>("/challenges/user");
					const challengeComp = allChallenges.data.filter(
						({ challenge_id }) =>
							!userChallenges.data.map(chal => chal.challenge_id).includes(challenge_id),
					);
					setChallengeComp(challengeComp);
					setInfo({ challenge_id: -1 });
				} catch (error) {
					errorToast(toast, error);
				}
			})();
		}
	}, [isFocused, showModal]);

	const now = new Date();
	const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const month = months[now.getMonth()];
	const day = now.getDate();
	const year = now.getFullYear();

	useEffect(() => {
		if (info.challenge_id >= 0) setShowModal(true);
	}, [info]);

	//reset clicked ID when exiting modal
	useEffect(() => {
		if (!showModal) setInfo({ challenge_id: -1 });
	}, [showModal]);

	//id === -2 means not finished fetching info
	if (info.challenge_id === -2) return <></>;

	return (
		<>
			<Card variant="elevated" m="$2" ref={ref} flexDirection="row" justifyContent="space-between">
				<Box>
					<Heading size="3xl">{days[now.getDay()]}</Heading>
					<Text size="lg">{`${month} ${day}, ${year}`}</Text>
				</Box>
				<Images
					variant="clipboard"
					imageProps={{ style: { width: 90, height: "auto", resizeMode: "contain" } }}
				/>
			</Card>
			<ConfirmChallengeModal
				showModal={showModal}
				setShowModal={setShowModal}
				focusRef={ref}
				challenge_info={info}
				variant="add"
			/>
			{challengeComp.length ? (
				<ScrollView showsVerticalScrollIndicator={false} fadingEdgeLength={20}>
					<ChallengeMapper challenges={challengeComp} setInfo={setInfo} />
				</ScrollView>
			) : (
				<Text marginHorizontal="$2">No Additonal Challenges</Text>
			)}
		</>
	);
};

export default Challenges;
