/**
 * EverArt 이미지 생성 핸들러
 *
 * 이 핸들러는 EverArt API를 사용하여 이미지를 생성하고, 이미지 생성 상태를 확인합니다.
 * API 키는 환경 변수 또는 파라미터로 제공받습니다.
 */

/**
 * EverArt 이미지 생성 요청을 처리하는 함수
 * @param {Object} params - 이미지 생성 파라미터
 * @param {string} params.prompt - 이미지 생성 프롬프트
 * @param {string} [params.modelId="259826230810001408"] - 사용할 모델 ID
 * @param {number} [params.imageCount=1] - 생성할 이미지 수
 * @param {string} [params.apiKey] - EverArt API 키 (선택적)
 * @returns {Promise<Object>} 이미지 생성 결과
 */
export default async function handler(params) {
  try {
    // 기본 파라미터 설정
    const prompt = params.prompt;
    const modelId = params.modelId || "259826230810001408"; // 기본 모델 ID (jiran-new)
    const imageCount = params.imageCount || 1;
    const apiKey = params.apiKey || process.env.EVERART_API_KEY;

    if (!prompt || prompt.trim() === "") {
      return {
        success: false,
        error: {
          message: "이미지 생성 프롬프트가 비어 있습니다.",
        },
      };
    }

    if (!apiKey) {
      return {
        success: false,
        error: {
          message: "EverArt API 키가 제공되지 않았습니다.",
        },
      };
    }

    console.log("이미지 생성 요청:", { prompt, modelId, imageCount });

    // 1. 이미지 생성 요청
    const generationResponse = await fetch(
      "/api/functions/everart_generate_image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          modelId,
          imageCount,
          apiKey,
        }),
      }
    );

    if (!generationResponse.ok) {
      const errorData = await generationResponse.json();
      return {
        success: false,
        error: {
          message: "이미지 생성 요청 실패",
          details: errorData.message || "서버 오류",
        },
      };
    }

    const generationData = await generationResponse.json();

    if (!generationData.success) {
      return {
        success: false,
        error: {
          message: "이미지 생성 요청 실패",
          details: generationData.message || "알 수 없는 오류",
        },
      };
    }

    const generationId = generationData.data.generations[0].id;
    console.log("이미지 생성 ID:", generationId);

    // 2. 이미지 생성 상태 확인 (최대 30초 대기)
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 10;
    let status = "PROCESSING";

    while (status !== "SUCCEEDED" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3초 대기

      const statusResponse = await fetch(
        `/api/functions/everart_get_generation?apiKey=${apiKey}&generationId=${generationId}`,
        {
          method: "GET",
        }
      );

      if (!statusResponse.ok) {
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();

      if (!statusData.success) {
        attempts++;
        continue;
      }

      status = statusData.data.generation.status;
      console.log("이미지 생성 상태:", status);

      if (status === "SUCCEEDED") {
        imageUrl = statusData.data.generation.image_url;
      } else if (status === "FAILED") {
        return {
          success: false,
          error: {
            message: "이미지 생성 실패",
            details: "EverArt API에서 이미지 생성에 실패했습니다.",
          },
        };
      }

      attempts++;
    }

    if (!imageUrl) {
      return {
        success: false,
        error: {
          message: "이미지 생성 시간 초과",
          details: "이미지 생성이 시간 내에 완료되지 않았습니다.",
        },
      };
    }

    // 3. 결과 반환
    return {
      success: true,
      data: {
        imageUrl,
        generationId,
        markdownImage: `![생성된 이미지](${imageUrl})`,
        prompt,
      },
      message: "이미지가 성공적으로 생성되었습니다.",
    };
  } catch (error) {
    console.error("이미지 생성 오류:", error);

    return {
      success: false,
      error: {
        message: "이미지 생성 오류",
        details: error.message || "알 수 없는 오류가 발생했습니다.",
      },
    };
  }
}
