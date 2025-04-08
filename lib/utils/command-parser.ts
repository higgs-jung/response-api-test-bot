/**
 * 봇 명령어 처리를 위한 유틸리티
 */

export interface CommandDefinition {
  name: string;
  triggers: string[];
  description: string;
  example?: string;
}

// 명령어 매칭 결과 인터페이스
export interface CommandMatch {
  command: string;
  params: string;
  isCommand: boolean;
}

/**
 * 명령어 정의 목록
 * 여러 봇에서 공통으로 사용할 수 있는 명령어들
 */
export const COMMON_COMMANDS: Record<string, CommandDefinition> = {
  HELP: {
    name: "도움말",
    triggers: ["/도움말", "/help", "/명령어", "/commands"],
    description: "사용 가능한 명령어 목록을 보여줍니다",
    example: "/도움말",
  },
  ADD: {
    name: "추가",
    triggers: ["/추가", "/add", "/저장", "/save"],
    description: "새로운 정보를 데이터베이스에 추가합니다",
    example: "/추가 [데이터]",
  },
  SEARCH: {
    name: "검색",
    triggers: ["/검색", "/search", "/찾기", "/find"],
    description: "데이터베이스에서 정보를 검색합니다",
    example: "/검색 [검색어]",
  },
  DELETE: {
    name: "삭제",
    triggers: ["/삭제", "/delete", "/remove"],
    description: "데이터베이스에서 정보를 삭제합니다",
    example: "/삭제 [데이터 ID]",
  },
};

/**
 * 맛집 봇 전용 명령어 정의
 */
export const FOOD_BOT_COMMANDS: Record<string, CommandDefinition> = {
  ...COMMON_COMMANDS,
  ADD_RESTAURANT: {
    name: "맛집추가",
    triggers: ["/맛집추가", "/레스토랑추가", "/add-restaurant"],
    description: "새로운 맛집 정보를 데이터베이스에 추가합니다",
    example:
      "/맛집추가 이름: 맛있는 고기집, 지역: 서울 강남, 설명: 한우 전문점",
  },
  RECOMMEND: {
    name: "추천",
    triggers: ["/추천", "/recommend", "/맛집추천"],
    description: "조건에 맞는 맛집을 추천받습니다",
    example: "/추천 서울 강남 데이트",
  },
  NEARBY: {
    name: "주변맛집",
    triggers: ["/주변맛집", "/주변", "/nearby"],
    description: "현재 위치 주변의 맛집을 추천받습니다",
    example: "/주변맛집 1km 이내 한식",
  },
};

/**
 * 행사 봇 전용 명령어 정의
 */
export const EVENT_BOT_COMMANDS: Record<string, CommandDefinition> = {
  ...COMMON_COMMANDS,
  EVENT_REGISTER: {
    name: "행사등록",
    triggers: ["/행사등록", "/등록", "/register-event"],
    description: "새 행사를 등록합니다",
    example:
      "/행사등록 이름: 개발자 컨퍼런스, 장소: 삼성동 코엑스, 날짜: 2023-12-15",
  },
  EVENT_LIST: {
    name: "행사목록",
    triggers: ["/행사목록", "/목록", "/list-events"],
    description: "등록된 행사 목록을 조회합니다",
    example: "/행사목록 상태: 예정",
  },
  ADD_PARTICIPANT: {
    name: "참가자추가",
    triggers: ["/참가자추가", "/참가신청", "/add-participant"],
    description: "행사에 참가자를 추가합니다",
    example:
      "/참가자추가 행사ID: event_123, 이름: 홍길동, 이메일: hong@example.com",
  },
  PARTICIPANT_LIST: {
    name: "참가자목록",
    triggers: ["/참가자목록", "/참가자", "/list-participants"],
    description: "행사의 참가자 목록을 조회합니다",
    example: "/참가자목록 행사ID: event_123",
  },
  CANCEL_EVENT: {
    name: "행사취소",
    triggers: ["/행사취소", "/취소", "/cancel-event"],
    description: "등록된 행사를 취소합니다",
    example: "/행사취소 행사ID: event_123, 사유: 코로나19 확산 방지",
  },
};

/**
 * 봇 ID에 맞는 명령어 정의를 반환하는 함수
 * @param botId 봇 ID
 * @returns 봇에 맞는 명령어 정의
 */
export function getBotCommands(
  botId: string
): Record<string, CommandDefinition> {
  switch (botId) {
    case "food-bot":
    case "food-recommendation-bot":
      return FOOD_BOT_COMMANDS;
    case "event-bot":
      return EVENT_BOT_COMMANDS;
    default:
      return COMMON_COMMANDS;
  }
}

/**
 * 사용자 메시지에서 명령어를 파싱하는 함수
 * @param message 사용자 메시지
 * @param commandDefinitions 명령어 정의 목록
 * @returns 명령어 매칭 결과
 */
export function parseCommand(
  message: string,
  commandDefinitions: Record<string, CommandDefinition> = COMMON_COMMANDS
): CommandMatch {
  // 입력 메시지가 없거나 공백인 경우
  if (!message || message.trim() === "") {
    return { command: "", params: "", isCommand: false };
  }

  // 공백 제거
  const trimmedMessage = message.trim();

  // 모든 명령어를 순회하며 매칭 확인
  for (const commandKey in commandDefinitions) {
    const command = commandDefinitions[commandKey];

    for (const trigger of command.triggers) {
      // 명령어로 시작하는지 확인 (대소문자 무시)
      if (trimmedMessage.toLowerCase().startsWith(trigger.toLowerCase())) {
        // 명령어 이후의 파라미터 추출
        const params = trimmedMessage.substring(trigger.length).trim();
        return {
          command: commandKey,
          params,
          isCommand: true,
        };
      }
    }
  }

  // 명령어가 아닌 경우
  return { command: "", params: trimmedMessage, isCommand: false };
}

/**
 * 명령어 도움말 생성 함수
 * @param commandDefinitions 명령어 정의 목록
 * @returns 도움말 텍스트
 */
export function generateHelpText(
  commandDefinitions: Record<string, CommandDefinition> = COMMON_COMMANDS
): string {
  let helpText = "🔍 **사용 가능한 명령어**\n\n";

  // 각 명령어 정보 추가
  for (const commandKey in commandDefinitions) {
    const command = commandDefinitions[commandKey];
    helpText += `**${command.name}** (${command.triggers[0]})\n`;
    helpText += `${command.description}\n`;
    if (command.example) {
      helpText += `예시: \`${command.example}\`\n`;
    }
    helpText += "\n";
  }

  return helpText;
}

/**
 * 맛집 추가 명령어 파라미터 파싱
 * @param params 명령어 파라미터 문자열
 * @returns 파싱된 맛집 정보
 */
export function parseAddRestaurantParams(params: string): {
  restaurant_name?: string;
  region?: string;
  description?: string;
  details?: string;
  keywords?: string[];
  isValid: boolean;
  missingFields: string[];
} {
  // 결과 객체 초기화
  const result: any = {
    isValid: false,
    missingFields: [],
  };

  // 필수 필드 확인을 위한 플래그
  let hasName = false;
  let hasRegion = false;
  let hasDescription = false;

  // 파라미터가 비어있는 경우
  if (!params.trim()) {
    result.missingFields = ["이름", "지역", "설명"];
    return result;
  }

  // 쉼표로 구분된 형식인지 확인
  const hasCommas = params.includes(",");
  let keyValuePairs: string[] = [];

  if (hasCommas) {
    // 키-값 형식으로 파싱 (예: "이름: 맛있는 고기집, 지역: 서울")
    keyValuePairs = params.split(",").map((pair) => pair.trim());
  } else {
    // 키워드 없이 들어온 경우 (예: "맛집이름 지역 설명")
    // 첫 번째 단어를 맛집 이름, 두 번째 단어를 지역, 나머지를 설명으로 처리
    const parts = params.trim().split(/\s+/);

    if (parts.length >= 3) {
      result.restaurant_name = parts[0];
      result.region = parts[1];
      result.description = parts.slice(2).join(" ");

      hasName = true;
      hasRegion = true;
      hasDescription = true;

      // 유효성 설정
      result.isValid = true;

      return result;
    } else if (parts.length === 2) {
      // 이름과 지역만 있는 경우
      result.restaurant_name = parts[0];
      result.region = parts[1];

      hasName = true;
      hasRegion = true;
      result.missingFields.push("설명");

      return result;
    } else if (parts.length === 1) {
      // 이름만 있는 경우
      result.restaurant_name = parts[0];

      hasName = true;
      result.missingFields.push("지역", "설명");

      return result;
    }
  }

  // 키-값 쌍 처리
  for (const pair of keyValuePairs) {
    const colonIndex = pair.indexOf(":");

    if (colonIndex !== -1) {
      const key = pair.substring(0, colonIndex).trim().toLowerCase();
      const value = pair.substring(colonIndex + 1).trim();

      if (value) {
        switch (key) {
          case "이름":
          case "맛집이름":
          case "맛집 이름":
          case "restaurant":
          case "name":
            result.restaurant_name = value;
            hasName = true;
            break;

          case "지역":
          case "위치":
          case "region":
          case "location":
            result.region = value;
            hasRegion = true;
            break;

          case "설명":
          case "description":
            result.description = value;
            hasDescription = true;
            break;

          case "상세":
          case "상세정보":
          case "details":
            result.details = value;
            break;

          case "키워드":
          case "태그":
          case "keywords":
          case "tags":
            result.keywords = value
              .split(" ")
              .map((k: string) => k.trim())
              .filter(Boolean);
            break;
        }
      }
    }
  }

  // 필수 필드 검증
  if (!hasName) result.missingFields.push("이름");
  if (!hasRegion) result.missingFields.push("지역");
  if (!hasDescription) result.missingFields.push("설명");

  // 유효성 설정
  result.isValid = result.missingFields.length === 0;

  return result;
}
