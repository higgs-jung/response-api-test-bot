import { z } from "zod";

// 파라미터 스키마 정의
export const ParamsSchema = z
  .object({
    templateId: z.string().min(1, "템플릿 ID는 필수입니다"),
    fields: z.record(z.string(), z.string()).optional(),
    accessToken: z.string().min(1, "액세스 토큰은 필수입니다"),
  })
  .strict();

// 응답 스키마 정의
export const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    dataset: z.any(),
    job: z.any(),
    design: z.any().nullable(),
  }),
  message: z.string(),
});

// OpenAI 함수 정의
export const functionDefinition = {
  name: "canva_autofill",
  description: "Canva 브랜드 템플릿을 자동으로 채우고 디자인을 생성합니다.",
  parameters: {
    type: "object",
    properties: {
      templateId: {
        type: "string",
        description: "Canva 브랜드 템플릿 ID",
      },
      fields: {
        type: "object",
        description: "템플릿에 채울 필드 데이터 (키-값 쌍)",
        additionalProperties: {
          type: "string",
        },
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
