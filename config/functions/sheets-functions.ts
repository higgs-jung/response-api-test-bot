// 구글 스프레드시트 관련 함수들을 모아둔 파일

export const add_to_sheet_apps_script = async ({
  data,
  sheet_name,
  api_url,
}: {
  data: Record<string, any> | any[] | any[][];
  sheet_name?: string;
  api_url?: string;
}) => {
  console.log("구글 시트에 데이터 추가:", data);

  // 새 API URL 설정
  const url =
    api_url ||
    "https://script.google.com/macros/s/AKfycbxFN3Mq4RqChaHAcgXzANa4605_ia3kjx_ZezLPJLtiZLYaYYk_LxzDZAEfTXGZWSri/exec";

  try {
    // 프록시 API를 통해 요청
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sheet: sheet_name || "Sheet1",
        data: data,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: `데이터가 시트 '${sheet_name || "Sheet1"}'에 추가되었습니다.`,
      result,
    };
  } catch (error) {
    console.error("시트 데이터 추가 오류:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
};

export const read_from_sheet_apps_script = async ({
  sheet_name,
}: {
  sheet_name?: string;
}) => {
  console.log("구글 시트에서 데이터 읽기 시작");

  try {
    // 직접 구글 시트 API 사용
    const response = await fetch(
      `/api/proxy/sheets?sheet=${encodeURIComponent(sheet_name || "참가자명단")}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`데이터 읽기 실패: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: `시트 '${sheet_name || "참가자명단"}'에서 데이터를 성공적으로 읽었습니다.`,
      data: result.data || [],
      headers: result.headers || [],
      is_test_data: result.is_test_data,
    };
  } catch (error) {
    console.error("시트 데이터 읽기 오류:", error);
    // 오류 발생 시 더미 데이터 반환
    return {
      success: true,
      message: "시트에서 데이터를 읽을 수 없어 테스트 데이터를 반환합니다.",
      data: [
        [
          "1",
          "홍길동",
          "ABC회사",
          "개발자",
          "010-1234-5678",
          "hong@example.com",
          "Fuji Summit Camp",
          "2023-05-15",
        ],
        [
          "2",
          "김철수",
          "XYZ주식회사",
          "매니저",
          "010-9876-5432",
          "kim@example.com",
          "Pangyo BootCamp",
          "2023-05-16",
        ],
      ],
      headers: [
        "ID",
        "이름",
        "회사",
        "직함",
        "연락처",
        "이메일",
        "행사",
        "등록일",
      ],
      is_test_data: true,
    };
  }
};
 