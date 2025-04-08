import { NextRequest, NextResponse } from "next/server";

/**
 * EverArt 이미지 생성 API 함수
 *
 * POST 요청을 처리하여 EverArt API로 이미지 생성 요청을 전달합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { prompt, modelId, imageCount, waitForResult, translateToEnglish } =
      body;
    // API 키는 요청에서 받거나 환경 변수에서 가져옵니다
    const apiKey = body.apiKey || process.env.EVERART_API_KEY;

    // 필수 파라미터 검증
    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          message: "이미지 생성 프롬프트가 필요합니다.",
          error: "MISSING_PROMPT",
          data: null,
        },
        { status: 400 }
      );
    }

    // 누락된 필수 파라미터 확인
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: "EverArt API 키가 제공되지 않았습니다.",
        error: "MISSING_API_KEY",
      });
    }

    // 원본 프롬프트 저장
    const originalPrompt = prompt;
    let englishPrompt = prompt;
    let translatedText = "";

    // 프롬프트를 영어로 번역 (translateToEnglish가 true이고 한글이 포함된 경우)
    if (
      translateToEnglish &&
      /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/.test(
        prompt
      )
    ) {
      try {
        // OpenAI API 키 확인
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
          console.error("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.");
          // 번역 실패 시 원본 프롬프트 사용 (오류는 발생시키지 않음)
        } else {
          // OpenAI API를 사용하여 프롬프트 번역
          console.log("프롬프트 번역 시작:", prompt);

          const translateResponse = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${openaiApiKey}`,
              },
              body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a translator that specializes in translating Korean text to English for AI image generation. Translate the following Korean text to natural English, optimizing for image generation.",
                  },
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                temperature: 0.7,
                max_tokens: 150,
              }),
            }
          );

          if (!translateResponse.ok) {
            console.error(
              "번역 API 오류:",
              translateResponse.status,
              translateResponse.statusText
            );
            // 번역에 실패한 경우 원본 프롬프트 사용
          } else {
            const translateData = await translateResponse.json();

            if (
              translateData.choices &&
              translateData.choices.length > 0 &&
              translateData.choices[0].message
            ) {
              englishPrompt = translateData.choices[0].message.content.trim();
              translatedText = englishPrompt;
              console.log("번역된 프롬프트:", englishPrompt);
            }
          }
        }
      } catch (translateError) {
        console.error("프롬프트 번역 중 오류 발생:", translateError);
        // 번역에 실패한 경우 원본 프롬프트 사용
      }
    }

    console.log("EverArt 이미지 생성 요청:", {
      originalPrompt,
      englishPrompt,
      modelId,
    });

    try {
      // 콘솔에 요청 정보 상세 로깅
      console.log("EverArt API 요청 세부 정보:", {
        url: `https://api.everart.ai/v1/models/${modelId || "259826230810001408"}/generations`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: {
          prompt: englishPrompt,
          image_count: imageCount || 1,
          type: "txt2img",
        },
      });

      // 내장 fetch API 사용
      const everartResponse = await fetch(
        `https://api.everart.ai/v1/models/${modelId || "259826230810001408"}/generations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            prompt: englishPrompt,
            image_count: imageCount || 1,
            type: "txt2img",
          }),
          cache: "no-store",
        }
      );

      // 응답 상태 및 헤더 로깅
      console.log(
        "EverArt API 응답 상태:",
        everartResponse.status,
        everartResponse.statusText
      );
      console.log(
        "EverArt API 응답 헤더:",
        Object.fromEntries(everartResponse.headers.entries())
      );

      // 응답 본문 텍스트로 먼저 가져옴
      const responseText = await everartResponse.text();
      console.log(
        "EverArt API 응답 본문 일부:",
        responseText.substring(0, 150)
      );

      if (!everartResponse.ok) {
        let errorDetails;
        try {
          // JSON 파싱 시도
          errorDetails = JSON.parse(responseText);
        } catch (e) {
          // HTML이나 다른 형식인 경우
          errorDetails = { raw: responseText.substring(0, 500) };
        }

        console.error("EverArt API 오류:", errorDetails);

        return NextResponse.json(
          {
            success: false,
            message: "EverArt API 요청 실패",
            error: "API_REQUEST_FAILED",
            data: {
              details: errorDetails,
              status: everartResponse.status,
              statusText: everartResponse.statusText,
            },
          },
          { status: everartResponse.status }
        );
      }

      // 성공 응답 파싱
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return NextResponse.json(
          {
            success: false,
            message: "EverArt API에서 유효하지 않은 JSON 응답",
            error: "INVALID_JSON_RESPONSE",
            data: {
              raw: responseText.substring(0, 500),
            },
          },
          { status: 500 }
        );
      }

      console.log("EverArt 이미지 생성 성공:", data);

      // 번역 정보 추가
      data.original_prompt = originalPrompt;
      data.translated_prompt = translatedText;

      // 이미지 생성 완료까지 대기해야 하는 경우
      if (waitForResult && data?.generations?.length > 0) {
        const generationId = data.generations[0].id;
        console.log(`이미지 생성 완료 대기 중: ${generationId}`);

        // 완료된 이미지를 얻기 위한 폴링 함수
        const getCompletedImage = async (
          id: string,
          maxAttempts = 10,
          intervalMs = 3000
        ) => {
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            console.log(
              `이미지 상태 확인 중... 시도: ${attempt + 1}/${maxAttempts}`
            );

            // 잠시 대기
            await new Promise((resolve) => setTimeout(resolve, intervalMs));

            try {
              // 생성 상태 확인 요청
              const statusResponse = await fetch(
                `https://api.everart.ai/v1/generations/${id}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                  },
                  cache: "no-store",
                }
              );

              if (!statusResponse.ok) {
                console.error(
                  `이미지 상태 확인 실패: ${statusResponse.status}`
                );
                continue;
              }

              const statusData = await statusResponse.json();
              console.log(`이미지 상태: ${statusData.generation?.status}`);

              // 생성 완료 확인
              if (
                statusData.generation?.status === "SUCCEEDED" &&
                statusData.generation?.image_url
              ) {
                return statusData;
              }

              // 실패 상태 확인
              if (
                statusData.generation?.status === "FAILED" ||
                statusData.generation?.status === "CANCELED"
              ) {
                return {
                  error: `이미지 생성 실패: ${statusData.generation.status}`,
                  statusData,
                };
              }
            } catch (error) {
              console.error("이미지 상태 확인 오류:", error);
            }
          }

          return null; // 최대 시도 횟수를 초과한 경우
        };

        // 완료된 이미지 데이터 가져오기
        const completedData = await getCompletedImage(generationId);

        if (completedData) {
          if (completedData.error) {
            console.error(completedData.error);
            return NextResponse.json({
              success: false,
              message: completedData.error,
              error: "IMAGE_GENERATION_FAILED",
              data: {
                statusData: completedData.statusData,
                originalData: data,
                original_prompt: originalPrompt,
                translated_prompt: translatedText,
              },
            });
          }

          // 번역 정보 추가
          completedData.original_prompt = originalPrompt;
          completedData.translated_prompt = translatedText;

          // 성공적으로 이미지가 생성된 경우
          return NextResponse.json({
            success: true,
            message: "이미지 생성이 완료되었습니다.",
            error: null,
            data: {
              ...completedData,
              image_url: completedData.generation?.image_url,
              original_prompt: originalPrompt,
              translated_prompt: translatedText,
            },
          });
        } else {
          // 시간 초과로 완료된 이미지를 가져오지 못한 경우
          return NextResponse.json({
            success: true,
            message:
              "이미지 생성이 시작되었지만 아직 완료되지 않았습니다. 생성 ID로 나중에 확인해주세요.",
            error: null,
            data: {
              ...data,
              generationId: generationId,
              original_prompt: originalPrompt,
              translated_prompt: translatedText,
            },
          });
        }
      }

      // 응답 반환 (waitForResult가 false인 경우)
      return NextResponse.json({
        success: true,
        message: "이미지 생성 요청이 성공적으로 전송되었습니다.",
        error: null,
        data: {
          ...data,
          original_prompt: originalPrompt,
          translated_prompt: translatedText,
        },
      });
    } catch (fetchError: any) {
      console.error("EverArt API 통신 오류:", fetchError);
      return NextResponse.json(
        {
          success: false,
          message: "EverArt API 통신 중 오류가 발생했습니다.",
          error: "API_COMMUNICATION_ERROR",
          data: {
            details: fetchError.message,
          },
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("EverArt 이미지 생성 오류:", error);

    return NextResponse.json(
      {
        success: false,
        message: "이미지 생성 처리 중 오류가 발생했습니다.",
        error: "PROCESSING_ERROR",
        data: {
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
