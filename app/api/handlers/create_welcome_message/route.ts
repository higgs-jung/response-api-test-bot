import { NextResponse } from "next/server";
import OpenAI from "openai";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 환영 메시지 생성 API 핸들러
 */
export async function POST(request: Request) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { name, organization, title, style, occasion } = body;

    // 필수 파라미터 확인
    if (!name || !organization) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "필수 정보가 누락되었습니다. 이름과 소속 정보를 제공해주세요.",
          },
        },
        { status: 400 }
      );
    }

    // 선택적 파라미터에 기본값 설정
    const userTitle = title || "";
    const messageStyle = style || "formal";
    const welcomeOccasion = occasion || "입사";

    // 프롬프트 구성
    const systemPrompt = `
      당신은 환영 메시지를 작성하는 전문가입니다. 
      다음 정보를 바탕으로 ${messageStyle} 스타일의 환영 메시지를 작성해주세요:
      - 이름: ${name}
      - 소속: ${organization}
      ${userTitle ? `- 직함/역할: ${userTitle}` : ""}
      - 상황: ${welcomeOccasion}
      
      메시지는 간결하고 진심 어린 내용으로 작성하며, 200자 내외로 작성해주세요.
      한국어로 작성해주세요.
    `;

    console.log("메시지 생성 요청:", {
      name,
      organization,
      title: userTitle,
      style: messageStyle,
      occasion: welcomeOccasion,
    });

    // OpenAI API 호출
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `${name}님의 ${organization} ${welcomeOccasion}을 환영하는 메시지를 작성해주세요.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    // 응답 처리
    const welcomeMessage = response.choices[0].message.content?.trim();

    // 결과 반환
    return NextResponse.json({
      success: true,
      data: {
        welcomeMessage,
        name,
        organization,
        style: messageStyle,
        occasion: welcomeOccasion,
      },
      message: "환영 메시지가 생성되었습니다.",
    });
  } catch (error) {
    console.error("서버 메시지 생성 에러:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "환영 메시지 생성 중 오류가 발생했습니다.",
          details: error instanceof Error ? error.message : "알 수 없는 오류",
        },
      },
      { status: 500 }
    );
  }
}
 