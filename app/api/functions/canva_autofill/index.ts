import { NextResponse } from "next/server";
import { z } from "zod";

export const config = {
  runtime: "edge",
};

// 파라미터 스키마 정의
const ParamsSchema = z
  .object({
    templateId: z.string().min(1, "템플릿 ID는 필수입니다"),
    fields: z.record(z.string(), z.string()).optional(),
    accessToken: z.string().min(1, "액세스 토큰은 필수입니다"),
  })
  .strict();

export type CanvaAutofillParams = z.infer<typeof ParamsSchema>;

export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 추출
    const url = new URL(request.url);
    const paramsString = url.searchParams.get("params");

    if (!paramsString) {
      return NextResponse.json(
        {
          error: "Params are required",
          status: "error",
        },
        { status: 400 }
      );
    }

    // 파라미터 파싱 및 검증
    const params = JSON.parse(paramsString);
    const validationResult = ParamsSchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid parameters",
          details: validationResult.error.format(),
          status: "error",
        },
        { status: 400 }
      );
    }

    const { templateId, fields, accessToken } = validationResult.data;

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
      return NextResponse.json(
        {
          error: "템플릿 데이터셋 조회 실패",
          details: errorData,
          status: "error",
        },
        { status: datasetResponse.status }
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
          field_data: fields || {},
        }),
      }
    );

    if (!autofillResponse.ok) {
      const errorData = await autofillResponse.json();
      return NextResponse.json(
        {
          error: "Autofill 작업 생성 실패",
          details: errorData,
          status: "error",
        },
        { status: autofillResponse.status }
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
        return NextResponse.json(
          {
            error: "Autofill 작업 상태 확인 실패",
            details: errorData,
            status: "error",
          },
          { status: jobResponse.status }
        );
      }

      jobStatus = await jobResponse.json();

      if (jobStatus.status === "COMPLETED") {
        designData = jobStatus.design;
        break;
      } else if (jobStatus.status === "FAILED") {
        return NextResponse.json(
          {
            error: "Autofill 작업 실패",
            details: jobStatus.error,
            status: "error",
          },
          { status: 400 }
        );
      }
    }

    // 결과 반환
    return NextResponse.json({
      success: true,
      data: {
        dataset: datasetInfo,
        job: jobStatus,
        design: designData,
      },
      message: designData
        ? "자동 채우기가 완료되었습니다."
        : "자동 채우기 작업이 아직 완료되지 않았습니다.",
    });
  } catch (error) {
    console.error("Error in canva_autofill:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        status: "error",
      },
      { status: 500 }
    );
  }
}
