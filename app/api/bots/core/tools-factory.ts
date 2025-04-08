import { BotDefinition } from "./bot-schema";

/**
 * 봇 설정에 따라 도구를 생성합니다.
 */
export function createToolsForBot(bot: BotDefinition) {
  const tools = [];

  // 함수 도구 처리
  if (
    bot.tools.function &&
    bot.functions &&
    Array.isArray(bot.functions) &&
    bot.functions.length > 0
  ) {
    // functions.json에 정의된 함수만 사용
    tools.push(
      ...bot.functions.map((func) => {
        // 기본 파라미터 준비 (깊은 복사 수행)
        const parameters = JSON.parse(JSON.stringify(func.parameters || {}));

        // 필수 속성 확인 및 추가
        if (!parameters.type) {
          parameters.type = "object";
        }

        if (!parameters.properties) {
          parameters.properties = {};
        }

        // additionalProperties가 없으면 추가
        if (parameters.additionalProperties === undefined) {
          parameters.additionalProperties = false;
        }

        // required가 없으면 빈 배열 추가
        if (!Array.isArray(parameters.required)) {
          parameters.required = [];
        }

        // 도구 구성 반환
        return {
          type: "function",
          name: func.name,
          description: func.description || `Function ${func.name}`,
          parameters,
        };
      })
    );
  }

  // 웹 검색 도구 처리
  if (bot.tools.web_search) {
    tools.push({
      type: "web_search",
    });
  }

  // 파일 검색 도구 처리
  if (bot.tools.file_search) {
    tools.push({
      type: "file_search",
    });
  }

  // 코드 인터프리터 도구 처리
  if (bot.tools.code_interpreter) {
    tools.push({
      type: "code_interpreter",
    });
  }

  // 이미지 비전 도구 처리
  if (bot.tools.image_vision) {
    tools.push({
      type: "image_vision",
    });
  }

  return tools;
}
