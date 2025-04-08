import OpenAI from "openai";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 환영 이미지를 생성하는 함수 핸들러
 * @param {Object} params - 이미지 생성 파라미터
 * @param {string} params.prompt - 이미지 생성을 위한 프롬프트
 * @param {string} [params.size="1024x1024"] - 이미지 크기 (1024x1024, 1024x1792, 1792x1024)
 * @param {string} [params.style="vivid"] - 이미지 스타일 (vivid, natural)
 * @param {string} [params.quality="standard"] - 이미지 품질 (standard, hd)
 * @returns {Promise<Object>} 생성된 이미지 정보
 */
export default async function handler(params) {
  try {
    // 필수 파라미터 확인
    if (!params.prompt || params.prompt.trim() === "") {
      return {
        success: false,
        error: {
          message: "이미지 프롬프트가 비어 있습니다.",
        },
      };
    }

    // 프롬프트 내용을 개선
    let prompt = params.prompt;
    // 프롬프트에 추가 설명 없이 깔끔하게 원본 메시지만 유지
    prompt = `웰컴메시지 이미지: "${prompt}". 텍스트를 명확하게 보여주고, 환영하는 분위기의 전문적인 디자인으로 표현해주세요.`;

    // 기본 파라미터 설정 - DALL-E 3가 지원하는 사이즈로 수정
    const size = validateSize(params.size) || "1792x1024";
    const style = params.style || "vivid";
    const quality = params.quality || "standard";

    console.log("이미지 생성 요청:", { prompt, size, style, quality });

    // DALL-E 3 모델을 사용하여 이미지 생성 (URL 형식으로 변경)
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      style,
      quality,
      response_format: "b64_json", // Base64 JSON 형식으로 변경
    });

    console.log("이미지 생성 응답 받음");
    // 응답 전체 구조 로깅 (민감한 정보 제외)
    console.log(
      "DALL-E 응답 전체 구조:",
      JSON.stringify(
        {
          created: response.created,
          data: response.data.map((item) => ({
            b64_json: "이미지 데이터 (긴 문자열로 생략됨)",
            revised_prompt: item.revised_prompt,
            model: "dall-e-3",
          })),
        },
        null,
        2
      )
    );

    // 첫 번째 이미지 데이터 상세 로깅
    console.log(
      "첫 번째 이미지 데이터:",
      JSON.stringify(
        {
          b64_json: "이미지 데이터 (긴 문자열로 생략됨)",
          revised_prompt: response.data[0]?.revised_prompt,
        },
        null,
        2
      )
    );

    // 응답에서 Base64 데이터 추출 및 검증
    const imageBase64 = response.data[0]?.b64_json;
    const revisedPrompt = response.data[0]?.revised_prompt || prompt;

    // 이미지 데이터가 유효하지 않은 경우 처리
    if (!imageBase64) {
      throw new Error("유효한 이미지 데이터가 생성되지 않았습니다.");
    }

    // 이미지 마크다운 형식으로 반환 (Base64 데이터 URL 사용)
    return {
      success: true,
      data: {
        imageBase64, // Base64 데이터
        revisedPrompt,
        markdownImage: `![환영 이미지](data:image/png;base64,${imageBase64})`,
        warning:
          "이 Base64 이미지 데이터는 만료되지 않으며 응답에 직접 포함됩니다.",
      },
      message: "환영 이미지가 성공적으로 생성되었습니다.",
    };
  } catch (error) {
    console.error("이미지 생성 에러:", error);

    return {
      success: false,
      error: {
        message: "이미지 생성 중 오류가 발생했습니다.",
        details: error.message || "알 수 없는 오류",
      },
    };
  }
}

/**
 * DALL-E 3에서 지원하는 이미지 크기인지 확인하는 함수
 * @param {string} size - 확인할 이미지 크기
 * @returns {string|null} - 유효한 경우 크기 문자열, 아니면 null
 */
function validateSize(size) {
  const validSizes = ["1024x1024", "1024x1792", "1792x1024"];

  if (!size || typeof size !== "string") {
    return null;
  }

  if (validSizes.includes(size)) {
    return size;
  }

  // 유효하지 않은 크기인 경우 null 반환
  return null;
}
