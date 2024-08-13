import {
	Box,
	FormControl,
	FormControlError,
	FormControlErrorIcon,
	FormControlErrorText,
	FormControlLabelText,
	Input,
	InputField,
	useMedia,
} from "@gluestack-ui/themed";
import { AlertTriangle } from "lucide-react-native";
import React from "react";
import { Control, Controller, FieldErrors, Path, UseFormRegisterReturn } from "react-hook-form";
import { isWeb } from "./platform";
import { Dimensions } from "react-native";

export interface FormInputI<T extends Record<string, any>> {
	inputProps: UseFormRegisterReturn;
	labelText: string;
	fieldErrors: FieldErrors;
	control: Control<T>;
	formState?: FormState;
	defaultValue?: any;
	showText?: boolean;
	flexState?: boolean
}

export type FormState = {
	isDisabled?: boolean;
	isInvalid?: boolean;
	isReadOnly?: boolean;
	isRequired?: boolean;
};

//reusable form input field

export default function FormInput<T extends Record<string, any>>({
	inputProps,
	labelText,
	fieldErrors,
	control,
	formState = {},
	defaultValue = "",
	showText = true,
	flexState
}: FormInputI<T>) {
	const { name } = inputProps;
	formState.isInvalid = !!fieldErrors[name] || formState.isInvalid;
	return (
		<Box flex={+!!flexState}>
			<FormControl {...formState}>
				<FormControlLabelText>{labelText}</FormControlLabelText>
				<Controller
					name={name as Path<T>}
					defaultValue={defaultValue}
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<Input>
							<InputField
								fontSize="$sm"
								value={value}
								onChangeText={onChange}
								onBlur={onBlur}
								type={showText ? "text" : "password"}
								bgColor="$trueGray50"
							/>
						</Input>
					)}
				/>
				<FormControlError>
					<FormControlErrorIcon size="sm" as={AlertTriangle} mb="auto"/>
					<FormControlErrorText maxWidth={Dimensions.get("window").width * 0.9}>{fieldErrors[name]?.message?.toString()}</FormControlErrorText>
				</FormControlError>
			</FormControl>
		</Box>
	);
}
