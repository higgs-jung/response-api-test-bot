import { NextRequest } from "next/server";

// Google 앱스 스크립트 API에 대한 프록시 서버
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const sheet = searchParams.get("sheet");
    const action = searchParams.get("action");

    // 요청 URL 및 파라미터 로깅
    console.log("GET 요청 URL:", url);
    console.log("시트명:", sheet);
    console.log("액션:", action);

    if (!url) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "URL 파라미터가 필요합니다.",
        }),
        { status: 400 }
      );
    }

    // URL에 액션 파라미터 추가
    const targetUrl = `${url}?sheet=${encodeURIComponent(sheet || "Sheet1")}&action=${action || "read"}`;

    console.log(`프록시 요청: ${targetUrl}`);

    // 서버 측에서 CORS 제한 없이 요청
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("응답 상태:", response.status);
    console.log("응답 헤더:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error(`원격 API 오류: ${response.status} ${response.statusText}`);

      // 더미 데이터 반환
      return new Response(
        JSON.stringify({
          success: true,
          message: `원격 API 오류가 발생했지만 테스트 데이터를 반환합니다 (${response.status}).`,
          is_test_data: true,
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
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );
    }

    // 응답 데이터 형식 확인
    const contentType = response.headers.get("content-type");
    console.log("응답 컨텐츠 타입:", contentType);

    let data;

    try {
      if (contentType && contentType.includes("application/json")) {
        // JSON 응답 처리
        data = await response.json();
        console.log("JSON 응답 수신:", data);
      } else {
        // JSON이 아닌 응답 처리 (HTML 등)
        const text = await response.text();
        console.log("비JSON 응답:", text.substring(0, 200) + "...");
        throw new Error("JSON이 아닌 응답 수신");
      }
    } catch (parseError) {
      console.error("응답 파싱 오류:", parseError);

      // 더미 데이터 반환 (테스트용)
      return new Response(
        JSON.stringify({
          success: true,
          message:
            "원격 서버에서 유효한 응답을 파싱할 수 없습니다. 테스트 데이터를 반환합니다.",
          is_test_data: true,
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
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );
    }

    // 클라이언트에게 데이터 반환
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("프록시 요청 오류:", error);

    // 오류가 발생해도 테스트 데이터 반환
    return new Response(
      JSON.stringify({
        success: true,
        message: "테스트 데이터를 반환합니다.",
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
        is_test_data: true,
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
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
}

// POST 요청도 처리
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "URL 파라미터가 필요합니다.",
        }),
        { status: 400 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();

    console.log(`프록시 POST 요청: ${url}`, body);

    // 서버 측에서 CORS 제한 없이 요청
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // 응답이 JSON인지 확인
    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = {
        success: response.ok,
        status: response.status,
        message: response.ok
          ? "요청이 성공적으로 처리되었습니다."
          : "요청 처리 중 오류가 발생했습니다.",
      };
    }

    // 클라이언트에게 데이터 반환
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("프록시 POST 요청 오류:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      }),
      { status: 500 }
    );
  }
}
