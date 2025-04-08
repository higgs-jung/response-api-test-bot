import OpenAI from "openai";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 환영 메시지를 생성하는 함수 핸들러
 * @param {Object} params - 메시지 생성 파라미터
 * @param {string} params.name - 환영 대상자 이름
 * @param {string} params.organization - 소속 조직
 * @param {string} [params.title] - 직함/역할
 * @param {string} [params.style="formal"] - 메시지 스타일 (formal, casual, humorous, motivational)
 * @param {string} [params.occasion="입사"] - 환영 상황
 * @returns {Promise<Object>} 생성된 메시지 정보
 */
export default async function handler(params) {
  try {
    // 필수 파라미터 확인
    if (!params.name || !params.organization) {
      return {
        success: false,
        error: {
          message:
            "필수 정보가 누락되었습니다. 이름과 소속 정보를 제공해주세요.",
        },
      };
    }

    // 선택적 파라미터에 기본값 설정
    const title = params.title || "";
    const style = params.style || "formal";
    const occasion = params.occasion || "입사";

    // 프롬프트 구성
    const systemPrompt = `
      당신은 환영 메시지를 작성하는 전문가입니다. 
      다음 정보를 바탕으로 ${style} 스타일의 환영 메시지를 작성해주세요:
      - 이름: ${params.name}
      - 소속: ${params.organization}
      ${title ? `- 직함/역할: ${title}` : ""}
      - 상황: ${occasion}
      
      메시지는 간결하고 진심 어린 내용으로 작성하며, 200자 내외로 작성해주세요.
      한국어로 작성해주세요.
    `;

    // OpenAI API를 사용하여 메시지 생성
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `${params.name}님의 ${params.organization} ${occasion}을 환영하는 메시지를 작성해주세요.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const welcomeMessage = response.choices[0].message.content.trim();

    return {
      success: true,
      data: {
        welcomeMessage,
        name: params.name,
        organization: params.organization,
        style,
        occasion,
      },
      message: "환영 메시지가 생성되었습니다.",
    };
  } catch (error) {
    console.error("메시지 생성 에러:", error);

    return {
      success: false,
      error: {
        message: "환영 메시지 생성 중 오류가 발생했습니다.",
        details: error.message,
      },
    };
  }
}
