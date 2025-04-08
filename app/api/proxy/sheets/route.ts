import { NextRequest } from "next/server";
import { google } from "googleapis";

// Google Sheets API 접근을 위한 서비스 계정 인증 정보
// 실제 사용 시에는 환경 변수를 통해 안전하게 관리해야 합니다.
// 아래 코드는 예시이며, 실제 서비스 계정 키를 환경 변수로 저장해야 합니다.
const GOOGLE_SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT;

// 스프레드시트 ID
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || "";

async function getAuthClient() {
  try {
    if (!GOOGLE_SERVICE_ACCOUNT) {
      throw new Error("서비스 계정 인증 정보가 없습니다.");
    }

    // 서비스 계정 인증 정보를 파싱
    const serviceAccountKey = JSON.parse(GOOGLE_SERVICE_ACCOUNT);

    // JWT 클라이언트 생성
    const auth = new google.auth.JWT(
      serviceAccountKey.client_email,
      undefined,
      serviceAccountKey.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    return auth;
  } catch (error) {
    console.error("인증 클라이언트 생성 오류:", error);
    throw error;
  }
}

// Google 스프레드시트에서 데이터 읽기
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheet = searchParams.get("sheet") || "Sheet1";

    console.log(`스프레드시트에서 데이터 읽기: ${sheet}`);

    // 인증 정보가 없는 경우 테스트 데이터 반환
    if (!GOOGLE_SERVICE_ACCOUNT || !SPREADSHEET_ID) {
      console.log("인증 정보 또는 스프레드시트 ID가 없어 테스트 데이터 반환");
      return new Response(
        JSON.stringify({
          success: true,
          message: "테스트 데이터입니다.",
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

    // 인증 클라이언트 생성
    const auth = await getAuthClient();

    // Google Sheets API 초기화
    const sheets = google.sheets({ version: "v4", auth });

    // 데이터 범위 지정 (A1:Z1000)
    const range = `${sheet}!A1:Z1000`;

    // 스프레드시트에서 데이터 읽기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "데이터가 없습니다.",
          data: [],
          headers: [],
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

    // 첫 번째 행을 헤더로 사용
    const headers = rows[0];
    const data = rows.slice(1);

    return new Response(
      JSON.stringify({
        success: true,
        message: "데이터를 성공적으로 읽었습니다.",
        data,
        headers,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("스프레드시트 데이터 읽기 오류:", error);

    // 오류 발생 시 테스트 데이터 반환
    return new Response(
      JSON.stringify({
        success: true,
        message: "오류가 발생하여 테스트 데이터를 반환합니다.",
        error: error instanceof Error ? error.message : "알 수 없는 오류",
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

// Google 스프레드시트에 데이터 쓰기
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheet = "Sheet1", data } = body;

    console.log(`스프레드시트에 데이터 쓰기: ${sheet}`, data);

    // 인증 정보가 없는 경우 성공으로 응답 (테스트용)
    if (!GOOGLE_SERVICE_ACCOUNT || !SPREADSHEET_ID) {
      console.log("인증 정보 또는 스프레드시트 ID가 없어 테스트 응답 반환");
      return new Response(
        JSON.stringify({
          success: true,
          message: "테스트 모드: 데이터가 저장된 것으로 가정합니다.",
          is_test_data: true,
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

    // 인증 클라이언트 생성
    const auth = await getAuthClient();

    // Google Sheets API 초기화
    const sheets = google.sheets({ version: "v4", auth });

    // 스프레드시트 데이터 가져오기 (헤더 확인용)
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheet}!A1:Z1`,
    });

    const headers = headerResponse.data.values?.[0] || [];

    // 데이터 준비
    let values: any[][] = [];

    if (Array.isArray(data)) {
      // 배열 형태의 데이터
      if (Array.isArray(data[0])) {
        values = data;
      } else {
        values = [data];
      }
    } else if (typeof data === "object" && data !== null) {
      // 객체 형태의 데이터를 헤더에 맞게 변환
      const row = headers.map((header) => data[header] || "");
      values = [row];
    }

    // 마지막 행 뒤에 데이터 추가
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheet}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "데이터가 성공적으로 추가되었습니다.",
        updatedRows: appendResponse.data.updates?.updatedRows || 0,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("스프레드시트 데이터 쓰기 오류:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "데이터 저장 중 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
}
