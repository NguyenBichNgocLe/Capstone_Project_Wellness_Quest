import { axiosInstance } from "../../axiosConfig";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { SubmitHandler, useForm } from "react-hook-form";
import FormInput from "../../components/FormInput";
import { validate } from "email-validator";
import { Button, Heading, Box, ButtonText, useToast, useMedia } from "@gluestack-ui/themed";
import { Keyboard } from "react-native";
import ToastFactory, { errorToast } from "@/components/ToastFactory";
import { AxiosError } from "axios";
import { isWeb } from "@/components/platform";

interface LoginI {
	email: string;
	password: string;
}

const LoginScreen: React.FC = () => {
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<LoginI>();

	const toast = useToast();

	const submitHander: SubmitHandler<LoginI> = async data => {
		Keyboard.dismiss();
		try {
			await axiosInstance.post("/users/login", data);
			toast.show({
				placement: "top",
				render: ToastFactory({
					title: "Successfully Logged In",
					action: "success",
				}),
			});
			router.navigate("/sync");
		} catch (error: any) {
			console.log(error);
			errorToast(toast, error)
		}
	};
	
	//ran first to check valid cookie auth
	async function attemptToConnect() {
		try {
			const response = await axiosInstance.get("/users/info");
			if (response.data.logged_in) router.replace("/sync");
		} catch (err) {
			const error = err as AxiosError<any>;
			toast.show({
				placement: "top",
				duration: 9000,
				render: ToastFactory({
					title: "Error",
					message: error.response?.data?.error ? error.response.data.error : error.message,
					action: "error",
				}),
			});
			//retry after 10 seconds
			setTimeout(attemptToConnect, 10000);
		}
	}

	useEffect(() => {
		attemptToConnect();
	}, []);

	const required = "This field is required";

	const formAndFlex = {
		control,
		fieldErrors: errors,
		flexState: isWeb,
		formState: { isRequired: true },
	};

	return (
		<Box flex={1} height="100%" justifyContent="center" flexDirection="row" marginHorizontal="$5">
			<Box flex={1} maxWidth={400} justifyContent="center" flexDirection="column">
				<Heading>Please login</Heading>
				<Box>
					<FormInput
						labelText="Email"
						inputProps={{ ...register("email", { required, validate }) }}
						{...formAndFlex}
					/>
					<FormInput
						labelText="Password"
						showText={false}
						inputProps={{ ...register("password", { required }) }}
						{...formAndFlex	}
					/>
					<Button width={"100%"} marginTop="$5" onPress={handleSubmit(submitHander)}>
						<ButtonText>Sign in</ButtonText>
					</Button>
				</Box>
				<Button width="100%" marginTop="$5" onPress={() => router.navigate("/register")}>
					<ButtonText>Register</ButtonText>
				</Button>
			</Box>
		</Box>
	);
};

export default LoginScreen;
