/**
 * 구글 앱스스크립트 - 스프레드시트 CRUD API
 *
 * 스프레드시트에 데이터를 추가하고 조회하는 웹 API
 * CORS 헤더를 추가하여 외부 도메인에서 접근 가능
 */

function doGet(e) {
  try {
    const sheet = e.parameter.sheet || "Sheet1";
    const action = e.parameter.action || "read";

    // 응답 객체 생성
    const output = ContentService.createTextOutput();

    // CORS 헤더 설정
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeader("Access-Control-Allow-Origin", "*");
    output.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    output.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // 디버깅 로그
    console.log("doGet 요청 - 시트:", sheet, "액션:", action);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    console.log("스프레드시트:", ss.getName());

    const sheetObj = ss.getSheetByName(sheet);

    if (!sheetObj) {
      return output.setContent(
        JSON.stringify({
          success: false,
          message: `시트 '${sheet}'를 찾을 수 없습니다.`,
        })
      );
    }

    // 데이터 읽기
    if (action === "read") {
      const data = sheetObj.getDataRange().getValues();
      const headers = data[0]; // 첫 번째 행은 헤더로 간주
      const rows = data.slice(1); // 헤더를 제외한 데이터

      return output.setContent(
        JSON.stringify({
          success: true,
          headers: headers,
          data: rows,
          message: "데이터를 성공적으로 읽었습니다.",
        })
      );
    }

    return output.setContent(
      JSON.stringify({
        success: false,
        message: `지원하지 않는 액션: ${action}`,
      })
    );
  } catch (error) {
    // 오류 발생 시 CORS 헤더가 있는 응답 반환
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeader("Access-Control-Allow-Origin", "*");
    output.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    output.setHeader("Access-Control-Allow-Headers", "Content-Type");

    console.error("doGet 오류:", error);

    return output.setContent(
      JSON.stringify({
        success: false,
        message: error.toString(),
      })
    );
  }
}

function doPost(e) {
  try {
    // 응답 객체 생성
    const output = ContentService.createTextOutput();

    // CORS 헤더 설정
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeader("Access-Control-Allow-Origin", "*");
    output.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    output.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // 요청 파라미터 파싱
    const params = JSON.parse(e.postData.contents);
    const sheetName = params.sheet || "Sheet1"; // 기본 시트명
    const data = params.data; // 추가할 데이터 배열

    console.log(
      "doPost 요청 - 시트:",
      sheetName,
      "데이터:",
      JSON.stringify(data)
    );

    // 스프레드시트와 시트 가져오기
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return output.setContent(
        JSON.stringify({
          success: false,
          message: `시트 '${sheetName}'를 찾을 수 없습니다.`,
        })
      );
    }

    // 데이터 추가
    if (Array.isArray(data)) {
      // 2차원 배열인 경우 (여러 행 추가)
      if (Array.isArray(data[0])) {
        sheet
          .getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length)
          .setValues(data);
      }
      // 1차원 배열인 경우 (한 행 추가)
      else {
        sheet
          .getRange(sheet.getLastRow() + 1, 1, 1, data.length)
          .setValues([data]);
      }
    }
    // 객체인 경우 (열 이름으로 매핑)
    else if (typeof data === "object" && data !== null) {
      // 헤더 가져오기
      const headers = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getValues()[0];
      const rowData = headers.map((header) => data[header] || "");
      sheet
        .getRange(sheet.getLastRow() + 1, 1, 1, rowData.length)
        .setValues([rowData]);
    }

    return output.setContent(
      JSON.stringify({
        success: true,
        message: "데이터가 성공적으로 추가되었습니다.",
      })
    );
  } catch (error) {
    // 오류 발생 시 CORS 헤더가 있는 응답 반환
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setHeader("Access-Control-Allow-Origin", "*");
    output.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    output.setHeader("Access-Control-Allow-Headers", "Content-Type");

    console.error("doPost 오류:", error);

    return output.setContent(
      JSON.stringify({
        success: false,
        message: error.toString(),
      })
    );
  }
}

// OPTIONS 요청에 대한 응답을 처리하는 함수 (CORS preflight 요청 처리)
function doOptions(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  // CORS 헤더 설정
  output.setHeader("Access-Control-Allow-Origin", "*");
  output.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  output.setHeader("Access-Control-Allow-Headers", "Content-Type");
  output.setHeader("Access-Control-Max-Age", "86400"); // 24시간

  return output.setContent(JSON.stringify({ status: "ok" }));
}
