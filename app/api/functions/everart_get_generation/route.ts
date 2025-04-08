import { NextRequest, NextResponse } from "next/server";

/**
 * EverArt 이미지 생성 상태 조회 API 함수
 *
 * GET 요청을 처리하여 EverArt API로부터 이미지 생성 상태를 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // URL에서 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const generationId = searchParams.get("generationId");
    // API 키가 제공되지 않은 경우 기본값 사용
    const apiKey =
      searchParams.get("apiKey") ||
      "everart-yV3kMUUXTrYIJ0kblxKFtaog-7aGM04Gi07N6G5ovsc";

    // 필수 파라미터 검증
    if (!generationId) {
      return NextResponse.json(
        {
          success: false,
          error: "생성 ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

    console.log("EverArt 이미지 생성 상태 조회 요청:", { generationId });

    try {
      // 내장 fetch API 사용
      const everartResponse = await fetch(
        `https://api.everart.ai/v1/generations/${generationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          cache: "no-store",
        }
      );

      if (!everartResponse.ok) {
        const errorData = await everartResponse.json();
        console.error("EverArt API 오류:", errorData);

        return NextResponse.json(
          {
            success: false,
            error: "EverArt API 요청 실패",
            details: errorData,
          },
          { status: everartResponse.status }
        );
      }

      const data = await everartResponse.json();
      console.log(
        "EverArt 이미지 생성 상태 조회 성공:",
        data.generation?.status || "상태 정보 없음"
      );

      // 응답 반환
      return NextResponse.json({
        success: true,
        data: data,
      });
    } catch (fetchError: any) {
      console.error("EverArt API 통신 오류:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: "EverArt API 통신 중 오류가 발생했습니다.",
          details: fetchError.message,
        },
        { status: 500 }
      );
    }
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
