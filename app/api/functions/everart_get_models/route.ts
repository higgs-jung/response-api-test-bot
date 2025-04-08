import { NextRequest, NextResponse } from "next/server";

/**
 * EverArt 모델 목록 조회 API 함수
 *
 * GET 요청을 처리하여 EverArt API로부터 모델 목록을 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // URL에서 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "20";
    const beforeId = searchParams.get("beforeId") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    // API 키가 제공되지 않은 경우 기본값 사용
    const apiKey =
      searchParams.get("apiKey") ||
      "everart-yV3kMUUXTrYIJ0kblxKFtaog-7aGM04Gi07N6G5ovsc";

    console.log("EverArt 모델 목록 조회 요청");

    // 쿼리 파라미터 구성
    let url = `https://api.everart.ai/v1/models?limit=${limit}`;

    if (beforeId) {
      url += `&before_id=${beforeId}`;
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    if (status) {
      url += `&status=${status}`;
    }

    // API 요청 세부 정보 로깅
    console.log("EverArt API 요청 세부 정보:", {
      url: url,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    try {
      // 내장 fetch API 사용
      const everartResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      });

      // 응답 상태 및 헤더 로깅
      console.log(
        "EverArt API 응답 상태:",
        everartResponse.status,
        everartResponse.statusText
      );
      console.log(
        "EverArt API 응답 헤더:",
        Object.fromEntries(everartResponse.headers.entries())
      );

      // 응답 텍스트로 먼저 가져와서 로깅
      const responseText = await everartResponse.text();
      console.log(
        "EverArt API 응답 본문 일부:",
        responseText.substring(0, 150)
      );

      if (!everartResponse.ok) {
        let errorDetails;
        try {
          // JSON 파싱 시도
          errorDetails = JSON.parse(responseText);
        } catch (e) {
          // HTML이나 다른 형식인 경우
          errorDetails = { raw: responseText.substring(0, 500) };
        }

        console.error("EverArt API 오류:", errorDetails);

        return NextResponse.json(
          {
            success: false,
            error: "EverArt API 요청 실패",
            details: errorDetails,
            status: everartResponse.status,
            statusText: everartResponse.statusText,
          },
          { status: everartResponse.status }
        );
      }

      // 성공 응답 파싱
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return NextResponse.json(
          {
            success: false,
            error: "EverArt API에서 유효하지 않은 JSON 응답",
            details: responseText.substring(0, 500),
          },
          { status: 500 }
        );
      }

      console.log("EverArt 모델 목록 조회 성공");

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
    console.error("EverArt 모델 목록 조회 오류:", error);

    return NextResponse.json(
      {
        success: false,
        error: "모델 목록 조회 중 오류가 발생했습니다.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
