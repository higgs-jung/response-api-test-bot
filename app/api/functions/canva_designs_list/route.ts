export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 추출
    const url = new URL(request.url);
    const accessToken = url.searchParams.get("accessToken");
    const limit = url.searchParams.get("limit") || "20";
    const startTime = url.searchParams.get("startTime") || "";
    const endTime = url.searchParams.get("endTime") || "";

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: "액세스 토큰은 필수입니다",
          status: "error",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // API 요청 URL 구성
    let apiUrl = `https://api.canva.com/v1/designs?limit=${limit}`;
    if (startTime) {
      apiUrl += `&start_time=${startTime}`;
    }
    if (endTime) {
      apiUrl += `&end_time=${endTime}`;
    }

    // 디자인 목록 조회
    const designsResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!designsResponse.ok) {
      const errorData = await designsResponse.json();
      return new Response(
        JSON.stringify({
          error: "디자인 목록 조회 실패",
          details: errorData,
          status: "error",
        }),
        {
          status: designsResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const designsData = await designsResponse.json();

    // 결과 반환
    return new Response(
      JSON.stringify({
        success: true,
        data: designsData,
        message: "디자인 목록이 성공적으로 조회되었습니다.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in canva_designs_list:", error);
    return new Response(
      JSON.stringify({
        error: "서버 오류가 발생했습니다.",
        status: "error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
