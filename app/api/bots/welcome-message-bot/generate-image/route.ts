import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 요청 스키마 정의
const requestSchema = z.object({
  prompt: z.string().min(1, "이미지 프롬프트는 필수입니다."),
  size: z.enum(["1024x1024", "1024x1792", "1792x1024"]).default("1024x1024"),
  style: z.enum(["vivid", "natural"]).default("vivid"),
  quality: z.enum(["standard", "hd"]).default("standard"),
});

// GET 핸들러 추가
export async function GET(request: NextRequest) {
  try {
    // URL에서 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const prompt = searchParams.get("prompt");
    const size = (searchParams.get("size") as any) || "1024x1024";
    const style = (searchParams.get("style") as any) || "vivid";
    const quality = (searchParams.get("quality") as any) || "standard";

    // 프롬프트 필수 체크
    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "이미지 프롬프트는 필수입니다.",
        },
        { status: 400 }
      );
    }

    // 데이터 검증
    const result = requestSchema.safeParse({ prompt, size, style, quality });
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

    // DALL-E 3 모델을 사용하여 이미지 생성
    console.log("DALL-E API 호출 - 프롬프트:", prompt);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      style,
      quality,
      response_format: "url",
    });

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;

    // 상세 로그 추가
    console.log("이미지 생성 성공 - 크기:", size, "스타일:", style);

    // 원본 응답 로깅 (중요: 민감 정보 제외)
    console.log(
      "DALL-E API 원본 응답 구조:",
      JSON.stringify(
        {
          created: response.created,
          model: "dall-e-3",
          data: response.data.map((item) => ({
            url: item.url,
            revised_prompt: item.revised_prompt,
          })),
        },
        null,
        2
      )
    );

    // 활용 방법 로깅
    console.log("이미지 URL 생성됨 (만료 시간: 약 1년)");
    console.log("마크다운 사용 예시:", `![환영 이미지](${imageUrl})`);

    // API 문서 참조 로깅
    console.log(
      "API 참조: https://platform.openai.com/docs/api-reference/images/create"
    );

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        revisedPrompt,
        markdownImage: `![환영 이미지](${imageUrl})`,
        warning: "이 이미지 URL은 약 1년 동안 유효합니다.",
      },
      message: "환영 이미지가 성공적으로 생성되었습니다.",
    });
  } catch (error: any) {
    console.error("이미지 생성 에러:", error);

    return NextResponse.json(
      {
        success: false,
        error: "이미지 생성 중 오류가 발생했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST 핸들러 유지
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

    const { prompt, size, style, quality } = result.data;

    // DALL-E 3 모델을 사용하여 이미지 생성
    console.log("DALL-E API 호출 - 프롬프트:", prompt);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      style,
      quality,
      response_format: "url",
    });

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;

    // 상세 로그 추가
    console.log("이미지 생성 성공 - 크기:", size, "스타일:", style);

    // 원본 응답 로깅 (중요: 민감 정보 제외)
    console.log(
      "DALL-E API 원본 응답 구조:",
      JSON.stringify(
        {
          created: response.created,
          model: "dall-e-3",
          data: response.data.map((item) => ({
            url: item.url,
            revised_prompt: item.revised_prompt,
          })),
        },
        null,
        2
      )
    );

    // 활용 방법 로깅
    console.log("이미지 URL 생성됨 (만료 시간: 약 1년)");
    console.log("마크다운 사용 예시:", `![환영 이미지](${imageUrl})`);

    // API 문서 참조 로깅
    console.log(
      "API 참조: https://platform.openai.com/docs/api-reference/images/create"
    );

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        revisedPrompt,
        markdownImage: `![환영 이미지](${imageUrl})`,
        warning: "이 이미지 URL은 약 1년 동안 유효합니다.",
      },
      message: "환영 이미지가 성공적으로 생성되었습니다.",
    });
  } catch (error: any) {
    console.error("이미지 생성 에러:", error);

    return NextResponse.json(
      {
        success: false,
        error: "이미지 생성 중 오류가 발생했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
