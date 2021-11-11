export const createOrderSchema = {
	body: {
		type: "object",
		required: [
			"type",
			"payment",
			"delivery",
			"weight",
			"category",
			"description",
			"title",
			"price",
			"amount",
			"cost",
		],
		properties: {
			type: { type: "number" },
			payment: { type: "number" },
			delivery: { type: "number" },
			weight: { type: "number" },
			category: { type: "number" },
			description: { type: "string" },
			title: { type: "string" },
			price: { type: "number" },
			amount: { type: "number" },
			cost: { type: "number" },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				message: {
					type: "string",
				},
				id: {
					type: "number"
				}
			},
		},
	},
};
