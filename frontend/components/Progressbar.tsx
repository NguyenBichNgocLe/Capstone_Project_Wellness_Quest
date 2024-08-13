import { Progress, ProgressFilledTrack } from "@gluestack-ui/themed";
import React, { ComponentProps } from "react";

//absolutely absurd finagling to get typing to work properly
interface ProgressProps extends ComponentProps<typeof Progress> {}
interface TrackProps extends ComponentProps<typeof ProgressFilledTrack> {}

export type ProgressBarType = {
	value: number;
	progressProps?: ProgressProps;
	trackProps?: TrackProps;
};

//progress bar fix for gluestack progress bar

const ProgressBar: React.FC<ProgressBarType> = ({ value, progressProps, trackProps }) => {

	return (
		<Progress value={100} overflow="hidden" {...progressProps}>
			<ProgressFilledTrack
				//@ts-ignore
				marginLeft={`-${100 - value}%`}
				{...trackProps}
			/>
		</Progress>
	);
};

export default ProgressBar;
