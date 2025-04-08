export async function GET(request: Request) {
  try {
    // 현재 날짜 생성 (YYYY-MM-DD 형식)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 1을 더함
    const dd = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${yyyy}-${mm}-${dd}`;

    // 결과 반환
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          current_date: formattedDate,
          timestamp: today.getTime(),
          iso_string: today.toISOString(),
        },
        message: "현재 날짜 정보입니다.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in get_current_date:", error);
    return new Response(
      JSON.stringify({
        error: "서버 오류가 발생했습니다.",
        status: "error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
