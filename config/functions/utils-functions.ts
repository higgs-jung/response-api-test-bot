// 유틸리티 함수들을 모아둔 파일

export const get_joke = async () => {
  const res = await fetch(`/api/functions/get_joke`).then((res) => res.json());
  return res;
};

/**
 * 현재 날짜를 가져오는 함수
 */
export const get_current_date = {
  name: "get_current_date",
  description: "현재 날짜를 가져옵니다. 행사 회차를 판단하는 데 사용됩니다.",
  parameters: {
    type: "object",
    properties: {},
    additionalProperties: false,
    required: [],
  },
};

/**
 * Canva 브랜드 템플릿을 자동으로 채우는 함수
 */
export const canva_autofill = {
  name: "canva_autofill",
  description: "Canva 브랜드 템플릿을 자동으로 채우고 디자인을 생성합니다.",
  parameters: {
    type: "object",
    properties: {
      templateId: {
        type: "string",
        description: "Canva 브랜드 템플릿 ID",
      },
      fields: {
        type: "object",
        description: "템플릿에 채울 필드 데이터 (키-값 쌍)",
        additionalProperties: {
          type: "string",
        },
      },
      accessToken: {
        type: "string",
        description: "Canva API 액세스 토큰",
      },
    },
    additionalProperties: false,
    required: ["templateId", "accessToken"],
  },
};

/**
 * Canva 브랜드 템플릿의 데이터셋 정보를 조회하는 함수
 */
export const canva_get_template = {
  name: "canva_get_template",
  description: "Canva 브랜드 템플릿의 데이터셋 정보를 조회합니다.",
  parameters: {
    type: "object",
    properties: {
      templateId: {
        type: "string",
        description: "Canva 브랜드 템플릿 ID",
      },
      accessToken: {
        type: "string",
        description: "Canva API 액세스 토큰",
      },
    },
    additionalProperties: false,
    required: ["templateId", "accessToken"],
  },
};

/**
 * 사용자의 Canva 디자인 목록을 조회하는 함수
 */
export const canva_designs_list = {
  name: "canva_designs_list",
  description: "사용자의 Canva 디자인 목록을 조회합니다.",
  parameters: {
    type: "object",
    properties: {
      accessToken: {
        type: "string",
        description: "Canva API 액세스 토큰",
      },
      limit: {
        type: "string",
        description: "반환할 최대 디자인 수 (기본값: 20)",
      },
      startTime: {
        type: "string",
        description: "조회 시작 시간 (ISO 8601 형식, 예: 2023-01-01T00:00:00Z)",
      },
      endTime: {
        type: "string",
        description: "조회 종료 시간 (ISO 8601 형식, 예: 2023-12-31T23:59:59Z)",
      },
    },
    additionalProperties: false,
    required: ["accessToken"],
  },
};

/**
 * EverArt API를 사용하여 이미지를 생성하는 함수
 */
export const everart_generate_image = function (parameters: any) {
  try {
    const { prompt, modelId, imageCount } = parameters;
    // 개발자 문서에 표시된 API 키를 기본값으로 사용
    const apiKey =
      parameters.apiKey ||
      "everart-yV3kMUUXTrYIJ0kblxKFtaog-7aGM04Gi07N6G5ovsc";

    return fetch("/api/functions/everart_generate_image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        modelId: modelId || "259826230810001408", // 기본 모델 ID 추가
        imageCount,
        apiKey,
        waitForResult: true, // 이미지 생성 완료까지 대기
        translateToEnglish: true, // 한국어 프롬프트를 영어로 번역
      }),
    }).then((response) => response.json());
  } catch (error) {
    console.error("EverArt 이미지 생성 오류:", error);
    return {
      success: false,
      error: "이미지 생성 처리 중 오류가 발생했습니다.",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

// 스키마 정의
Object.defineProperties(everart_generate_image, {
  name: { value: "everart_generate_image" },
  description: {
    value:
      "EverArt API를 사용하여 텍스트 프롬프트를 기반으로 이미지를 생성합니다.",
  },
  parameters: {
    value: {
      type: "object",
      properties: {
        modelId: {
          type: "string",
          description: "EverArt의 모델 ID (기본값: 259826230810001408)",
        },
        prompt: {
          type: "string",
          description:
            "이미지 생성에 사용할 텍스트 프롬프트 (한국어 입력 가능, 자동으로 영어로 번역됨)",
        },
        imageCount: {
          type: "integer",
          description: "생성할 이미지 수 (1-10, 기본값: 1)",
          minimum: 1,
          maximum: 10,
        },
        height: {
          type: "integer",
          description: "이미지 높이 (기본값: 1024)",
          minimum: 512,
          maximum: 2048,
        },
        width: {
          type: "integer",
          description: "이미지 너비 (기본값: 1024)",
          minimum: 512,
          maximum: 2048,
        },
        apiKey: {
          type: "string",
          description: "EverArt API 키 (선택 사항, 기본값: 내장 API 키)",
        },
        translateToEnglish: {
          type: "boolean",
          description: "한국어 프롬프트를 영어로 번역할지 여부 (기본값: true)",
        },
      },
      additionalProperties: false,
      required: ["prompt"],
    },
  },
});

/**
 * EverArt API에서 모델 목록을 조회하는 함수
 */
export const everart_get_models = function (parameters: any) {
  try {
    const { limit, beforeId, search, status } = parameters;
    // 개발자 문서에 표시된 API 키를 기본값으로 사용
    const apiKey =
      parameters.apiKey ||
      "everart-yV3kMUUXTrYIJ0kblxKFtaog-7aGM04Gi07N6G5ovsc";

    // 쿼리 파라미터 구성
    let url = `/api/functions/everart_get_models?apiKey=${apiKey}`;

    if (limit) {
      url += `&limit=${limit}`;
    }

    if (beforeId) {
      url += `&beforeId=${beforeId}`;
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    if (status) {
      url += `&status=${status}`;
    }

    return fetch(url).then((response) => response.json());
  } catch (error) {
    console.error("EverArt 모델 목록 조회 오류:", error);
    return {
      success: false,
      error: "모델 목록 조회 중 오류가 발생했습니다.",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

// 스키마 정의
Object.defineProperties(everart_get_models, {
  name: { value: "everart_get_models" },
  description: {
    value: "EverArt API에서 사용 가능한 모델 목록을 조회합니다.",
  },
  parameters: {
    value: {
      type: "object",
      properties: {
        apiKey: {
          type: "string",
          description: "EverArt API 키 (선택 사항, 기본값: 내장 API 키)",
        },
        limit: {
          type: "integer",
          description: "반환할 최대 모델 수 (기본값: 20)",
          minimum: 1,
          maximum: 100,
        },
        beforeId: {
          type: "string",
          description: "페이지네이션을 위한 이전 모델 ID",
        },
        search: {
          type: "string",
          description: "모델 이름으로 검색할 키워드",
        },
        status: {
          type: "string",
          enum: [
            "PENDING",
            "PROCESSING",
            "TRAINING",
            "READY",
            "FAILED",
            "CANCELED",
          ],
          description: "모델 상태에 따른 필터링",
        },
      },
      additionalProperties: false,
      required: [],
    },
  },
});

/**
 * EverArt API에서 생성된 이미지의 정보를 조회하는 함수
 */
export const everart_get_generation = function (parameters: any) {
  try {
    const { generationId } = parameters;
    // 개발자 문서에 표시된 API 키를 기본값으로 사용
    const apiKey =
      parameters.apiKey ||
      "everart-yV3kMUUXTrYIJ0kblxKFtaog-7aGM04Gi07N6G5ovsc";

    return fetch(
      `/api/functions/everart_get_generation?generationId=${generationId}&apiKey=${apiKey}`
    ).then((response) => response.json());
  } catch (error) {
    console.error("EverArt 생성 정보 조회 오류:", error);
    return {
      success: false,
      error: "생성 정보 조회 중 오류가 발생했습니다.",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

// 스키마 정의
Object.defineProperties(everart_get_generation, {
  name: { value: "everart_get_generation" },
  description: {
    value: "EverArt API에서 생성된 이미지의 정보를 조회합니다.",
  },
  parameters: {
    value: {
      type: "object",
      properties: {
        generationId: {
          type: "string",
          description: "조회할 생성 ID",
        },
        apiKey: {
          type: "string",
          description: "EverArt API 키 (선택 사항, 기본값: 내장 API 키)",
        },
      },
      additionalProperties: false,
      required: ["generationId"],
    },
  },
});

/**
 * EverArt API에 새로운 모델을 생성하는 함수
 */
export const everart_create_model = {
  name: "everart_create_model",
  description: "EverArt API에 새로운 모델을 생성합니다.",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "생성할 모델의 이름",
      },
      subject: {
        type: "string",
        enum: ["STYLE", "PERSON", "OBJECT"],
        description: "모델의 주제 유형",
      },
      imageUrls: {
        type: "array",
        items: {
          type: "string",
        },
        description: "모델 학습에 사용할 이미지 URL 배열 (1-25개)",
      },
      imageUploadTokens: {
        type: "array",
        items: {
          type: "string",
        },
        description:
          "/images/uploads 엔드포인트에서 얻은 업로드 토큰 배열 (1-25개)",
      },
      webhookUrl: {
        type: "string",
        description: "상태 업데이트를 받을 웹훅 URL (선택사항)",
      },
      apiKey: {
        type: "string",
        description: "EverArt API 키 (선택 사항, 기본값: 내장 API 키)",
      },
    },
    additionalProperties: false,
    required: ["name", "subject"],
  },
};

/**
 * EverArt API에 이미지를 업로드하기 위한 URL을 생성하는 함수
 */
export const everart_image_upload = {
  name: "everart_image_upload",
  description: "EverArt API에 이미지를 업로드하기 위한 URL을 생성합니다.",
  parameters: {
    type: "object",
    properties: {
      images: {
        type: "array",
        items: {
          type: "object",
          properties: {
            filename: {
              type: "string",
              description: "업로드할 이미지의 파일명",
            },
            content_type: {
              type: "string",
              enum: [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/heic",
                "image/heif",
              ],
              description: "이미지의 콘텐츠 타입",
            },
            id: {
              type: "string",
              description: "클라이언트 제공 ID (선택사항)",
            },
          },
          required: ["filename", "content_type"],
          additionalProperties: false,
        },
        description: "업로드할 이미지 정보 배열 (1-30개)",
      },
      apiKey: {
        type: "string",
        description: "EverArt API 키 (선택 사항, 기본값: 내장 API 키)",
      },
    },
    additionalProperties: false,
    required: ["images"],
  },
};
