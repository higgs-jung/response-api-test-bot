import { z } from "zod";

// 파라미터 스키마 정의
export const ParamsSchema = z
  .object({
    modelId: z.string().min(1, "모델 ID는 필수입니다"),
    prompt: z.string().min(1, "프롬프트는 필수입니다"),
    type: z.enum(["txt2img", "img2img"]).optional(),
    imageCount: z.number().min(1).max(10).optional(),
    height: z.number().optional(),
    width: z.number().optional(),
    apiKey: z.string().min(1, "API 키는 필수입니다"),
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
  name: "everart_generate_image",
  description:
    "EverArt API를 사용하여 텍스트 프롬프트를 기반으로 이미지를 생성합니다.",
  parameters: {
    type: "object",
    properties: {
      modelId: {
        type: "string",
        description: "EverArt의 모델 ID",
      },
      prompt: {
        type: "string",
        description: "이미지 생성에 사용할 텍스트 프롬프트",
      },
      type: {
        type: "string",
        enum: ["txt2img", "img2img"],
        description: "생성 유형 (기본값: txt2img)",
      },
      imageCount: {
        type: "number",
        description: "생성할 이미지 수 (1-10, 기본값: 1)",
      },
      height: {
        type: "number",
        description: "이미지 높이 (기본값: 1024)",
      },
      width: {
        type: "number",
        description: "이미지 너비 (기본값: 1024)",
      },
      apiKey: {
        type: "string",
        description: "EverArt API 키",
      },
    },
    additionalProperties: false,
    required: ["modelId", "prompt", "apiKey"],
  },
};
