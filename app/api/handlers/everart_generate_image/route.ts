import { NextRequest, NextResponse } from "next/server";

/**
 * EverArt 이미지 생성 API 핸들러
 *
 * POST 요청을 처리하여 EverArt API로 이미지 생성 요청을 전달합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { prompt, modelId, imageCount, apiKey } = body;

    // 필수 파라미터 검증
    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "이미지 생성 프롬프트가 필요합니다.",
        },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API 키가 필요합니다.",
        },
        { status: 400 }
      );
    }

    // EverArt API 호출
    const everartResponse = await fetch(
      "https://api.everart.cloud/v1/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model_id: modelId || "259826230810001408",
          prompt: prompt,
          image_count: imageCount || 1,
          type: "txt2img",
        }),
      }
    );

    const data = await everartResponse.json();

    if (!everartResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "EverArt API 요청 실패",
          details: data,
        },
        { status: everartResponse.status }
      );
    }

    // 응답 반환
    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    console.error("EverArt 이미지 생성 오류:", error);

    return NextResponse.json(
      {
        success: false,
        error: "이미지 생성 처리 중 오류가 발생했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
