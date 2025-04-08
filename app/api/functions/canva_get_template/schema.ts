import { z } from "zod";

// 파라미터 스키마 정의
export const ParamsSchema = z
  .object({
    templateId: z.string().min(1, "템플릿 ID는 필수입니다"),
    accessToken: z.string().min(1, "액세스 토큰은 필수입니다"),
  })
  .strict();

// 응답 스키마 정의
export const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    dataset: z.any(),
  }),
  message: z.string(),
});

// OpenAI 함수 정의
export const functionDefinition = {
  name: "canva_get_template",
  description: "Canva 브랜드 템플릿의 데이터셋 정보를 조회합니다.",
  parameters: {
    type: "object",
    properties: {
      templateId: {
        type: "string",
        description: "Canva 브랜드 템플릿 ID",
      },
      accessToken: {
        type: "string",
        description: "Canva API 액세스 토큰",
      },
    },
    additionalProperties: false,
    required: ["templateId", "accessToken"],
  },
};
