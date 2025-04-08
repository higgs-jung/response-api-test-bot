import { toolsList } from "../../config/tools-list";
import useToolsStore from "@/stores/useToolsStore";
import { WebSearchConfig } from "@/stores/useToolsStore";
import { BotDefinition } from "@/app/api/bots/core/bot-schema";

interface WebSearchTool extends WebSearchConfig {
  type: "web_search";
}

// 봇 설정을 받아서 도구를 생성하는 함수
export const getCustomizedTools = (bot?: BotDefinition) => {
  const {
    webSearchEnabled,
    fileSearchEnabled,
    functionsEnabled,
    vectorStore,
    webSearchConfig,
  } = useToolsStore.getState();

  // 봇이 정의되어 있으면 봇 설정 사용, 아니면 스토어 설정 사용
  const useWebSearch = bot ? bot.tools.web_search : webSearchEnabled;
  const useFileSearch = bot ? bot.tools.file_search : fileSearchEnabled;
  const useFunction = bot ? true : functionsEnabled; // 봇이 정의되어 있으면 항상 함수 사용

  const tools = [];

  console.log(`[getCustomizedTools] 봇: ${bot?.id || "없음"}`);

  // 함수 도구를 먼저 추가
  if (useFunction && bot) {
    // 1. functions.json에서 로드된 함수 추가
    if (
      bot.functions &&
      Array.isArray(bot.functions) &&
      bot.functions.length > 0
    ) {
      console.log(
        `[getCustomizedTools] 봇 ${bot.id}의 함수 정의 ${bot.functions.length}개 사용`
      );
      console.log(
        `[getCustomizedTools] 함수 이름 목록: ${bot.functions.map((f) => f.name).join(", ")}`
      );

      // functions.json에 정의된 함수 추가
      tools.push(
        ...bot.functions.map((func) => {
          // 기본 파라미터 준비 (깊은 복사 수행)
          const parameters = JSON.parse(JSON.stringify(func.parameters || {}));

          // 필수 속성 확인
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

    // 2. tools.json에서 정의된 함수도 추가 (만약 functions.json에 없는 경우)
    if (bot.tools && Array.isArray(bot.tools)) {
      // tools 배열에서 function 타입만 필터링
      const toolFunctions = bot.tools.filter(
        (tool) =>
          tool.type === "function" && tool.function && tool.function.name
      );

      if (toolFunctions.length > 0) {
        console.log(
          `[getCustomizedTools] 봇 ${bot.id}의 tools.json에서 함수 정의 ${toolFunctions.length}개 추가`
        );
        console.log(
          `[getCustomizedTools] tools.json 함수 목록: ${toolFunctions.map((t) => t.function.name).join(", ")}`
        );

        // 이미 추가된 함수 이름 목록 생성
        const existingFunctionNames = tools
          .filter((t) => t.type === "function")
          .map((t) => t.name);

        // tools.json에서 정의된 함수 중 아직 추가되지 않은 것만 추가
        for (const tool of toolFunctions) {
          if (!existingFunctionNames.includes(tool.function.name)) {
            // 올바른 형식으로 변환
            const correctFormatTool = {
              type: "function",
              name: tool.function.name,
              description: tool.function.description,
              parameters: tool.function.parameters,
            };
            tools.push(correctFormatTool);
          }
        }
      }
    }

    if (tools.length === 0) {
      console.log(
        `[getCustomizedTools] 봇 ${bot?.id || "unknown"}에 함수 정의가 없어서 함수를 추가하지 않습니다.`
      );
    }
  } else if (!useFunction) {
    console.log(
      `[getCustomizedTools] 봇 ${bot?.id || "unknown"}에서 함수 기능이 비활성화되어 있습니다.`
    );
  }

  // 웹 검색 도구 추가
  if (useWebSearch) {
    console.log(`[getCustomizedTools] 웹 검색 도구 추가`);
    const webSearchTool: WebSearchTool = {
      type: "web_search",
    };
    if (
      webSearchConfig.user_location &&
      (webSearchConfig.user_location.country !== "" ||
        webSearchConfig.user_location.region !== "" ||
        webSearchConfig.user_location.city !== "")
    ) {
      webSearchTool.user_location = webSearchConfig.user_location;
    }

    tools.push(webSearchTool);
  }

  // 파일 검색 도구 추가 - 단순화된 방식
  if (useFileSearch) {
    // 벡터 스토어 ID 검색 순서: 1. 봇 설정, 2. 스토어 설정
    const vectorStoreId = bot?.tools.vector_store?.id || vectorStore?.id;

    if (vectorStoreId && typeof vectorStoreId === "string") {
      console.log(
        `[getCustomizedTools] 파일 검색 도구 추가 (벡터 스토어 ID: ${vectorStoreId})`
      );

      tools.push({
        type: "file_search",
        vector_store_ids: [vectorStoreId],
      });
    } else {
      console.warn(
        `[getCustomizedTools] 파일 검색이 활성화되었지만 유효한 벡터 스토어 ID가 없습니다.`
      );
    }
  }

  console.log(
    `[getCustomizedTools] 생성된 도구 (${tools.length}개): ${tools
      .map((t) => {
        if (t.type === "function") {
          // TypeScript 타입 단언으로 t가 함수 타입임을 명시
          return (t as any).name || t.type;
        } else {
          return t.type;
        }
      })
      .join(", ")}`
  );

  return tools;
};

// 기존 함수는 유지하고 새로운 함수 호출
export const getTools = (bot?: BotDefinition) => {
  console.log(`[getTools] 호출됨, 봇: ${bot?.id || "없음"}`);
  console.log(
    `[getTools] 봇의 함수 정의 있음: ${bot?.functions ? "O" : "X"}, 개수: ${bot?.functions?.length || 0}`
  );
  return getCustomizedTools(bot);
};
