
export const getTokensSchema = {
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

export const postTokensSchema = {
	body: {
		type: 'object',
		additionalProperties: false,
		required: [
			'user_id',
			'tokens',
		],
		properties: {
			user_id: { type: 'number' },
			tokens: {
				type: 'number',
				minimum: 0,
				maximum: 5,
			},
		},
	},
};
