import { z } from "zod";

// 파라미터 스키마 정의
export const ParamsSchema = z
  .object({
    name: z.string().min(1, "모델 이름은 필수입니다"),
    subject: z.enum(["STYLE", "PERSON", "OBJECT"]),
    imageUrls: z.array(z.string().url()).min(1).max(25).optional(),
    imageUploadTokens: z.array(z.string()).min(1).max(25).optional(),
    webhookUrl: z.string().url().optional(),
    apiKey: z.string().min(1, "API 키는 필수입니다"),
  })
  .strict()
  .refine((data) => data.imageUrls || data.imageUploadTokens, {
    message: "이미지 URL 또는 업로드 토큰이 필요합니다",
    path: ["imageUrls", "imageUploadTokens"],
  });

// 응답 스키마 정의
export const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string(),
});

// OpenAI 함수 정의
export const functionDefinition = {
  name: "everart_create_model",
  description: "EverArt API에 새로운 모델을 생성합니다.",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "생성할 모델의 이름",
      },
      subject: {
        type: "string",
        enum: ["STYLE", "PERSON", "OBJECT"],
        description: "모델의 주제 유형",
      },
      imageUrls: {
        type: "array",
        items: {
          type: "string",
        },
        description: "모델 학습에 사용할 이미지 URL 배열 (1-25개)",
      },
      imageUploadTokens: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "/images/uploads 엔드포인트에서 얻은 업로드 토큰 배열 (1-25개)",
      },
      webhookUrl: {
        type: "string",
        description: "상태 업데이트를 받을 웹훅 URL (선택사항)",
      },
      apiKey: {
        type: "string",
        description: "EverArt API 키",
      },
    },
    additionalProperties: false,
    required: ["name", "subject", "apiKey"],
  },
};
