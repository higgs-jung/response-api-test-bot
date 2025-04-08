import { NextResponse } from "next/server";
import OpenAI from "openai";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 유효한 이미지 크기인지 확인하는 함수
 */
function validateSize(size: string | undefined): string | null {
  const validSizes = ["1024x1024", "1024x1792", "1792x1024"];

  if (!size || typeof size !== "string") {
    return null;
  }

  if (validSizes.includes(size)) {
    return size;
  }

  return null;
}

/**
 * 환영 이미지 생성 API 핸들러
 */
export async function POST(request: Request) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { prompt, size, style, quality } = body;

    // 필수 파라미터 확인
    if (!prompt || prompt.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: { message: "이미지 프롬프트가 비어 있습니다." },
        },
        { status: 400 }
      );
    }

    // 프롬프트 개선
    const enhancedPrompt = `웰컴메시지 이미지: "${prompt}". 텍스트를 명확하게 보여주고, 환영하는 분위기의 전문적인 디자인으로 표현해주세요.`;

    // 기본 파라미터 설정
    const validatedSize = validateSize(size) || "1792x1024";
    const imageStyle = style || "vivid";
    const imageQuality = quality || "standard";

    console.log("이미지 생성 요청:", {
      prompt: enhancedPrompt,
      size: validatedSize,
      style: imageStyle,
      quality: imageQuality,
    });

    // DALL-E 3 API 호출 - URL 형식으로 반환
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: validatedSize as any,
      style: imageStyle as any,
      quality: imageQuality as any,
      response_format: "url", // URL 형식으로 응답 받음
    });

    // 응답 처리
    const imageUrl = response.data[0]?.url;
    const revisedPrompt = response.data[0]?.revised_prompt || enhancedPrompt;

    // 이미지 URL 검증
    if (!imageUrl) {
      throw new Error("유효한 이미지 URL이 생성되지 않았습니다.");
    }

    // 결과 반환
    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        revisedPrompt,
        markdownImage: `![환영 이미지](${imageUrl})`,
        warning:
          "이 이미지 URL은 1시간 후에 만료됩니다. 필요한 경우 이미지를 다운로드하여 저장하세요.",
      },
      message: "환영 이미지가 성공적으로 생성되었습니다.",
    });
  } catch (error) {
    console.error("서버 이미지 생성 에러:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: "이미지 생성 중 오류가 발생했습니다.",
          details: error instanceof Error ? error.message : "알 수 없는 오류",
        },
      },
      { status: 500 }
    );
  }
}
