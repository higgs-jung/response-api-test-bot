import {
  COMMON_COMMANDS,
  FOOD_BOT_COMMANDS,
  generateHelpText,
  parseAddRestaurantParams,
  parseCommand,
} from "./utils/command-parser";

/**
 * 봇 명령어 응답 인터페이스
 */
export interface CommandResponse {
  text: string;
  isHandled: boolean;
  shouldContinue?: boolean;
}

/**
 * 기본 명령어 핸들러
 * @param message 사용자 메시지
 * @returns 명령어 처리 결과
 */
export async function handleCommonCommands(
  message: string
): Promise<CommandResponse> {
  const { command, params, isCommand } = parseCommand(message, COMMON_COMMANDS);

  if (!isCommand) {
    return { text: "", isHandled: false };
  }

  switch (command) {
    case "HELP":
      return {
        text: generateHelpText(COMMON_COMMANDS),
        isHandled: true,
        shouldContinue: false,
      };

    case "ADD":
      // 일반 추가 명령어도 맛집 추가 명령어와 동일하게 처리
      return await handleAddRestaurant(params);

    default:
      return { text: "", isHandled: false };
  }
}

/**
 * 맛집 봇 전용 명령어 핸들러
 * @param message 사용자 메시지
 * @returns 명령어 처리 결과
 */
export async function handleFoodBotCommands(
  message: string
): Promise<CommandResponse> {
  const { command, params, isCommand } = parseCommand(
    message,
    FOOD_BOT_COMMANDS
  );

  if (!isCommand) {
    return { text: "", isHandled: false };
  }

  switch (command) {
    case "HELP":
      return {
        text: generateHelpText(FOOD_BOT_COMMANDS),
        isHandled: true,
        shouldContinue: false,
      };

    case "ADD_RESTAURANT":
      return await handleAddRestaurant(params);

    case "RECOMMEND":
      // 명령어를 파악했지만, AI가 처리하도록 함
      return {
        text: `맛집 추천을 시작합니다. 조건: ${params || "없음"}`,
        isHandled: true,
        shouldContinue: true, // AI가 계속 처리하도록 함
      };

    case "NEARBY":
      // 주변맛집 명령어 처리 - 위치 기반 추천은 AI가 처리하도록 함
      return {
        text: `현재 위치 주변의 맛집을 찾고 있습니다. 조건: ${params || "없음"}`,
        isHandled: true,
        shouldContinue: true, // AI가 계속 처리하도록 함
      };

    default:
      return { text: "", isHandled: false };
  }
}

/**
 * 맛집 추가 명령어 처리 함수
 * @param params 명령어 파라미터
 * @returns 명령어 처리 결과
 */
async function handleAddRestaurant(params: string): Promise<CommandResponse> {
  // 파라미터 파싱
  const parsedParams = parseAddRestaurantParams(params);

  // 필수 필드가 누락된 경우
  if (!parsedParams.isValid) {
    return {
      text:
        `맛집 추가를 위해 다음 정보가 필요합니다: ${parsedParams.missingFields.join(", ")}\n\n` +
        "예시: `/맛집추가 이름: 맛있는 고기집, 지역: 서울 강남, 설명: 한우 전문점`",
      isHandled: true,
      shouldContinue: false,
    };
  }

  // vector-store-functions.ts 사용해서 맛집 추가 기능 구현
  try {
    // 벡터스토어 함수 가져오기
    const { add_restaurant } = await import(
      "../config/functions/vector-store-functions"
    );

    // 벡터스토어에 추가
    const result = await add_restaurant({
      restaurant_name: parsedParams.restaurant_name as string,
      region: parsedParams.region as string,
      description: parsedParams.description as string,
      details: parsedParams.details,
      keywords: parsedParams.keywords,
      call_id: `add_restaurant_${Date.now()}`, // 고유한 call_id 생성
    });

    if (result.success) {
      return {
        text:
          `✅ ${result.message}\n\n` +
          "추가된 정보:\n" +
          `- 이름: ${parsedParams.restaurant_name}\n` +
          `- 지역: ${parsedParams.region}\n` +
          `- 설명: ${parsedParams.description}\n` +
          (parsedParams.details
            ? `- 상세 정보: ${parsedParams.details}\n`
            : "") +
          (parsedParams.keywords?.length
            ? `- 키워드: ${parsedParams.keywords.join(", ")}\n`
            : ""),
        isHandled: true,
        shouldContinue: false,
      };
    } else {
      return {
        text: `❌ 맛집 정보 추가 중 오류가 발생했습니다: ${result.error || "알 수 없는 오류"}`,
        isHandled: true,
        shouldContinue: false,
      };
    }
  } catch (error) {
    console.error("맛집 추가 에러:", error);
    return {
      text: `❌ 맛집 정보 추가 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      isHandled: true,
      shouldContinue: false,
    };
  }
}
