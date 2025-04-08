import { functionsMap } from "../../config/functions";

type ToolName = keyof typeof functionsMap;

export const handleTool = async (toolName: any, parameters: any) => {
  console.log(`Handle tool '${toolName}' with parameters:`, parameters);

  try {
    // 사용 가능한 함수 목록 출력 (디버깅용)
    const availableFunctions = Object.keys(functionsMap);
    console.log(
      `Available functions (${availableFunctions.length}):`,
      availableFunctions.join(", ")
    );

    // 요청된 함수가 목록에 있는지 확인
    const functionExists = toolName in functionsMap;
    console.log(
      `Function '${toolName}' exists: ${functionExists ? "YES" : "NO"}`
    );

    if (functionExists) {
      const handler = functionsMap[toolName];

      if (typeof handler === "function") {
        console.log(`Calling function '${toolName}'...`);
        const result = await handler(parameters);
        console.log(
          `Function '${toolName}' result:`,
          result?.success ? "SUCCESS" : "FAILED"
        );
        return result;
      } else {
        console.error(
          `Tool '${toolName}' exists but is not a function:`,
          typeof handler
        );
        return {
          error: `Tool '${toolName}' exists but is not callable.`,
          status: "error",
        };
      }
    } else {
      console.error(
        `Unknown tool: '${toolName}'. Available tools: ${availableFunctions.join(", ")}`
      );
      return {
        error: `Tool '${toolName}' is not implemented or not available.`,
        status: "error",
      };
    }
  } catch (error) {
    console.error(`Error executing tool '${toolName}':`, error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
      status: "error",
      details: error,
    };
  }
};
