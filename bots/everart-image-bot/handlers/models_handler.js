/**
 * EverArt 모델 목록 조회 핸들러
 *
 * 이 핸들러는 EverArt API를 사용하여 사용 가능한 모델 목록을 조회합니다.
 * API 키는 환경 변수 또는 파라미터로 제공받습니다.
 */

/**
 * EverArt 모델 목록 조회 요청을 처리하는 함수
 * @param {Object} params - 요청 파라미터
 * @param {string} [params.apiKey] - EverArt API 키 (선택적)
 * @param {string} [params.limit="20"] - 반환할 모델 수
 * @param {string} [params.search=""] - 검색 키워드
 * @returns {Promise<Object>} 모델 목록 조회 결과
 */
export default async function handler(params) {
  try {
    // 기본 파라미터 설정
    const apiKey = params.apiKey || process.env.EVERART_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: {
          message: "EverArt API 키가 제공되지 않았습니다.",
        },
      };
    }

    const limit = params.limit || "20";
    const search = params.search || "";

    console.log("모델 목록 조회 요청:", { limit, search });

    // 쿼리 파라미터 구성
    let url = `/api/functions/everart_get_models?apiKey=${apiKey}`;

    if (limit) {
      url += `&limit=${limit}`;
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    // 모델 목록 조회 요청
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: {
          message: "모델 목록 조회 요청 실패",
          details: errorData.message || "서버 오류",
        },
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: {
          message: "모델 목록 조회 요청 실패",
          details: data.message || "알 수 없는 오류",
        },
      };
    }

    // 가독성을 위한 모델 정보 가공
    const models = data.data.models.map((model) => ({
      id: model.id,
      name: model.name,
      status: model.status,
      subject: model.subject,
      createdAt: model.createdAt,
      thumbnailUrl: model.thumbnail_url,
    }));

    // 결과 반환
    return {
      success: true,
      data: {
        models,
        hasMore: data.data.has_more,
      },
      message: "모델 목록이 성공적으로 조회되었습니다.",
    };
  } catch (error) {
    console.error("모델 목록 조회 오류:", error);

    return {
      success: false,
      error: {
        message: "모델 목록 조회 오류",
        details: error.message || "알 수 없는 오류가 발생했습니다.",
      },
    };
  }
}
