import { z } from "zod";

// 파라미터 스키마 정의
export const ParamsSchema = z
  .object({
    accessToken: z.string().min(1, "액세스 토큰은 필수입니다"),
    limit: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
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
  name: "canva_designs_list",
  description: "사용자의 Canva 디자인 목록을 조회합니다.",
  parameters: {
    type: "object",
    properties: {
      accessToken: {
        type: "string",
        description: "Canva API 액세스 토큰",
      },
      limit: {
        type: "string",
        description: "반환할 최대 디자인 수 (기본값: 20)",
      },
      startTime: {
        type: "string",
        description: "조회 시작 시간 (ISO 8601 형식, 예: 2023-01-01T00:00:00Z)",
      },
      endTime: {
        type: "string",
        description: "조회 종료 시간 (ISO 8601 형식, 예: 2023-12-31T23:59:59Z)",
      },
    },
    additionalProperties: false,
    required: ["accessToken"],
  },
};
