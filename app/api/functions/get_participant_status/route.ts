import { NextRequest } from "next/server";

// 참가자 상태 확인 함수
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const eventType = searchParams.get("event_type");

    // 필수 파라미터 확인
    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "이메일은 필수 파라미터입니다.",
        }),
        { status: 400 }
      );
    }

    // 행사 종류 확인 (지정된 경우)
    if (
      eventType &&
      eventType !== "Fuji Summit Camp" &&
      eventType !== "Pangyo BootCamp"
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "유효하지 않은 행사 종류입니다. 'Fuji Summit Camp' 또는 'Pangyo BootCamp'로 입력해주세요.",
        }),
        { status: 400 }
      );
    }

    // 스프레드시트에서 참가자 조회
    try {
      const response = await fetch(`/api/proxy/sheets?sheet=참가자명단`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`스프레드시트 조회 실패: ${response.status}`);
      }

      const result = await response.json();

      if (!result.data || !Array.isArray(result.data) || !result.headers) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "스프레드시트 데이터 형식이 올바르지 않습니다.",
          }),
          { status: 500 }
        );
      }

      // 인덱스 찾기
      const emailIndex = result.headers.indexOf("이메일");
      const eventTypeIndex = result.headers.indexOf("행사");
      const statusIndex = result.headers.indexOf("상태");

      if (emailIndex === -1) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "이메일 필드를 찾을 수 없습니다.",
          }),
          { status: 500 }
        );
      }

      // 참가자 찾기
      let participantData = [];

      for (const row of result.data) {
        // 이메일 일치 여부 확인
        if (row[emailIndex] === email) {
          // 행사 타입 필터 (지정된 경우)
          if (
            eventType &&
            eventTypeIndex !== -1 &&
            row[eventTypeIndex] !== eventType
          ) {
            continue;
          }

          // 참가자 정보 생성
          const participant: Record<string, any> = {};
          result.headers.forEach((header: string, idx: number) => {
            participant[header] = row[idx];
          });

          participantData.push(participant);
        }
      }

      // 결과 반환
      if (participantData.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "해당 이메일로 등록된 참가자를 찾을 수 없습니다.",
          }),
          { status: 404 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          participants: participantData,
          email: email,
          event_type: eventType || "all",
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("참가자 상태 조회 중 오류 발생:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "참가자 정보를 조회하는 중 오류가 발생했습니다.",
          details: error instanceof Error ? error.message : String(error),
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("참가자 상태 조회 중 오류 발생:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "서버 오류가 발생했습니다. 나중에 다시 시도해주세요.",
      }),
      { status: 500 }
    );
  }
}
