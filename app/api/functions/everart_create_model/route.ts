export async function POST(request: Request) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { name, subject, imageUrls, imageUploadTokens, webhookUrl, apiKey } =
      body;

    if (!name || !subject || !apiKey || (!imageUrls && !imageUploadTokens)) {
      return new Response(
        JSON.stringify({
          error:
            "이름, 주제, API 키는 필수이며, 이미지 URL 또는 업로드 토큰이 필요합니다",
          status: "error",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 요청 본문 구성
    const requestBody: any = {
      name,
      subject,
    };

    if (imageUrls && imageUrls.length > 0) {
      requestBody.image_urls = imageUrls;
    }

    if (imageUploadTokens && imageUploadTokens.length > 0) {
      requestBody.image_upload_tokens = imageUploadTokens;
    }

    if (webhookUrl) {
      requestBody.webhook_url = webhookUrl;
    }

    // EverArt API 호출
    const modelResponse = await fetch("https://api.everart.ai/v1/models", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!modelResponse.ok) {
      const errorData = await modelResponse.json();
      return new Response(
        JSON.stringify({
          error: "모델 생성 요청 실패",
          details: errorData,
          status: "error",
        }),
        {
          status: modelResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const modelData = await modelResponse.json();

    // 결과 반환
    return new Response(
      JSON.stringify({
        success: true,
        data: modelData,
        message: "모델 생성이 성공적으로 요청되었습니다.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in everart_create_model:", error);
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
