module.exports = function (api) {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"],
		plugins: [
			"react-native-reanimated/plugin",
			[
				"transform-inline-environment-variables",
				{
					include: ["NODE_ENV", "SERVER_IP", "EXPO_ENV"],
				},
			],
		],
	};
};
