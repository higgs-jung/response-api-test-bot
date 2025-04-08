import OpenAI from "openai";

/**
 * 벡터 스토어 검색 결과 인터페이스
 */
export interface VectorStoreSearchResult {
  success: boolean;
  message: string;
  data?: any[];
  total?: number;
  error?: string;
}

/**
 * 벡터 스토어 검색 함수
 */
export async function searchVectorStore(
  query: string,
  vectorStoreId: string,
  limit: number = 5
): Promise<VectorStoreSearchResult> {
  const openai = new OpenAI();

  try {
    if (!query) {
      return {
        success: false,
        message: "검색어가 필요합니다.",
      };
    }

    if (!vectorStoreId) {
      return {
        success: false,
        message: "벡터스토어 ID가 필요합니다.",
      };
    }

    // OpenAI 벡터스토어 API 호출 (베타 API 사용)
    // @ts-ignore - OpenAI API 타입 정의 문제 해결
    const response = await openai.beta.vectorStores.query(vectorStoreId, {
      query,
      maxResults: limit,
    });

    return {
      success: true,
      message: "검색이 완료되었습니다.",
      data: response.matches || [],
      total: response.matches?.length || 0,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "알 수 없는 오류가 발생했습니다.";

    return {
      success: false,
      message: "벡터스토어 검색 중 오류가 발생했습니다.",
      error: errorMessage,
    };
  }
}
