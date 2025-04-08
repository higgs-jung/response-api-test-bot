// 벡터스토어 관련 함수들을 모아둔 파일

/**
 * 벡터스토어에서 정보를 검색하는 함수
 * @param query 검색 쿼리
 * @param limit 결과 제한 수
 * @param vector_store_id 벡터스토어 ID
 * @returns 검색 결과
 */
export const search_vector_store = async ({
  query,
  limit = 5,
  vector_store_id = "vs_67ece02387848191b196a88fb5f2e0d3", // 기본값으로 맛집 벡터스토어 ID 설정
}: {
  query: string;
  limit?: number;
  vector_store_id?: string;
}) => {
  try {
    const searchParams = new URLSearchParams({
      query,
      limit: limit.toString(),
      vector_store_id,
    });

    const response = await fetch(
      `/api/functions/search_vector_store?${searchParams}`
    ).then((res) => res.json());

    return {
      success: true,
      message: "벡터스토어 검색이 완료되었습니다.",
      data: response.data || [],
      total: response.data?.length || 0,
    };
  } catch (error) {
    return {
      success: false,
      message: "벡터스토어 검색 중 오류가 발생했습니다.",
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      data: [],
      total: 0,
    };
  }
};

/**
 * 맛집 정보를 벡터스토어에 추가하는 함수
 * @param restaurant_name 맛집 이름
 * @param region 지역
 * @param description 설명
 * @param details 상세 정보
 * @param keywords 키워드 태그
 * @param call_id 함수 호출 ID
 * @returns 결과 객체
 */
export const add_restaurant = async ({
  restaurant_name,
  region,
  description,
  details,
  keywords,
  call_id,
}: {
  restaurant_name: string;
  region: string;
  description: string;
  details?: string;
  keywords?: string[];
  call_id?: string;
}) => {
  try {
    // 맛집 정보 포맷팅
    const restaurantData = {
      name: restaurant_name,
      region,
      description,
      details: details || "",
      keywords: keywords || [],
      type: "restaurant", // 데이터 타입 표시
      created_at: new Date().toISOString(),
    };

    // API 호출 설정
    const response = await fetch("/api/functions/add_restaurant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector_store_id: "vs_67ece02387848191b196a88fb5f2e0d3", // 맛집 벡터스토어 ID
        restaurant_data: restaurantData,
        call_id, // call_id 전달
      }),
    }).then((res) => res.json());

    if (response.success) {
      return {
        success: true,
        message: "맛집 정보가 성공적으로 추가되었습니다.",
        data: response.data,
        call_id: response.call_id || call_id, // 응답에서 call_id 가져오기
      };
    } else {
      return {
        success: false,
        message: "맛집 정보 추가에 실패했습니다.",
        error: response.error || "알 수 없는 오류가 발생했습니다.",
        call_id: response.call_id || call_id, // 응답에서 call_id 가져오기
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "맛집 정보 추가 중 오류가 발생했습니다.",
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      call_id, // call_id 전달
    };
  }
};

// 이전 함수명으로의 호환성 유지를 위한 별칭
export const add_restaurant_to_vector_store = add_restaurant;

/**
 * 벡터스토어에 있는 파일 목록을 조회하는 함수
 * @param vector_store_id 벡터스토어 ID
 * @returns 파일 목록
 */
export const list_vector_store_files = async ({
  vector_store_id = "vs_67ece02387848191b196a88fb5f2e0d3", // 기본값으로 맛집 벡터스토어 ID 설정
}: {
  vector_store_id: string;
}) => {
  try {
    const response = await fetch(
      `/api/vector_stores/list_files?vector_store_id=${vector_store_id}`
    ).then((res) => res.json());

    return {
      success: true,
      message: "벡터스토어 파일 목록 조회가 완료되었습니다.",
      data: response.data || [],
      total: response.data?.length || 0,
    };
  } catch (error) {
    return {
      success: false,
      message: "벡터스토어 파일 목록 조회 중 오류가 발생했습니다.",
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
      data: [],
      total: 0,
    };
  }
};
