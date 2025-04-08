import { NextResponse } from "next/server";
import { z } from "zod";

export const config = {
  runtime: "edge",
};

// 파라미터 스키마 정의 (이 함수는 파라미터가 필요 없음)
const ParamsSchema = z.object({}).strict();

export type GetCurrentDateParams = z.infer<typeof ParamsSchema>;

export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 추출
    const url = new URL(request.url);
    const paramsString = url.searchParams.get("params");

    if (!paramsString) {
      return NextResponse.json(
        {
          error: "Params are required",
          status: "error",
        },
        { status: 400 }
      );
    }

    // 파라미터 파싱 및 검증
    const params = JSON.parse(paramsString);
    const validationResult = ParamsSchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid parameters",
          details: validationResult.error.format(),
          status: "error",
        },
        { status: 400 }
      );
    }

    // 현재 날짜 생성 (YYYY-MM-DD 형식)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 1을 더함
    const dd = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${yyyy}-${mm}-${dd}`;

    // 결과 반환
    return NextResponse.json({
      success: true,
      data: {
        current_date: formattedDate,
        timestamp: today.getTime(),
        iso_string: today.toISOString(),
      },
      message: "현재 날짜 정보입니다.",
    });
  } catch (error) {
    console.error("Error in get_current_date:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        status: "error",
      },
      { status: 500 }
    );
  }
}
