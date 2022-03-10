export const getUsdSchema = {
	querystring: {
		additionalProperties: false,
		required: [
			'user_id',
		],
		properties: {
			user_id: { type: 'number' },
		},
	},
};
