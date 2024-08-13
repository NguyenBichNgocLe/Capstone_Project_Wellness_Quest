import { ChallengeType } from "@/app/(dashboard)/dashboard";
import { axiosInstance } from "@/axiosConfig";
import {
	useToast,
	ModalBackdrop,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	Icon,
	CloseIcon,
	ModalBody,
	ModalFooter,
	ButtonText,
	Modal,
	Heading,
	Button,
	Text,
} from "@gluestack-ui/themed";
import { errorToast } from "./ToastFactory";
import { CHALLENGE_ID_ACTIVE, endChallenge, startChallenge } from "./Location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

/*modal window that pops up when clicking a challenge
if its an unadded challenge then user can choose to add or go back
if its an added challenge then user can start or cancel the challenge
if its a started challenge then the user can stop or cancel the challenge
*/
const ConfirmChallengeModal: React.FC<{
	showModal: boolean;
	setShowModal: (value: boolean) => void;
	focusRef: React.MutableRefObject<null>;
	challenge_info: Partial<Omit<ChallengeType, "challenge_id">> & { challenge_id: number };
	variant: "add" | "remove";
}> = ({ showModal, setShowModal, focusRef, challenge_info, variant }) => {
	const toast = useToast();
	const WAITING_FOR_STORAGE = -2;
	const NO_ID_STORED = "-1";
	const [activeChallengeId, setActiveChallengeId] = useState(WAITING_FOR_STORAGE);

	const addChallenge = (challenge_id: number) => async () => {
		try {
			await axiosInstance.post(`/challenges/add?challenge_id=${challenge_id}`);
		} catch (error: any) {
			console.log(error);
			errorToast(toast, error);
		}
	};

	const quitChallenge = (challenge_id: number) => async () => {
		try {
			await axiosInstance.delete(`/challenges/user/${challenge_id}`);
		} catch (error: any) {
			console.log(error);
			errorToast(toast, error);
		}
	};

	useEffect(() => {
		if (showModal)
			(async () => {
				const storedChallenge = (await AsyncStorage.getItem(CHALLENGE_ID_ACTIVE)) || NO_ID_STORED;
				setActiveChallengeId(+storedChallenge);
			})();
	}, [showModal]);

	return (
		<Modal
			isOpen={showModal}
			onClose={() => {
				setShowModal(false);
			}}
			finalFocusRef={focusRef}
		>
			<ModalBackdrop />
			<ModalContent>
				<ModalHeader>
					<Heading size="lg">{challenge_info.challenge_name}</Heading>
					<ModalCloseButton>
						<Icon as={CloseIcon} />
					</ModalCloseButton>
				</ModalHeader>
				<ModalBody>
					<Text>{challenge_info.challenge_desc}</Text>
				</ModalBody>
				{activeChallengeId !== WAITING_FOR_STORAGE && (
					<ModalFooter flexDirection="column" gap="$2" alignContent="center">
						{variant === "add" ? (
							<UnaddedChallengeButtons
								addChallenge={addChallenge(challenge_info.challenge_id)}
								setShowModal={setShowModal}
							/>
						) : (
							<AcceptedChallengesButtons
								quitChallenge={quitChallenge(challenge_info.challenge_id)}
								setShowModal={setShowModal}
								startChallenge={startChallenge(challenge_info.challenge_id)}
								setActiveChallengeId={setActiveChallengeId}
								activeChallengeId={activeChallengeId}
								challenge_id={challenge_info.challenge_id}
							/>
						)}
					</ModalFooter>
				)}
			</ModalContent>
		</Modal>
	);
};

const UnaddedChallengeButtons: React.FC<{
	addChallenge: () => Promise<void>;
	setShowModal: (value: boolean) => void;
}> = ({ addChallenge, setShowModal }) => (
	<>
		<Heading>Accept the Challenge?</Heading>
		<Button
			size="sm"
			action="positive"
			borderWidth="$0"
			onPress={() => {
				addChallenge().then(() => setShowModal(false));
			}}
			w="$4/5"
		>
			<ButtonText>Yes</ButtonText>
		</Button>
		<Button
			size="sm"
			onPress={() => {
				setShowModal(false);
			}}
			w="$4/5"
		>
			<ButtonText>No</ButtonText>
		</Button>
	</>
);

const AcceptedChallengesButtons: React.FC<{
	quitChallenge: () => Promise<void>;
	setShowModal: (value: boolean) => void;
	startChallenge: () => Promise<void>;
	setActiveChallengeId: React.Dispatch<React.SetStateAction<number>>;
	activeChallengeId: number;
	challenge_id: number;
}> = ({ quitChallenge, setShowModal, startChallenge, setActiveChallengeId, activeChallengeId, challenge_id }) => (
	<>
		{activeChallengeId != challenge_id ? (
			<Button
				size="sm"
				borderWidth="$0"
				onPress={() => {
					startChallenge().then(() => setShowModal(false));
				}}
				w="$4/5"
			>
				<ButtonText>Start Challenge</ButtonText>
			</Button>
		) : (
			<Button
				size="sm"
				borderWidth="$0"
				onLongPress={() => {
					endChallenge().then(() => {
						setShowModal(false);
						setActiveChallengeId(-1);
					});
				}}
				w="$4/5"
			>
				<ButtonText>Stop Challenge (Hold)</ButtonText>
			</Button>
		)}
		<Button
			size="sm"
			action="negative"
			onLongPress={() => {
				endChallenge()
					.then(quitChallenge)
					.then(() => setShowModal(false));
			}}
			w="$4/5"
		>
			<ButtonText>Cancel Challenge (Hold)</ButtonText>
		</Button>
	</>
);

export default ConfirmChallengeModal;
