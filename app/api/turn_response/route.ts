import { MODEL } from "@/config/constants";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { messages, tools } = await request.json();
    console.log("Received messages:", messages);

    // 메시지 검증 및 필터링
    const validMessages = messages.filter((message: any) => {
      // function_call_output 메시지에서 call_id가 없는 경우 필터링
      if (message.type === "function_call_output" && !message.call_id) {
        console.log(
          "Filtering out function_call_output without call_id:",
          message
        );
        return false;
      }
      return true;
    });

    const openai = new OpenAI();

    console.log("Using tools:", JSON.stringify(tools, null, 2));

    // 도구 타입 정의
    interface FunctionToolOld {
      type: string;
      function?: {
        name: string;
        description?: string;
        parameters?: any;
      };
    }

    const validatedTools = tools.map((tool: FunctionToolOld) => {
      // 도구가 이미 올바른 형식인지 확인
      if (tool.type === "function" && tool.function) {
        // 이전 형식을 새 형식으로 변환
        return {
          type: "function",
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
        };
      }
      return tool;
    });

    console.log(
      "API 호출에 사용될 최종 도구 형식:",
      JSON.stringify(validatedTools, null, 2)
    );

    const events = await openai.responses.create({
      model: MODEL,
      input: validMessages,
      tools: validatedTools,
      stream: true,
      parallel_tool_calls: false,
      tool_choice: "auto",
    });

    // Create a ReadableStream that emits SSE data
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of events) {
            // Sending all events to the client
            const data = JSON.stringify({
              event: event.type,
              data: event,
            });
            controller.enqueue(`data: ${data}\n\n`);
          }
          // End of stream
          controller.close();
        } catch (error) {
          console.error("Error in streaming loop:", error);
          controller.error(error);
        }
      },
    });

    // Return the ReadableStream as SSE
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
