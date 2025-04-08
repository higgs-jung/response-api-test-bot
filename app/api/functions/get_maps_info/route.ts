import { NextRequest, NextResponse } from "next/server";

// Google Maps API 키 설정
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const place_name = params.get("place_name") || "";
  const region = params.get("region") || "";

  console.log("장소 정보 API 호출:", { place_name, region });

  try {
    // API 키 검증
    if (!GOOGLE_MAPS_API_KEY) {
      console.log(
        "Google Maps API 키가 설정되지 않았습니다. 목업 데이터를 반환합니다."
      );
      const mockResult = mockMapsData(place_name, region);
      return NextResponse.json({
        success: true,
        place_name,
        region,
        result: mockResult,
        source: "mock_no_api_key",
      });
    }

    // 검색어 구성 (지역 정보 포함)
    const searchQuery = region ? `${place_name} in ${region}` : place_name;

    // Places API 텍스트 검색 호출
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`,
      { next: { revalidate: 3600 } } // 1시간 캐싱
    );

    const placesData = await placesResponse.json();

    if (!placesData.results || placesData.results.length === 0) {
      console.log(
        "Google Maps API에서 결과를 찾을 수 없어 목업 데이터를 반환합니다."
      );
      const mockResult = mockMapsData(place_name, region);
      return NextResponse.json({
        success: true,
        place_name,
        region,
        result: mockResult,
        source: "mock_fallback",
      });
    }

    // 첫 번째 결과에 대한 상세 정보 요청
    const placeId = placesData.results[0].place_id;
    const detailsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,user_ratings_total,price_level,formatted_phone_number,opening_hours,geometry,reviews&key=${GOOGLE_MAPS_API_KEY}`,
      { next: { revalidate: 3600 } } // 1시간 캐싱
    );

    const detailsData = await detailsResponse.json();

    // 결과가 있으면 Google Maps API 데이터 반환
    if (detailsData.result) {
      return NextResponse.json({
        success: true,
        place_name,
        region,
        result: detailsData.result,
        source: "google_maps_api",
      });
    }

    // 상세 결과가 없으면 목업 데이터 사용
    console.log(
      "Google Maps API 상세 정보를 찾을 수 없어 목업 데이터를 반환합니다."
    );
    const mockResult = mockMapsData(place_name, region);
    return NextResponse.json({
      success: true,
      place_name,
      region,
      result: mockResult,
      source: "mock_fallback",
    });
  } catch (error) {
    console.error("장소 정보 API 오류:", error);

    // 오류 발생 시 목업 데이터 반환
    const mockResult = mockMapsData(place_name, region);
    return NextResponse.json({
      success: true,
      place_name,
      region,
      result: mockResult,
      source: "mock_error_fallback",
      error_message: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
}

// 목업 데이터 생성 함수 (API 키가 없거나 오류 발생 시 사용)
function mockMapsData(place_name: string, region: string) {
  const places = {
    "맛있는 고기집": {
      name: "맛있는 고기집",
      formatted_address: "서울시 강남구 역삼동 123-45",
      rating: 4.7,
      user_ratings_total: 254,
      price_level: 2,
      formatted_phone_number: "02-123-4567",
      opening_hours: {
        weekday_text: [
          "월요일: 11:30–22:00",
          "화요일: 11:30–22:00",
          "수요일: 11:30–22:00",
          "목요일: 11:30–22:00",
          "금요일: 11:30–22:30",
          "토요일: 11:30–22:30",
          "일요일: 휴무일",
        ],
      },
      geometry: {
        location: {
          lat: 37.501,
          lng: 127.037,
        },
      },
      reviews: [
        {
          rating: 5,
          text: "고기 품질이 정말 좋습니다. 특히 항정살이 추천!",
          time: 1679000000,
        },
        {
          rating: 4,
          text: "분위기가 좋고 직원들도 친절해요.",
          time: 1678000000,
        },
      ],
    },
    "오리지널 파스타": {
      name: "오리지널 파스타",
      formatted_address: "서울시 마포구 연남동 234-56",
      rating: 4.5,
      user_ratings_total: 187,
      price_level: 2,
      formatted_phone_number: "02-234-5678",
      opening_hours: {
        weekday_text: [
          "월요일: 11:30–21:30",
          "화요일: 11:30–21:30",
          "수요일: 11:30–21:30",
          "목요일: 11:30–21:30",
          "금요일: 11:30–22:00",
          "토요일: 11:30–22:00",
          "일요일: 11:30–21:00",
        ],
      },
      geometry: {
        location: {
          lat: 37.56,
          lng: 126.924,
        },
      },
      reviews: [
        {
          rating: 5,
          text: "트러플 파스타가 정말 맛있어요. 꼭 드세요!",
          time: 1680000000,
        },
        {
          rating: 4,
          text: "분위기도 좋고 맛도 좋아요. 가격이 조금 있는 편.",
          time: 1677000000,
        },
      ],
    },
    "일식당 사쿠라": {
      name: "일식당 사쿠라",
      formatted_address: "경기도 성남시 분당구 판교동 345-67",
      rating: 4.8,
      user_ratings_total: 203,
      price_level: 3,
      formatted_phone_number: "031-345-6789",
      opening_hours: {
        weekday_text: [
          "월요일: 휴무일",
          "화요일: 17:30–22:00",
          "수요일: 17:30–22:00",
          "목요일: 17:30–22:00",
          "금요일: 17:30–22:30",
          "토요일: 12:00–22:30",
          "일요일: 12:00–22:00",
        ],
      },
      geometry: {
        location: {
          lat: 37.38,
          lng: 127.115,
        },
      },
      reviews: [
        {
          rating: 5,
          text: "오마카세 코스가 정말 훌륭해요. 신선한 재료만 사용합니다.",
          time: 1681000000,
        },
        {
          rating: 5,
          text: "조용하고 고급스러운 분위기에서 정성이 담긴 요리를 맛볼 수 있어요.",
          time: 1676000000,
        },
      ],
    },
  };

  // 일반적인 기본값
  const defaultPlace = {
    name: place_name,
    formatted_address: region ? `${region} 지역` : "주소 정보 없음",
    rating: 4.0,
    user_ratings_total: 50,
    price_level: 2,
    formatted_phone_number: "정보 없음",
    opening_hours: {
      weekday_text: ["영업시간 정보가 없습니다"],
    },
    geometry: {
      location: {
        lat: 37.541,
        lng: 126.986,
      },
    },
    reviews: [
      {
        rating: 4,
        text: "리뷰 정보가 없습니다",
        time: 1675000000,
      },
    ],
  };

  // 이름이 정확히 일치하는 경우 해당 데이터 반환
  if (place_name in places) {
    return places[place_name as keyof typeof places];
  }

  // 이름이 일부 일치하는 경우 찾기
  for (const key in places) {
    if (key.includes(place_name) || place_name.includes(key)) {
      return places[key as keyof typeof places];
    }
  }

  // 일치하는 정보가 없으면 기본값 반환
  return defaultPlace;
}
