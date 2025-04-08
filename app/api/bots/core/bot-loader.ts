// 서버 사이드에서만 필요한 모듈 동적 임포트
const fs = require("fs");
const path = require("path");
import { BotDefinition, BotResponse } from "./bot-schema";

/**
 * 모든 등록된 봇을 로드합니다.
 */
export async function loadAllBots(): Promise<BotResponse> {
  try {
    const botsDir = path.join(process.cwd(), "bots");

    // 디렉토리가 없으면 생성
    if (!fs.existsSync(botsDir)) {
      fs.mkdirSync(botsDir, { recursive: true });
      return {
        success: true,
        message: "봇 디렉토리 생성됨, 등록된 봇 없음",
        data: [],
      };
    }

    const dirContents = fs.readdirSync(botsDir);
    const botFolders = dirContents.filter((f) => {
      const fullPath = path.join(botsDir, f);
      return fs.statSync(fullPath).isDirectory();
    });

    const bots = await Promise.all(
      botFolders.map(async (folder) => {
        try {
          return await loadBot(folder);
        } catch (error) {
          console.error(`봇 ${folder} 로드 실패:`, error);
          return null;
        }
      })
    );

    // null 값 필터링
    const validBots = bots.filter(Boolean) as BotDefinition[];

    return {
      success: true,
      message: `${validBots.length}개의 봇이 성공적으로 로드됨`,
      data: validBots,
    };
  } catch (error) {
    return {
      success: false,
      message: "봇 로드 중 오류 발생",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 특정 ID의 봇을 로드합니다.
 */
export async function loadBot(botId: string): Promise<BotDefinition | null> {
  try {
    const botDir = path.join(process.cwd(), "bots", botId);

    if (!fs.existsSync(botDir)) {
      return null;
    }

    // 각 파일 경로
    const configPath = path.join(botDir, "config.json");
    const promptPath = path.join(botDir, "prompt.md");
    const toolsPath = path.join(botDir, "tools.json");

    // 필수 파일이 없으면 null 반환
    if (
      !fs.existsSync(configPath) ||
      !fs.existsSync(promptPath) ||
      !fs.existsSync(toolsPath)
    ) {
      return null;
    }

    // 파일 읽기
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const prompt = fs.readFileSync(promptPath, "utf-8");
    const tools = JSON.parse(fs.readFileSync(toolsPath, "utf-8"));

    // 함수 파일이 있는 경우 로드 (선택 사항)
    let functions = undefined;
    const functionsPath = path.join(botDir, "functions.json");
    if (fs.existsSync(functionsPath)) {
      const functionData = JSON.parse(fs.readFileSync(functionsPath, "utf-8"));
      if (functionData.length > 0) {
        functions = functionData;
      }
    }

    return {
      id: botId,
      config,
      prompt,
      tools,
      functions,
    };
  } catch (error) {
    console.error(`봇 ${botId} 로드 오류:`, error);
    return null;
  }
}

/**
 * 봇 정보를 저장합니다.
 */
export async function saveBot(botData: BotDefinition): Promise<BotResponse> {
  try {
    const { id } = botData;
    const botDir = path.join(process.cwd(), "bots", id);

    // 디렉토리가 없으면 생성
    if (!fs.existsSync(botDir)) {
      fs.mkdirSync(botDir, { recursive: true });
    }

    // 각 파일 경로
    const configPath = path.join(botDir, "config.json");
    const promptPath = path.join(botDir, "prompt.md");
    const toolsPath = path.join(botDir, "tools.json");

    // 파일 저장
    fs.writeFileSync(
      configPath,
      JSON.stringify(botData.config, null, 2),
      "utf-8"
    );
    fs.writeFileSync(promptPath, botData.prompt, "utf-8");
    fs.writeFileSync(
      toolsPath,
      JSON.stringify(botData.tools, null, 2),
      "utf-8"
    );

    // 함수 파일이 있는 경우 저장
    if (botData.functions && botData.functions.length > 0) {
      const functionsPath = path.join(botDir, "functions.json");
      fs.writeFileSync(
        functionsPath,
        JSON.stringify(botData.functions, null, 2),
        "utf-8"
      );
    }

    return {
      success: true,
      message: `봇 ${id} 저장 완료`,
      data: { id },
    };
  } catch (error) {
    return {
      success: false,
      message: "봇 저장 중 오류 발생",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
