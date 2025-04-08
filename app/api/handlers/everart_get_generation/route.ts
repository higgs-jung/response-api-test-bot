import { NextRequest, NextResponse } from "next/server";

/**
 * EverArt 이미지 생성 상태 조회 API 핸들러
 *
 * GET 요청을 처리하여 EverArt API로부터 이미지 생성 상태를 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // URL에서 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const apiKey = searchParams.get("apiKey");
    const generationId = searchParams.get("generationId");

    // 필수 파라미터 검증
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "API 키가 필요합니다.",
        },
        { status: 400 }
      );
    }

    if (!generationId) {
      return NextResponse.json(
        {
          success: false,
          error: "생성 ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

    // EverArt API 호출
    const everartResponse = await fetch(
      `https://api.everart.cloud/v1/generations/${generationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
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
    console.error("EverArt 이미지 생성 상태 조회 오류:", error);

    return NextResponse.json(
      {
        success: false,
        error: "이미지 생성 상태 조회 중 오류가 발생했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
