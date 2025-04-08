import { z } from "zod";

// 파라미터 스키마 정의
export const ParamsSchema = z
  .object({
    apiKey: z.string().min(1, "API 키는 필수입니다"),
    generationId: z.string().min(1, "생성 ID는 필수입니다"),
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
  name: "everart_get_generation",
  description: "EverArt API에서 생성된 이미지의 정보를 조회합니다.",
  parameters: {
    type: "object",
    properties: {
      apiKey: {
        type: "string",
        description: "EverArt API 키",
      },
      generationId: {
        type: "string",
        description: "조회할 생성 ID",
      },
    },
    additionalProperties: false,
    required: ["apiKey", "generationId"],
  },
};
