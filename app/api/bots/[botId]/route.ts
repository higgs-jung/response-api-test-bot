import { NextRequest, NextResponse } from "next/server";
import { loadBot, saveBot } from "../core/bot-loader";
import { BotDefinition } from "../core/bot-schema";

/**
 * 특정 봇 정보를 가져오는 API
 */
export async function GET(
  request: NextRequest,
  context: { params: { botId: string } }
) {
  try {
    // Next.js 15에서는 params를 기다려야 함
    const params = await context.params;
    const botId = params.botId;
    console.log(`특정 봇 조회 API 호출됨: ${botId}`, request.url);

    const bot = await loadBot(botId);

    if (!bot) {
      return new NextResponse(
        JSON.stringify({ error: `봇을 찾을 수 없습니다: ${botId}` }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    console.log(`봇 ${botId} 로드 완료`);
    return new NextResponse(JSON.stringify(bot), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error(`봇 로드 오류:`, error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}

/**
 * 봇 저장/업데이트 API
 */
export async function POST(
  request: NextRequest,
  context: { params: { botId: string } }
) {
  try {
    // Next.js 15에서는 params를 기다려야 함
    const params = await context.params;
    const botId = params.botId;
    console.log(`봇 저장 API 호출됨: ${botId}`, request.url);

    const botData = (await request.json()) as BotDefinition;

    // 경로의 botId와 데이터의 id가 일치하는지 확인
    if (botData.id !== botId) {
      botData.id = botId; // ID 일치시키기
    }

    const result = await saveBot(botData);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: result.error || result.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    console.log(`봇 ${botId} 저장 완료`);
    return new NextResponse(JSON.stringify({ success: true, id: botId }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error(`봇 저장 오류:`, error);
    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}
