export const userBodyRequestLoginSchema = {
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: {
        type: "string",
      },
      password: {
        type: "string",
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            username: {
              type: "string",
            },
            type: {
              type: "number",
            },
            role: {
              type: "string",
            },
            count: {
              type: "string",
            },
          },
        },
        menus: {
          type: "array",
        },
        token: {
          type: "string",
        },
      },
    },
  },
};

export const userGetAllListSchema = {
  query: {
    type: "object",
    preoperties: {
      limit: {
        type: "number",
      },
      page: {
        type: "number",
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        users: {
          type: "array",
          properties: {
            id: {
              type: "number",
            },
            username: {
              type: "string",
            },
            role: {
              type: "string",
            },
            orders: {
              type: "number",
            },
          },
        },
        user_count: {
          type: "number",
        },
      },
      additionalProperties: false,
    },
  },
};

export const userBodyRequestUpdateSchema = {
  body: {
    type: "object",
    required: ["username"],
    properties: {
      id: {
        type: "number",
      },
      username: {
        type: "string",
      },
      password: {
        type: "string",
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: {
          type: "string",
        },
      },
    },
  },
};

export const userBodyReguestCreateSchema = {
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: {
        type: "string",
      },
      password: {
        type: "string",
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: {
          type: "string",
        },
      },
    },
  },
};

export const userDeleteByIdSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        message: {
          type: "string",
        },
      },
    },
  },
};
