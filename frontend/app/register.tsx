import React from "react";
import { validate } from "email-validator";
import FormInput, { FormInputI } from "../components/FormInput";
import { Control, SubmitHandler, useForm } from "react-hook-form";
import { axiosInstance } from "../axiosConfig";
import { router } from "expo-router";
import { Box, Button, ButtonText, Heading, useMedia, useToast } from "@gluestack-ui/themed";
import { Keyboard, StyleProp, ViewProps, ViewStyle } from "react-native";
import { StyledComponentProps } from "@gluestack-style/react/lib/typescript/types";
import ToastFactory, { errorToast } from "@/components/ToastFactory";
import { isWeb } from "@/components/platform";

interface RegisterI {
	first_name: string;
	last_name: string;
	username: string;
	email: string;
	password: string;
}

const Register: React.FC = () => {
	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		control,
		formState: { errors },
	} = useForm<RegisterI>();

	const toast = useToast();

	const submitHandler: SubmitHandler<RegisterI> = async data => {
		Keyboard.dismiss();
		try {
			const response = await axiosInstance.post("/users/register", data);
			if (Math.trunc(response.status / 100) == 2) {
				toast.show({
					placement: "top",
					render: ToastFactory({
						title: "Successfully Registered!",
						message: "Please login with your credentials.",
						action: "success",
					}),
				});
				router.navigate("/");
			}
		} catch (error: any) {
			console.log(error);
			errorToast(toast, error);
		}
	};

	const required = "This field is required";

	//reactive object to determine discrete sizing
	const size = useMedia();

	const rowProps: StyledComponentProps<StyleProp<ViewStyle>, unknown, ViewProps, "Box"> = {
		flexDirection: size.sm ? "row" : "column",
		columnGap: "$3",
		rowGap: "$2",
		alignItems: size.sm ? "flex-end" : "stretch",
		justifyContent: "center",
		alignContent: "center",
	};

	const formAndFlex = {
		control,
		fieldErrors: errors,
		flexState: isWeb || size.sm,
	};

	return (
		<Box height="100%" justifyContent="center" flexDirection="row" marginHorizontal="$5">
			<Box justifyContent="center" flexGrow={1} maxWidth={600}>
				<Heading>Register</Heading>
				<Box {...rowProps}>
					<FormInput
						labelText="First Name"
						{...formAndFlex}
						inputProps={{ ...register("first_name", { required }) }}
					/>
					<FormInput
						labelText="Last Name"
						{...formAndFlex}
						inputProps={{ ...register("last_name", { required }) }}
					/>
				</Box>
				<Box {...rowProps}>
					<FormInput
						labelText="Email"
						{...formAndFlex}
						inputProps={{ ...register("email", { validate, required }) }}
					/>
					<FormInput
						labelText="Username"
						{...formAndFlex}
						inputProps={{ ...register("username", { required }) }}
					/>
				</Box>
				<Box {...rowProps}>
					<FormInput
						labelText="Password"
						{...formAndFlex}
						inputProps={{
							...register("password", {
								required,
								pattern: {
									message:
										"Password needs at 8 characters with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character",
									value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/,
								},
							}),
						}}
						showText={false}
					/>
					<Box flex={1} marginTop="$6">
						<Button onPress={handleSubmit(submitHandler)}>
							<ButtonText>Register</ButtonText>
						</Button>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default Register;
