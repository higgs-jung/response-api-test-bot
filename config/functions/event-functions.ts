// 행사 참가자 관련 함수들을 모아둔 파일

export const register_event_participant = async ({
  event_type,
  name,
  company,
  position,
  phone,
  email,
  sheet_name,
}: {
  event_type: string;
  name: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  sheet_name?: string;
}) => {
  console.log("참가자 등록 요청:", {
    event_type,
    name,
    company,
    position,
    phone,
    email,
  });

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
          회사: company,
          직함: position,
          연락처: phone,
          이메일: email,
          행사: event_type,
          등록일: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "참가자 등록 실패");
    }

    return {
      success: true,
      message: `${name}님의 참가 신청이 완료되었습니다!`,
      data: {
        이름: name,
        회사: company,
        직함: position,
        연락처: phone,
        이메일: email,
        행사: event_type,
      },
    };
  } catch (error) {
    console.error("참가자 등록 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      duplicate: false,
    };
  }
};

export const update_event_participant = async ({
  event_type,
  name,
  company,
  position,
  phone,
  email,
  sheet_name,
}: {
  event_type: string;
  name: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  sheet_name?: string;
}) => {
  console.log("참가자 정보 업데이트:", {
    event_type,
    name,
    company,
    position,
    phone,
    email,
  });

  try {
    // 직접 구글 시트 API 사용 (업데이트는 새 행 추가로 처리)
    const response = await fetch(`/api/proxy/sheets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sheet: sheet_name || "참가자명단",
        data: {
          이름: name,
          회사: company,
          직함: position,
          연락처: phone,
          이메일: email,
          행사: event_type,
          업데이트: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "참가자 정보 업데이트 실패");
    }

    return {
      success: true,
      message: `${name}님의 참가 정보가 업데이트되었습니다!`,
      data: {
        이름: name,
        회사: company,
        직함: position,
        연락처: phone,
        이메일: email,
        행사: event_type,
      },
    };
  } catch (error) {
    console.error("참가자 정보 업데이트 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
};
 