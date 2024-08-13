import { ChallengeType } from "@/app/(dashboard)/dashboard";
import { Icon, Text, Box, Heading } from "@gluestack-ui/themed";
import ProgressBar from "./Progressbar";
import { Star } from "lucide-react-native";
import React from "react";
import { TouchableHighlight } from "react-native";
import { config } from "@gluestack-ui/config";
import Images from "./Images";

//maps an array of challenges to components. if the challenge is active a progress bar is included

const ChallengeMapper: React.FC<{
	challenges: ChallengeType[];
	setInfo: React.Dispatch<
		React.SetStateAction<Partial<Omit<ChallengeType, "challenge_id">> & { challenge_id: number }>
	>;
}> = ({ challenges, setInfo }) => {
	const challengeBoxes = challenges.map((challenge, index) => {
		return (
			<TouchableHighlight
				onPress={() => setInfo(challenge)}
				key={`challenge_${challenge.challenge_id}`}
				underlayColor="#E2E2E2"
				style={{
					backgroundColor: "#FFFFFF",
					padding: 12,
					borderRadius: 6,
					shadowColor: config.tokens.colors.backgroundLight800,
					shadowOffset: { width: 0, height: 1 },
					shadowRadius: 2.22,
					shadowOpacity: 0.22,
					minHeight: 44,
					elevation: 3,
				}}
			>
				<Box flex={1} justifyContent="space-evenly" alignItems="center" flexDirection="row" gap={5}>
					<Images variant={challenge.challenge_type} imageProps={{ style: { width: 50, height: 50 } }} />

					<Box width="$3/4">
						<Heading adjustsFontSizeToFit={true} numberOfLines={1}>
							{challenge.challenge_name}
						</Heading>
						{typeof challenge.challenge_progress === "number" &&
						challenge.challenge_status !== "finished" ? (
							((challenge.challenge_progress / challenge.challenge_goal) < 1) ? (
								<ProgressBar
									value={(challenge.challenge_progress / challenge.challenge_goal) * 100}
									progressProps={{ size: "sm" }}
								/>) : (
									<ProgressBar
									value={100}
									progressProps={{ size: "sm" }}
								/>
								)
						) : (
							<Text size="xs" numberOfLines={2}>
								{challenge.challenge_desc}
							</Text>
						)}
					</Box>
					<Box
						w="$10"
						h="$10"
						bg="$trueGray300"
						borderRadius="$md"
						alignItems="center"
						justifyContent="space-evenly"
					>
						<Icon as={Star} size="xl" />
						<Text size="xs" marginVertical="-$1">
							{challenge.challenge_xp}
						</Text>
					</Box>
				</Box>
			</TouchableHighlight>
		);
	});

	return (
		<Box flex={1} flexDirection="column" gap="$2" marginHorizontal="$2" mb="$2">
			{challengeBoxes}
		</Box>
	);
};

export default ChallengeMapper;
