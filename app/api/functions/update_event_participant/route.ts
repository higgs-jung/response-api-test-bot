import { NextRequest } from "next/server";

// 참가자 데이터를 register_participant 모듈에서 가져옵니다
let eventParticipants: any[] = [];

try {
  const registerModule = require("../register_event_participant/route");
  if (registerModule && registerModule.eventParticipants) {
    eventParticipants = registerModule.eventParticipants;
  }
} catch (error) {
  console.warn(
    "참가자 데이터를 가져오는데 실패했습니다. 빈 배열을 사용합니다."
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_type,
      name,
      email,
      company,
      position,
      phone,
      sheet_name = "참가자명단",
    } = body;

    // 이메일 필수 확인 - 참가자 식별을 위해
    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "이메일은 참가자 식별을 위해 필수입니다.",
        }),
        { status: 400 }
      );
    }

    // 행사 종류 필수 확인
    if (!event_type) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "행사 종류는 필수입니다.",
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

    // 메모리에서 참가자 찾기
    const participantIndex = eventParticipants.findIndex(
      (p) => p.email === email && p.event_type === event_type
    );

    let participant;
    let participantId;
    let isFromSheet = false;

    // 메모리에 없으면 스프레드시트에서 찾기 시도
    if (participantIndex === -1) {
      try {
        const response = await fetch(`/api/proxy/sheets?sheet=참가자명단`, {
          method: "GET",
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            const emailIndex = result.headers.indexOf("이메일");
            const eventTypeIndex = result.headers.indexOf("행사");
            const participantIdIndex = result.headers.indexOf("참가자ID");

            // 스프레드시트에서 해당 이메일과 행사 유형으로 참가자 검색
            const rowIndex = result.data.findIndex(
              (row: any[]) =>
                emailIndex >= 0 &&
                eventTypeIndex >= 0 &&
                row[emailIndex] === email &&
                row[eventTypeIndex] === event_type
            );

            if (rowIndex >= 0) {
              const row = result.data[rowIndex];
              participant = {};
              result.headers.forEach((header: string, idx: number) => {
                participant[header] = row[idx];
              });

              // 참가자ID 있으면 사용, 없으면 새로 생성
              participantId =
                participantIdIndex >= 0
                  ? row[participantIdIndex]
                  : `part_${Date.now()}${Math.floor(Math.random() * 1000)}`;

              isFromSheet = true;
            }
          }
        }
      } catch (sheetError) {
        console.error("스프레드시트 참가자 조회 중 오류 발생:", sheetError);
      }

      // 스프레드시트에서도 찾지 못한 경우
      if (!participant) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "해당 이메일로 등록된 참가자를 찾을 수 없습니다.",
          }),
          { status: 404 }
        );
      }
    } else {
      // 메모리에서 찾은 경우
      participant = eventParticipants[participantIndex];
      participantId = participant.id;
    }

    // 변경 가능한 필드 업데이트
    const updatedParticipant = {
      ...participant,
      name: name || participant.name || participant.이름,
      company:
        company !== undefined
          ? company
          : participant.company || participant.회사 || "",
      position:
        position !== undefined
          ? position
          : participant.position || participant.직함 || "",
      phone: phone || participant.phone || participant.연락처,
      email: email,
      event_type: event_type,
      sheet_name: sheet_name || participant.sheet_name || "참가자명단",
      updated_at: new Date().toISOString(),
    };

    // 메모리에 있으면 업데이트
    if (participantIndex !== -1) {
      eventParticipants[participantIndex] = updatedParticipant;
    }

    // 구글 스프레드시트에 참가자 정보 업데이트
    try {
      // 스프레드시트에 추가/업데이트 (덮어쓰기 방식)
      const response = await fetch(`/api/proxy/sheets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sheet: sheet_name || "참가자명단",
          data: {
            이름: name || participant.name || participant.이름,
            회사:
              company !== undefined
                ? company
                : participant.company || participant.회사 || "",
            직함:
              position !== undefined
                ? position
                : participant.position || participant.직함 || "",
            연락처: phone || participant.phone || participant.연락처,
            이메일: email,
            행사: event_type,
            참가자ID: participantId,
            업데이트일: new Date().toISOString().split("T")[0], // YYYY-MM-DD
            상태: "업데이트됨",
          },
        }),
      });

      if (!response.ok) {
        console.error(`스프레드시트 업데이트 오류: ${response.status}`);
        // 스프레드시트 저장 실패해도 사용자에게는 일단 성공으로 응답
      }
    } catch (sheetError) {
      console.error("스프레드시트 업데이트 중 오류 발생:", sheetError);
      // 스프레드시트 저장 실패해도 사용자에게는 일단 성공으로 응답
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "참가자 정보가 업데이트되었습니다.",
        participant: updatedParticipant,
        from_sheet: isFromSheet,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("참가자 정보 업데이트 중 오류 발생:", error);
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
