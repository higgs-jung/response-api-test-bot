export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 추출
    const url = new URL(request.url);
    const templateId = url.searchParams.get("templateId");
    const accessToken = url.searchParams.get("accessToken");

    if (!templateId || !accessToken) {
      return new Response(
        JSON.stringify({
          error: "템플릿 ID와 액세스 토큰은 필수입니다",
          status: "error",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 템플릿 데이터셋 확인
    const datasetResponse = await fetch(
      `https://api.canva.com/v1/brands/templates/${templateId}/dataset`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!datasetResponse.ok) {
      const errorData = await datasetResponse.json();
      return new Response(
        JSON.stringify({
          error: "템플릿 데이터셋 조회 실패",
          details: errorData,
          status: "error",
        }),
        {
          status: datasetResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const datasetInfo = await datasetResponse.json();

    // 결과 반환
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          dataset: datasetInfo,
        },
        message: "템플릿 데이터셋 정보가 성공적으로 조회되었습니다.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in canva_get_template:", error);
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
