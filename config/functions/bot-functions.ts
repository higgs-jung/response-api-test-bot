// 클라이언트 사이드에서 작동하도록 수정 - 서버 종속성 제거
// BotDefinition 타입은 더 이상 사용하지 않으므로 import 제거

// 클라이언트 측에서 사용 가능한 핸들러 맵을 직접 정의
const clientSideHandlers: Record<string, (params: any) => Promise<any>> = {
  // 환영 이미지 생성 함수
  generate_welcome_image: async (params: any) => {
    try {
      // API 라우트를 사용하여 서버에서 처리
      const response = await fetch("/api/handlers/generate_welcome_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("이미지 생성 API 오류:", errorData);
        return {
          success: false,
          error: {
            message: errorData.error || "이미지 생성 중 오류가 발생했습니다.",
            details: errorData.details || "서버 응답 오류",
          },
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("이미지 생성 요청 오류:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다",
          details: "클라이언트 측 오류",
        },
      };
    }
  },

  // 환영 메시지 생성 함수
  create_welcome_message: async (params: any) => {
    try {
      // API 라우트를 사용하여 서버에서 처리
      const response = await fetch("/api/handlers/create_welcome_message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("메시지 생성 API 오류:", errorData);
        return {
          success: false,
          error: {
            message: errorData.error || "메시지 생성 중 오류가 발생했습니다.",
            details: errorData.details || "서버 응답 오류",
          },
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("메시지 생성 요청 오류:", error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다",
          details: "클라이언트 측 오류",
        },
      };
    }
  },
};

// 봇 함수 객체 - 직접 정의된 핸들러 사용
export const botFunctions = clientSideHandlers;
