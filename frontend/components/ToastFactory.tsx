import { config } from "@gluestack-ui/config";
import { Icon, Toast, ToastDescription, ToastTitle, VStack } from "@gluestack-ui/themed";
import { router } from "expo-router";

export type ToastFactoryT = {
	title: string;
	message?: string;
	variant?: "solid" | "outline" | "accent";
	action?: "error" | "warning" | "success" | "info" | "attention";
	bg?: keyof typeof config.tokens.colors;
	icon?: React.ReactElement<typeof Icon>;
};

//wrapped up toast component

export default function ToastFactory({
	title,
	message,
	variant = "solid",
	action = "attention",
	bg,
	icon,
}: ToastFactoryT) {
	return ({ id }: { id: number }) => {
		let toastProps = {
			id: `toast-${id}`,
			action,
			variant,
		};

		//truly awful cheat i hate having to do
		if (bg)
			//@ts-ignore
			toastProps.bg = `$${bg}`;

		return (
			<Toast {...toastProps}>
				{icon}
				<VStack space="xs">
					<ToastTitle>{title}</ToastTitle>
					{message && <ToastDescription>{message}</ToastDescription>}
				</VStack>
			</Toast>
		);
	};
}

//much easier creation of a toast to signfy an error, redirects to login if the error was because of lack of auth

export function errorToast(
	toast: {
		show: (props: import("@gluestack-ui/toast/lib/typescript/types").InterfaceToastProps) => any;
		close: (id: any) => void;
		closeAll: () => void;
		isActive: (id: any) => boolean;
	},
	error: any,
) {
	toast.show({
		placement: "top",
		render: ToastFactory({
			title: "Error",
			message: error.response?.data?.error ? error.response.data.error : error.message,
			action: "error",
		}),
	});
	console.error(error)
	if (error.response.status == 403) {
		router.dismissAll();
		router.replace("/");
	}
}
