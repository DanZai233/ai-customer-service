export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Luma 客服开放 API",
    version: "1.0.0",
    description:
      "用于从网站、App、企业系统或渠道适配器创建客户会话并追加消息。所有时间均为 ISO 8601。",
  },
  tags: [{ name: "Conversations", description: "客户会话与消息" }],
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/v1/conversations": {
      post: {
        tags: ["Conversations"],
        operationId: "createConversation",
        summary: "创建或复用一个客户会话",
        parameters: [{ $ref: "#/components/parameters/IdempotencyKey" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateConversation" },
            },
          },
        },
        responses: {
          "201": {
            description: "会话已创建",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConversationResponse" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "422": { $ref: "#/components/responses/ValidationError" },
        },
      },
    },
    "/api/v1/conversations/{conversationId}": {
      get: {
        tags: ["Conversations"],
        operationId: "getConversation",
        summary: "获取会话和完整消息记录",
        parameters: [{ $ref: "#/components/parameters/ConversationId" }],
        responses: {
          "200": {
            description: "会话详情",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConversationResponse" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/v1/conversations/{conversationId}/messages": {
      post: {
        tags: ["Conversations"],
        operationId: "createCustomerMessage",
        summary: "向会话追加一条客户消息",
        parameters: [
          { $ref: "#/components/parameters/ConversationId" },
          { $ref: "#/components/parameters/IdempotencyKey" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateMessage" },
            },
          },
        },
        responses: {
          "201": {
            description: "消息已写入",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ConversationResponse" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Luma API Key",
        description: "在开发者中心创建，以 luma_live_ 开头。",
      },
    },
    parameters: {
      ConversationId: {
        name: "conversationId",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
      IdempotencyKey: {
        name: "Idempotency-Key",
        in: "header",
        required: false,
        description: "建议为每个写请求提供唯一值，结果保留 24 小时。",
        schema: { type: "string", maxLength: 120 },
      },
    },
    schemas: {
      CreateConversation: {
        type: "object",
        required: ["customer", "message"],
        properties: {
          externalId: { type: "string", maxLength: 100 },
          channel: { type: "string", enum: ["web", "wechat", "email"] },
          customer: {
            type: "object",
            required: ["name"],
            properties: {
              externalId: { type: "string" },
              name: { type: "string" },
              email: { type: "string", format: "email" },
              phone: { type: "string" },
              city: { type: "string" },
              plan: { type: "string" },
            },
          },
          message: { $ref: "#/components/schemas/CreateMessage" },
          tags: { type: "array", items: { type: "string" } },
        },
      },
      CreateMessage: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", maxLength: 10000 },
          externalId: { type: "string", maxLength: 120 },
          sender: { type: "string", maxLength: 80 },
        },
      },
      ConversationResponse: {
        type: "object",
        required: ["data"],
        properties: {
          data: {
            type: "object",
            required: ["id", "channel", "status", "customer", "messages"],
            properties: {
              id: { type: "string" },
              externalId: { type: ["string", "null"] },
              channel: { type: "string" },
              status: { type: "string" },
              customer: { type: "object" },
              messages: { type: "array", items: { type: "object" } },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
          },
          requestId: { type: "string" },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "API Key 无效",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      ValidationError: {
        description: "请求参数不合法",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      NotFound: {
        description: "资源不存在",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
} as const;
