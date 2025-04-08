export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 추출
    const url = new URL(request.url);
    const templateId = url.searchParams.get("templateId");
    const accessToken = url.searchParams.get("accessToken");
    const fieldsJson = url.searchParams.get("fields");

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

    const fields = fieldsJson ? JSON.parse(fieldsJson) : {};

    // 1. 템플릿 데이터셋 확인
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

    // 2. Autofill 작업 생성
    const autofillResponse = await fetch(
      "https://api.canva.com/v1/designs/autofill",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand_template_id: templateId,
          field_data: fields,
        }),
      }
    );

    if (!autofillResponse.ok) {
      const errorData = await autofillResponse.json();
      return new Response(
        JSON.stringify({
          error: "Autofill 작업 생성 실패",
          details: errorData,
          status: "error",
        }),
        {
          status: autofillResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const autofillJobData = await autofillResponse.json();
    const jobId = autofillJobData.job_id;

    // 3. Autofill 작업 상태 확인 (최대 10초 대기)
    let jobStatus;
    let designData = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기

      const jobResponse = await fetch(
        `https://api.canva.com/v1/designs/autofill/jobs/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!jobResponse.ok) {
        const errorData = await jobResponse.json();
        return new Response(
          JSON.stringify({
            error: "Autofill 작업 상태 확인 실패",
            details: errorData,
            status: "error",
          }),
          {
            status: jobResponse.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      jobStatus = await jobResponse.json();

      if (jobStatus.status === "COMPLETED") {
        designData = jobStatus.design;
        break;
      } else if (jobStatus.status === "FAILED") {
        return new Response(
          JSON.stringify({
            error: "Autofill 작업 실패",
            details: jobStatus.error,
            status: "error",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // 결과 반환
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          dataset: datasetInfo,
          job: jobStatus,
          design: designData,
        },
        message: designData
          ? "자동 채우기가 완료되었습니다."
          : "자동 채우기 작업이 아직 완료되지 않았습니다.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in canva_autofill:", error);
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
