import { z } from "zod";

// 파라미터 스키마 정의
export const ParamsSchema = z
  .object({
    apiKey: z.string().min(1, "API 키는 필수입니다"),
    limit: z.string().optional(),
    beforeId: z.string().optional(),
    search: z.string().optional(),
    status: z
      .enum([
        "PENDING",
        "PROCESSING",
        "TRAINING",
        "READY",
        "FAILED",
        "CANCELED",
      ])
      .optional(),
  })
  .strict();

// 응답 스키마 정의
export const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string(),
});

// OpenAI 함수 정의
export const functionDefinition = {
  name: "everart_get_models",
  description: "EverArt API에서 사용 가능한 모델 목록을 조회합니다.",
  parameters: {
    type: "object",
    properties: {
      apiKey: {
        type: "string",
        description: "EverArt API 키",
      },
      limit: {
        type: "string",
        description: "반환할 최대 모델 수 (기본값: 20)",
      },
      beforeId: {
        type: "string",
        description: "페이지네이션을 위한 이전 모델 ID",
      },
      search: {
        type: "string",
        description: "모델 이름으로 검색할 키워드",
      },
      status: {
        type: "string",
        enum: [
          "PENDING",
          "PROCESSING",
          "TRAINING",
          "READY",
          "FAILED",
          "CANCELED",
        ],
        description: "모델 상태에 따른 필터링",
      },
    },
    additionalProperties: false,
    required: ["apiKey"],
  },
};
