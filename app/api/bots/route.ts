import { NextRequest, NextResponse } from "next/server";
import { loadAllBots } from "./core/bot-loader";

/**
 * 모든 봇 목록을 반환하는 API
 */
export async function GET(request: NextRequest) {
  try {
    console.log("봇 목록 API 호출됨", request.url);

    const result = await loadAllBots();

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || result.message,
        },
        { status: 500 }
      );
    }

    // CORS 헤더 추가
    return new NextResponse(JSON.stringify(result.data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("봇 목록 로드 실패:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
