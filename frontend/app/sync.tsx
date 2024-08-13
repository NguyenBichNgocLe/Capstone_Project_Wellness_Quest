import { syncInfo } from "@/components/Location";
import { errorToast } from "@/components/ToastFactory";
import { Box, Heading, useToast } from "@gluestack-ui/themed";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { useEffect } from "react";
import { ActivityIndicator } from "react-native";

//intermediate screen after being OK'd by login to sync any data

const Sync: React.FC = () => {
	const toast = useToast();
	const isFocused = useIsFocused();

	useEffect(() => {
		async function syncData(): Promise<any> {
			try {
				const goodResponse = await syncInfo();
				if (!goodResponse) return setTimeout(syncData, 5000);

				router.replace("/dashboard");
				return;
			} catch (error) {
				errorToast(toast, error);
				router.replace("/dashboard")
			}
		}

		setTimeout(syncData, 100);
	}, [isFocused]);

	return (
		<Box flex={1} height="100%" justifyContent="center" flexDirection="row">
			<Box justifyContent="center">
				<Heading>Syncing info...</Heading>
				<ActivityIndicator size="large" />
			</Box>
		</Box>
	);
};

export default Sync;
