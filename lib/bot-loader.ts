// 더 이상 사용하지 않는 파일입니다.
// app/api/bots/core/bot-schema.ts와 app/api/bots/core/bot-loader.ts로 이동했습니다.
// 이 파일은 호환성을 위해 유지되지만 실제로는 사용되지 않습니다.

import { BotDefinition } from "@/app/api/bots/core/bot-schema";

// 모든 봇 로드 (클라이언트에서 호출)
export async function loadAllBots(): Promise<BotDefinition[]> {
  try {
    console.log("fetch 요청 시작: /api/bots");
    // 캐시 무효화를 위해 타임스탬프 추가
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/bots?t=${timestamp}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    console.log("fetch 응답 상태:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("fetch 응답 데이터:", data);
    return data;
  } catch (error) {
    console.error("봇 목록 로드 실패:", error);
    return [];
  }
}

// 특정 봇 로드 (클라이언트에서 호출)
export async function loadBot(botId: string): Promise<BotDefinition> {
  try {
    console.log(`fetch 요청 시작: /api/bots/${botId}`);
    // 캐시 무효화를 위해 타임스탬프 추가
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/bots/${botId}?t=${timestamp}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    console.log("fetch 응답 상태:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("fetch 응답 데이터:", data);
    return data;
  } catch (error) {
    console.error(`봇 로드 실패 (ID: ${botId}):`, error);
    throw error;
  }
}

// 봇 저장/업데이트 (클라이언트에서 호출)
export async function saveBot(
  botId: string,
  botData: Omit<BotDefinition, "id">
): Promise<void> {
  try {
    console.log(`fetch 요청 시작 (POST): /api/bots/${botId}`);
    const response = await fetch(`/api/bots/${botId}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(botData),
    });

    console.log("fetch 응답 상태:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("fetch 응답 데이터:", data);
  } catch (error) {
    console.error(`봇 저장 실패 (ID: ${botId}):`, error);
    throw error;
  }
}
