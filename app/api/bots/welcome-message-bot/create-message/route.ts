import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 요청 스키마 정의
const requestSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다."),
  organization: z.string().min(1, "소속은 필수입니다."),
  title: z.string().optional(),
  style: z
    .enum(["formal", "casual", "humorous", "motivational"])
    .default("formal"),
  occasion: z.string().default("입사"),
});

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();

    // 요청 검증
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "유효하지 않은 요청 형식입니다.",
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, organization, title, style, occasion } = result.data;

    // 프롬프트 구성
    const systemPrompt = `
      당신은 환영 메시지를 작성하는 전문가입니다. 
      다음 정보를 바탕으로 ${style} 스타일의 환영 메시지를 작성해주세요:
      - 이름: ${name}
      - 소속: ${organization}
      ${title ? `- 직함/역할: ${title}` : ""}
      - 상황: ${occasion}
      
      메시지는 간결하고 진심 어린 내용으로 작성하며, 200자 내외로 작성해주세요.
      한국어로 작성해주세요.
    `;

    // OpenAI API를 사용하여 메시지 생성
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `${name}님의 ${organization} ${occasion}을 환영하는 메시지를 작성해주세요.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const welcomeMessage = response.choices[0].message.content.trim();

    return NextResponse.json({
      success: true,
      data: {
        welcomeMessage,
        name,
        organization,
        style,
        occasion,
      },
      message: "환영 메시지가 생성되었습니다.",
    });
  } catch (error: any) {
    console.error("메시지 생성 에러:", error);

    return NextResponse.json(
      {
        success: false,
        error: "환영 메시지 생성 중 오류가 발생했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
