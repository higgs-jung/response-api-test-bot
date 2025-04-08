/**
 * 맛집 정보 처리를 위한 유틸리티 함수
 */

export interface Restaurant {
  name: string;
  address?: string;
  location?: string;
  rating?: number;
  priceLevel?: number | string;
  cuisineType?: string;
  popularDishes?: string[];
  atmosphere?: string;
  openingHours?: string[];
  reservationInfo?: string;
  additionalInfo?: string[];
  reviews?: {
    rating: number;
    text: string;
  }[];
}

/**
 * 검색 쿼리를 생성하는 함수
 */
export function buildSearchQuery(params: {
  region?: string;
  foodType?: string;
  occasion?: string;
  priceRange?: string;
  atmosphere?: string;
}): string {
  const { region, foodType, occasion, priceRange, atmosphere } = params;

  let query = "";

  // 지역 정보 추가
  if (region) {
    query += `${region} `;
  }

  // 가격대 추가
  if (priceRange) {
    query += `${priceRange} `;
  }

  // 분위기 추가
  if (atmosphere) {
    query += `${atmosphere} `;
  }

  // 음식 종류 추가
  if (foodType) {
    query += `${foodType} `;
  }

  // 방문 목적 추가
  if (occasion) {
    query += `${occasion} `;
  }

  // 기본 키워드 추가
  query += "맛집 추천";

  return query.trim();
}

/**
 * 웹 검색 결과에서 맛집 정보를 추출하는 함수
 */
export function extractRestaurantInfoFromWebSearch(
  searchResults: string
): Restaurant[] {
  // 실제 구현에서는 검색 결과 텍스트를 파싱하여 맛집 정보를 추출
  // 여기서는 간단한 예시만 제공

  const restaurants: Restaurant[] = [];

  // 검색 결과에서 맛집 이름 패턴 찾기
  const nameMatches = searchResults.match(
    /[^\s"]+식당|[^\s"]+레스토랑|"([^"]+)"/g
  );

  if (nameMatches) {
    // 중복 제거 및 처리
    const uniqueNames = [...new Set(nameMatches)]
      .map((name) => name.replace(/^"|"$/g, "").trim())
      .filter((name) => name.length > 1 && !name.includes("http"));

    // 최대 5개 맛집으로 제한
    const limitedNames = uniqueNames.slice(0, 5);

    // 각 맛집 이름으로 기본 정보 생성
    limitedNames.forEach((name) => {
      restaurants.push({
        name,
        cuisineType: extractCuisineType(searchResults, name),
        popularDishes: extractPopularDishes(searchResults, name),
        priceLevel: extractPriceLevel(searchResults, name),
        atmosphere: extractAtmosphere(searchResults, name),
      });
    });
  }

  return restaurants;
}

/**
 * 검색 결과에서 음식 종류 추출
 */
function extractCuisineType(text: string, restaurantName: string): string {
  // 레스토랑 이름 주변 텍스트 추출
  const surroundingText = extractSurroundingText(text, restaurantName, 100);

  // 음식 종류 패턴 찾기
  const cuisineMatches = surroundingText.match(
    /한식|일식|중식|양식|이탈리안|프렌치|아시안|분식|퓨전/g
  );

  return cuisineMatches ? cuisineMatches[0] : "정보 없음";
}

/**
 * 검색 결과에서 인기 메뉴 추출
 */
function extractPopularDishes(text: string, restaurantName: string): string[] {
  // 레스토랑 이름 주변 텍스트 추출
  const surroundingText = extractSurroundingText(text, restaurantName, 200);

  // 인기 메뉴 패턴 찾기 (메뉴 이름은 보통 따옴표로 묶여있거나 특정 키워드 뒤에 옴)
  const dishMatches = surroundingText.match(
    /추천.*?메뉴[:]?\s+([^,.]+)|대표.*?메뉴[:]?\s+([^,.]+)|시그니처.*?메뉴[:]?\s+([^,.]+)/i
  );

  if (dishMatches) {
    // 첫 번째 매칭 그룹에서 메뉴 추출
    for (let i = 1; i < dishMatches.length; i++) {
      if (dishMatches[i]) {
        return dishMatches[i]
          .split(/[,、와과]/g)
          .map((dish) => dish.trim())
          .filter(Boolean);
      }
    }
  }

  return ["정보 없음"];
}

/**
 * 검색 결과에서 가격대 추출
 */
function extractPriceLevel(text: string, restaurantName: string): string {
  // 레스토랑 이름 주변 텍스트 추출
  const surroundingText = extractSurroundingText(text, restaurantName, 150);

  // 가격대 패턴 찾기
  const priceMatches = surroundingText.match(
    /가격[:]?\s+([^,.]+)|1인.*?(\d+[,\d]*원)/i
  );

  return priceMatches ? priceMatches[1] || priceMatches[2] : "정보 없음";
}

/**
 * 검색 결과에서 분위기 추출
 */
function extractAtmosphere(text: string, restaurantName: string): string {
  // 레스토랑 이름 주변 텍스트 추출
  const surroundingText = extractSurroundingText(text, restaurantName, 150);

  // 분위기 패턴 찾기
  const atmosphereMatches = surroundingText.match(
    /분위기[:]?\s+([^,.]+)|인테리어[:]?\s+([^,.]+)/i
  );

  return atmosphereMatches
    ? atmosphereMatches[1] || atmosphereMatches[2]
    : "정보 없음";
}

/**
 * 텍스트에서 특정 키워드 주변 텍스트 추출
 */
function extractSurroundingText(
  text: string,
  keyword: string,
  charCount: number
): string {
  const index = text.indexOf(keyword);
  if (index === -1) return "";

  const start = Math.max(0, index - charCount);
  const end = Math.min(text.length, index + keyword.length + charCount);

  return text.substring(start, end);
}

/**
 * 벡터 스토어 결과와 웹 검색 결과를 통합하는 함수
 */
export function mergeRestaurantResults(
  webResults: Restaurant[],
  vectorResults: Restaurant[] = []
): Restaurant[] {
  // 결과 맵 생성
  const resultMap = new Map<string, Restaurant>();

  // 벡터 스토어 결과 처리
  vectorResults.forEach((restaurant) => {
    resultMap.set(restaurant.name.toLowerCase(), restaurant);
  });

  // 웹 검색 결과 처리 (기존 정보가 있으면 병합)
  webResults.forEach((restaurant) => {
    const key = restaurant.name.toLowerCase();

    if (resultMap.has(key)) {
      // 기존 정보와 병합
      const existing = resultMap.get(key)!;
      resultMap.set(key, {
        ...existing,
        ...restaurant,
        // 배열 필드는 중복 제거하여 병합
        popularDishes: mergeArrays(
          existing.popularDishes,
          restaurant.popularDishes
        ),
        additionalInfo: mergeArrays(
          existing.additionalInfo,
          restaurant.additionalInfo
        ),
      });
    } else {
      // 새 정보 추가
      resultMap.set(key, restaurant);
    }
  });

  // 결과를 배열로 변환하여 반환
  return Array.from(resultMap.values());
}

/**
 * 배열을 중복 없이 병합하는 함수
 */
function mergeArrays<T>(arr1?: T[], arr2?: T[]): T[] {
  const set = new Set<T>();

  if (arr1) arr1.forEach((item) => set.add(item));
  if (arr2) arr2.forEach((item) => set.add(item));

  return Array.from(set).filter(Boolean);
}
