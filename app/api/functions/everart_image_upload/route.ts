export async function POST(request: Request) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { images, apiKey } = body;

    if (!images || !images.length || !apiKey) {
      return new Response(
        JSON.stringify({
          error: "이미지 정보와 API 키는 필수입니다",
          status: "error",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // EverArt API 호출
    const uploadResponse = await fetch(
      "https://api.everart.ai/v1/images/uploads",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images }),
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      return new Response(
        JSON.stringify({
          error: "이미지 업로드 URL 생성 실패",
          details: errorData,
          status: "error",
        }),
        {
          status: uploadResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const uploadData = await uploadResponse.json();

    // 결과 반환
    return new Response(
      JSON.stringify({
        success: true,
        data: uploadData,
        message: "이미지 업로드 URL이 성공적으로 생성되었습니다.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in everart_image_upload:", error);
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
