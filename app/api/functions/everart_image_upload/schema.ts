import { z } from "zod";

// 이미지 스키마
const ImageSchema = z.object({
  filename: z.string().min(1, "파일명은 필수입니다"),
  content_type: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ]),
  id: z.string().optional(),
});

// 파라미터 스키마 정의
export const ParamsSchema = z
  .object({
    images: z.array(ImageSchema).min(1).max(30),
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
  name: "everart_image_upload",
  description: "EverArt API에 이미지를 업로드하기 위한 URL을 생성합니다.",
  parameters: {
    type: "object",
    properties: {
      images: {
        type: "array",
        items: {
          type: "object",
          properties: {
            filename: {
              type: "string",
              description: "업로드할 이미지의 파일명",
            },
            content_type: {
              type: "string",
              enum: [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/heic",
                "image/heif",
              ],
              description: "이미지의 콘텐츠 타입",
            },
            id: {
              type: "string",
              description: "클라이언트 제공 ID (선택사항)",
            },
          },
          required: ["filename", "content_type"],
        },
        description: "업로드할 이미지 정보 배열 (1-30개)",
      },
      apiKey: {
        type: "string",
        description: "EverArt API 키",
      },
    },
    additionalProperties: false,
    required: ["images", "apiKey"],
  },
};
