import { axiosInstance } from "@/axiosConfig";
import { syncInfo } from "@/components/Location";
import ToastFactory, { errorToast } from "@/components/ToastFactory";
import { Box, Icon, Menu, MenuItem, MenuItemLabel, Pressable, useToast } from "@gluestack-ui/themed";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { LogOut, MoreVertical, RotateCw, Settings } from "lucide-react-native";

//triple dot menu on the right
const RightMenu: React.FC = () => {
	const toast = useToast();

	const logout = async () => {
		try {
			await axiosInstance.post("/users/logout");
			toast.show({
				placement: "top",
				render: ToastFactory({ title: "Successfully logged out", action: "success" }),
			});
			router.navigate("/");
		} catch (error) {
			toast.show({
				placement: "top",
				render: ToastFactory({ title: "Unable to log out", action: "error" }),
			});
			console.log(error);
		}
	};

	return (
		<Menu
			placement="bottom left"
			trigger={({ ...triggerProps }) => (
				<Box mr="$5">
					<Pressable {...triggerProps}>
						<Icon as={MoreVertical} size="xl" />
					</Pressable>
				</Box>
			)}
			borderRadius="$xl"
		>
			<MenuItem
				key="Sync"
				onPress={async () => {
					try {
						router.replace("/sync")
					} catch (error) {
						console.log(error);
						errorToast(toast, error);
					}
				}}
				textValue="Sync Data"
			>
				<Icon as={RotateCw} size="sm" mr="$2" />
				<MenuItemLabel size="sm">Sync Data</MenuItemLabel>
			</MenuItem>
			<MenuItem key="Settings" textValue="Settings">
				<Icon as={Settings} size="sm" mr="$2" />
				<MenuItemLabel size="sm">Settings (does nothing)</MenuItemLabel>
			</MenuItem>
			<MenuItem key="Logout" onPress={logout} textValue="Logout">
				<Icon as={LogOut} size="sm" mr="$2" />
				<MenuItemLabel size="sm">Logout</MenuItemLabel>
			</MenuItem>
		</Menu>
	);
};

//layout of the drawers for dashboard and whatnot
export default function Layout() {
	return (
		<Drawer screenOptions={{ title: "Wellness Quest", headerRight: props => <RightMenu /> }}>
			<Drawer.Screen
				name="dashboard"
				options={{
					drawerLabel: "Dashboard",
					drawerLabelStyle: { fontSize: 20 },
				}}
			/>
			<Drawer.Screen
				name="challenges"
				options={{
					drawerLabel: "Challenges",
					title: "Challenges",
					drawerLabelStyle: { fontSize: 20 },
				}}
			/>
			<Drawer.Screen
				name="history"
				options={{
					drawerLabel: "History",
					drawerLabelStyle: { fontSize: 20 },
				}}
			/>
		</Drawer>
	);
}
