// List of tools available to the assistant
// No need to include the top-level wrapper object as it is added in lib/tools/tools.ts
// More information on function calling: https://platform.openai.com/docs/guides/function-calling

export const toolsList = [
  {
    name: "get_weather",
    description: "현재 날씨를 조회합니다",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "날씨를 조회할 도시 이름",
        },
        country: {
          type: "string",
          description: "국가 코드 (예: KR, US, JP)",
        },
      },
      required: ["city"],
      additionalProperties: false,
    },
  },
  {
    name: "get_joke",
    description: "무작위 유머를 제공합니다",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "유머 카테고리 (일반, 개발자, 직장인, 무작위 등)",
          enum: ["general", "dev", "office", "random"],
        },
        language: {
          type: "string",
          description: "유머 언어 (한국어, 영어)",
          enum: ["ko", "en"],
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_browser_location",
    description: "현재 브라우저의 위치 정보를 가져옵니다",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_maps_info",
    description: "지도와 위치 정보를 조회합니다",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "위치 이름 (예: 서울시청, 뚝섬역, 경복궁 등)",
        },
        details: {
          type: "boolean",
          description: "상세 정보 포함 여부",
        },
      },
      required: ["location"],
      additionalProperties: false,
    },
  },
  {
    name: "add_restaurant",
    description: "맛집 정보를 벡터 스토어에 추가합니다",
    parameters: {
      type: "object",
      properties: {
        restaurant_name: {
          type: "string",
          description: "맛집 이름",
        },
        region: {
          type: "string",
          description: "위치 (예: 강남, 홍대, 부산 해운대 등)",
        },
        description: {
          type: "string",
          description: "맛집에 대한 간단한 설명",
        },
        details: {
          type: "string",
          description: "메뉴, 가격, 분위기 등 상세 정보",
        },
        keywords: {
          type: "array",
          items: {
            type: "string",
          },
          description: "키워드 태그 (예: ['한식', '분위기좋은', '데이트'])",
        },
      },
      required: ["restaurant_name", "region", "description"],
      additionalProperties: false,
    },
  },
  {
    name: "search_vector_store",
    description: "벡터 스토어에서 정보를 검색합니다",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "검색 쿼리",
        },
        limit: {
          type: "number",
          description: "반환할 최대 결과 수",
          default: 5,
        },
        vector_store_id: {
          type: "string",
          description: "검색할 벡터 스토어 ID (기본값 사용 시 생략 가능)",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "list_vector_store_files",
    description: "특정 벡터스토어에 있는 파일 목록을 조회합니다",
    parameters: {
      type: "object",
      properties: {
        vector_store_id: {
          type: "string",
          description: "조회할 벡터스토어 ID",
        },
      },
      required: ["vector_store_id"],
      additionalProperties: false,
    },
  },
  {
    name: "add_to_sheet_apps_script",
    description: "구글 시트에 데이터를 추가합니다",
    parameters: {
      type: "object",
      properties: {
        sheet_name: {
          type: "string",
          description: "데이터를 추가할 시트 이름",
        },
        data: {
          type: "object",
          description: "추가할 데이터 객체",
        },
      },
      required: ["sheet_name", "data"],
      additionalProperties: false,
    },
  },
  {
    name: "read_from_sheet_apps_script",
    description: "구글 시트에서 데이터를 읽어옵니다",
    parameters: {
      type: "object",
      properties: {
        sheet_name: {
          type: "string",
          description: "데이터를 읽어올 시트 이름",
        },
        query: {
          type: "string",
          description: "검색 쿼리 (특정 데이터 필터링)",
        },
      },
      required: ["sheet_name"],
      additionalProperties: false,
    },
  },
  {
    name: "register_event_participant",
    description: "이벤트 참가자를 등록합니다",
    parameters: {
      type: "object",
      properties: {
        event_id: {
          type: "string",
          description: "이벤트 ID",
        },
        name: {
          type: "string",
          description: "참가자 이름",
        },
        email: {
          type: "string",
          description: "참가자 이메일",
        },
        phone: {
          type: "string",
          description: "참가자 전화번호",
        },
        company: {
          type: "string",
          description: "참가자 회사",
        },
        position: {
          type: "string",
          description: "참가자 직책",
        },
        options: {
          type: "object",
          description: "추가 옵션 (이벤트에 따라 다름)",
        },
      },
      required: ["event_id", "name", "email"],
      additionalProperties: false,
    },
  },
  {
    name: "update_event_participant",
    description: "이벤트 참가자 정보를 업데이트합니다",
    parameters: {
      type: "object",
      properties: {
        event_id: {
          type: "string",
          description: "이벤트 ID",
        },
        participant_id: {
          type: "string",
          description: "참가자 ID",
        },
        updates: {
          type: "object",
          description: "업데이트할 정보",
        },
      },
      required: ["event_id", "participant_id", "updates"],
      additionalProperties: false,
    },
  },
];
