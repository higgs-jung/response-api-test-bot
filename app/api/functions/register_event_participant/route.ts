import { NextRequest } from "next/server";

// 임시 참가자 데이터 저장을 위한 배열
// 실제 구현에서는 데이터베이스를 사용해야 합니다
export const eventParticipants: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_type,
      name,
      company,
      position,
      phone,
      email,
      sheet_name = "참가자명단",
    } = body;

    // 필수 필드 검증
    if (!event_type || !name || !email || !phone) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "필수 정보가 누락되었습니다. 행사 종류, 이름, 이메일, 연락처는 필수입니다.",
        }),
        { status: 400 }
      );
    }

    // 행사 종류 검증
    if (event_type !== "Fuji Summit Camp" && event_type !== "Pangyo BootCamp") {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "유효하지 않은 행사 종류입니다. 'Fuji Summit Camp' 또는 'Pangyo BootCamp'로 입력해주세요.",
        }),
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingParticipant = eventParticipants.find(
      (p) => p.email === email && p.event_type === event_type
    );
    if (existingParticipant) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "이미 등록된 이메일입니다.",
          participant_id: existingParticipant.id,
        }),
        { status: 409 }
      );
    }

    // 새 참가자 생성
    const newParticipant = {
      id: `part_${Date.now()}${Math.floor(Math.random() * 1000)}`,
      event_type,
      name,
      company: company || "",
      position: position || "",
      phone,
      email,
      sheet_name,
      registration_date: new Date().toISOString(),
      status: "registered",
    };

    // 참가자 배열에 추가
    eventParticipants.push(newParticipant);

    // 구글 스프레드시트에 참가자 정보 저장
    try {
      // 직접 구글 시트 API 사용
      const response = await fetch(`/api/proxy/sheets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sheet: sheet_name || "참가자명단",
          data: {
            이름: name,
            회사: company || "",
            직함: position || "",
            연락처: phone,
            이메일: email,
            행사: event_type,
            등록일: new Date().toISOString().split("T")[0], // YYYY-MM-DD
            참가자ID: newParticipant.id,
            상태: "등록완료",
          },
        }),
      });

      if (!response.ok) {
        console.error(`스프레드시트 저장 오류: ${response.status}`);
        // 스프레드시트 저장 실패해도 사용자에게는 일단 성공으로 응답
      }
    } catch (sheetError) {
      console.error("스프레드시트 저장 중 오류 발생:", sheetError);
      // 스프레드시트 저장 실패해도 사용자에게는 일단 성공으로 응답
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${event_type} 참가자 등록이 완료되었습니다.`,
        participant_id: newParticipant.id,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("참가자 등록 중 오류 발생:", error);
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

// 참가자 정보 조회용 GET 엔드포인트
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const participantId = searchParams.get("participant_id");
  const eventType = searchParams.get("event_type");
  const email = searchParams.get("email");

  try {
    // 이메일로 참가자 조회
    if (email && eventType) {
      const participant = eventParticipants.find(
        (p) => p.email === email && p.event_type === eventType
      );

      if (!participant) {
        // 스프레드시트에서 조회 시도
        try {
          const response = await fetch(`/api/proxy/sheets?sheet=참가자명단`, {
            method: "GET",
          });

          if (response.ok) {
            const result = await response.json();
            if (result.data && Array.isArray(result.data)) {
              // 스프레드시트에서 해당 이메일과 행사 유형으로 참가자 검색
              const foundParticipant = result.data.find((row: any[]) => {
                const emailIndex = result.headers.indexOf("이메일");
                const eventTypeIndex = result.headers.indexOf("행사");
                return (
                  emailIndex >= 0 &&
                  eventTypeIndex >= 0 &&
                  row[emailIndex] === email &&
                  row[eventTypeIndex] === eventType
                );
              });

              if (foundParticipant) {
                const participantData: Record<string, any> = {};
                result.headers.forEach((header: string, index: number) => {
                  participantData[header] = foundParticipant[index];
                });

                return new Response(
                  JSON.stringify({
                    success: true,
                    participant: participantData,
                    source: "spreadsheet",
                  }),
                  { status: 200 }
                );
              }
            }
          }
        } catch (sheetError) {
          console.error("스프레드시트 조회 중 오류 발생:", sheetError);
        }

        return new Response(
          JSON.stringify({
            success: false,
            error: "참가자를 찾을 수 없습니다.",
          }),
          { status: 404 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          participant,
          source: "memory",
        }),
        { status: 200 }
      );
    }

    // 특정 참가자 조회
    if (participantId) {
      const participant = eventParticipants.find((p) => p.id === participantId);
      if (!participant) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "참가자를 찾을 수 없습니다.",
          }),
          { status: 404 }
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          participant,
        }),
        { status: 200 }
      );
    }

    // 특정 행사의 모든 참가자 조회
    if (eventType) {
      // 메모리에서 참가자 조회
      const memoryParticipants = eventParticipants.filter(
        (p) => p.event_type === eventType
      );

      // 스프레드시트에서 추가 참가자 조회 시도
      try {
        const response = await fetch(`/api/proxy/sheets?sheet=참가자명단`, {
          method: "GET",
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            const eventTypeIndex = result.headers.indexOf("행사");
            const emailIndex = result.headers.indexOf("이메일");

            if (eventTypeIndex >= 0 && emailIndex >= 0) {
              const sheetParticipants = result.data
                .filter((row: any[]) => row[eventTypeIndex] === eventType)
                .map((row: any[]) => {
                  const participant: Record<string, any> = {
                    source: "spreadsheet",
                  };
                  result.headers.forEach((header: string, index: number) => {
                    participant[header] = row[index];
                  });
                  return participant;
                })
                // 이미 메모리에 있는 참가자는 제외
                .filter(
                  (p: any) =>
                    !memoryParticipants.some((mp) => mp.email === p.이메일)
                );

              // 메모리와 스프레드시트의 참가자 합치기
              const allParticipants = [
                ...memoryParticipants,
                ...sheetParticipants,
              ];

              return new Response(
                JSON.stringify({
                  success: true,
                  participants: allParticipants,
                  count: allParticipants.length,
                  memory_count: memoryParticipants.length,
                  sheet_count: sheetParticipants.length,
                }),
                { status: 200 }
              );
            }
          }
        }
      } catch (sheetError) {
        console.error("스프레드시트 조회 중 오류 발생:", sheetError);
      }

      // 스프레드시트 조회에 실패한 경우 메모리 데이터만 반환
      return new Response(
        JSON.stringify({
          success: true,
          participants: memoryParticipants,
          count: memoryParticipants.length,
          source: "memory_only",
        }),
        { status: 200 }
      );
    }

    // 전체 참가자 목록 (관리자용)
    return new Response(
      JSON.stringify({
        success: true,
        participants: eventParticipants,
        count: eventParticipants.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("참가자 조회 중 오류 발생:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "참가자 정보 조회 중 오류가 발생했습니다.",
      }),
      { status: 500 }
    );
  }
}
