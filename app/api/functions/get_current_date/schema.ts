import { z } from "zod";

// 파라미터 스키마 정의
export const ParamsSchema = z.object({}).strict();

// 응답 스키마 정의
export const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    current_date: z.string(),
    timestamp: z.number(),
    iso_string: z.string(),
  }),
  message: z.string(),
});

// OpenAI 함수 정의
export const functionDefinition = {
  name: "get_current_date",
  description: "현재 날짜를 가져옵니다. 행사 회차를 판단하는 데 사용됩니다.",
  parameters: {
    type: "object",
    properties: {},
    additionalProperties: false,
    required: [],
  },
};
