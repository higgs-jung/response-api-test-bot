/**
 * EverArt 이미지 생성 상태 조회 핸들러
 *
 * 이 핸들러는 EverArt API를 사용하여 이미지 생성 상태를 확인합니다.
 * API 키는 환경 변수 또는 파라미터로 제공받습니다.
 */

/**
 * EverArt 이미지 생성 상태 조회 요청을 처리하는 함수
 * @param {Object} params - 요청 파라미터
 * @param {string} params.generationId - 이미지 생성 ID
 * @param {string} [params.apiKey] - EverArt API 키 (선택적)
 * @returns {Promise<Object>} 이미지 생성 상태 조회 결과
 */
export default async function handler(params) {
  try {
    const generationId = params.generationId;
    const apiKey = params.apiKey || process.env.EVERART_API_KEY;

    if (!generationId) {
      return {
        success: false,
        error: {
          message: "이미지 생성 ID가 제공되지 않았습니다.",
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

    console.log("이미지 생성 상태 조회 요청:", { generationId });

    const response = await fetch(
      `/api/functions/everart_get_generation?apiKey=${apiKey}&generationId=${generationId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: {
          message: "이미지 생성 상태 조회 요청 실패",
          details: errorData.message || "서버 오류",
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: {
          message: "이미지 생성 상태 조회 요청 실패",
          details: data.message || "알 수 없는 오류",
        },
      };
    }

    const generation = data.data.generation;

    // 결과 가공
    const result = {
      id: generation.id,
      modelId: generation.model_id,
      status: generation.status,
      imageUrl: generation.image_url,
      type: generation.type,
      createdAt: generation.createdAt,
      updatedAt: generation.updatedAt,
    };

    // 결과 반환
    return {
      success: true,
      data: {
        generation: result,
      },
      message: "이미지 생성 상태가 성공적으로 조회되었습니다.",
    };
  } catch (error) {
    console.error("이미지 생성 상태 조회 오류:", error);

    return {
      success: false,
      error: {
        message: "이미지 생성 상태 조회 오류",
        details: error.message || "알 수 없는 오류가 발생했습니다.",
      },
    };
  }
}
