// 역할 토론 관련 함수들을 모아둔 파일

import { v4 as uuid } from "uuid";

// 토론 상태를 저장할 인메모리 객체 (실제 구현시에는 데이터베이스 사용 권장)
const debates = new Map<string, DebateSession>();

// 토론 세션 인터페이스
interface DebateSession {
  id: string;
  topic: string;
  roles: string[];
  turns: DebateTurn[];
  currentTurn: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 토론 턴 인터페이스
interface DebateTurn {
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

/**
 * 새로운 토론을 시작하는 함수
 * @param topic 토론 주제
 * @param roles 토론에 참여할 역할 목록
 * @param debate_id 토론 ID (선택 사항)
 * @returns 토론 세션 정보
 */
export const start_debate = async ({
  topic,
  roles,
  debate_id = uuid(),
}: {
  topic: string;
  roles: string[];
  debate_id?: string;
}) => {
  try {
    // 새 토론 세션 생성
    const newDebate: DebateSession = {
      id: debate_id,
      topic,
      roles,
      turns: [],
      currentTurn: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 토론 저장
    debates.set(debate_id, newDebate);

    return {
      success: true,
      message: "토론이 성공적으로 시작되었습니다.",
      data: {
        debate_id,
        topic,
        roles,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "토론 시작 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

/**
 * 특정 역할의 AI에게 토론 맥락에 맞는 응답을 요청하는 함수
 * @param debate_id 토론 ID
 * @param role 응답을 생성할 역할
 * @param prompt 응답 프롬프트 (선택 사항)
 * @returns 생성된 응답
 */
export const get_role_response = async ({
  debate_id,
  role,
  prompt,
}: {
  debate_id: string;
  role: string;
  prompt?: string;
}) => {
  try {
    // 토론 세션 가져오기
    const debate = debates.get(debate_id);

    if (!debate) {
      throw new Error(`ID ${debate_id}에 해당하는 토론을 찾을 수 없습니다.`);
    }

    // 역할이 토론에 참여 중인지 확인
    if (!debate.roles.includes(role)) {
      throw new Error(`역할 '${role}'은(는) 이 토론에 참여하고 있지 않습니다.`);
    }

    // 역할에 따른 응답 생성 로직
    let response = "";
    const topic = debate.topic;

    // 이전 턴들의 내용을 수집하여 컨텍스트 구성
    const previousTurns = debate.turns
      .map((turn) => `${turn.role}: ${turn.content}`)
      .join("\n\n");
    const context = `토론 주제: ${topic}\n\n이전 턴들:\n${previousTurns}`;

    // 역할별 응답 스타일에 맞게 응답 생성
    switch (role.toLowerCase()) {
      case "긍정적":
      case "positive":
        response = `긍정적 관점에서 ${topic}에 대한 의견을 제시합니다.
        
이 주제의 잠재적 이점과 긍정적 측면을 강조하자면, ${topic}은 혁신과 발전을 위한 중요한 기회를 제공합니다. 
기존 연구와 성공 사례에 따르면, 이러한 접근법은 다양한 분야에서 긍정적인 결과를 이끌어낼 수 있습니다.

특히 주목할 만한 이점으로는:
1. 효율성과 생산성 향상
2. 새로운 가능성과 기회 창출
3. 기존 문제에 대한 혁신적인 해결책

물론 도전과제가 있을 수 있지만, 이는 적절한 계획과 구현을 통해 극복 가능합니다. 장기적 관점에서 볼 때, ${topic}은 지속가능한 발전을 위한 중요한 단계가 될 것입니다.`;
        break;

      case "회의적":
      case "skeptical":
        response = `회의적 관점에서 ${topic}에 대한 의견을 제시합니다.
        
${topic}에 대해 회의적인 입장에서 볼 때, 몇 가지 심각한 우려사항과 잠재적 위험이 존재합니다.
실제 사례와 연구 데이터를 살펴보면, 이러한 접근법은 다음과 같은 문제점을 내포하고 있습니다:

주요 우려사항으로는:
1. 현실적 구현의 어려움과 비용 문제
2. 예상치 못한 부작용과 역효과 가능성
3. 윤리적, 사회적 영향에 대한 불충분한 고려

이러한 관점에서 볼 때, 더 신중하고 단계적인 접근방식이 필요합니다. 현재 제안된 방식보다 더 균형 잡힌 대안을 모색해야 합니다.`;
        break;

      case "중립적":
      case "neutral":
        response = `중립적 관점에서 ${topic}에 대한 의견을 제시합니다.
        
${topic}에 대해 균형 잡힌 시각으로 분석하자면, 이 주제는 다양한 측면에서 평가될 필요가 있습니다.

한편으로는, 이 접근법이 제공하는 혁신적 가능성과 효율성 향상은 주목할 만합니다. 특히 특정 상황에서는 상당한 이점을 제공할 수 있습니다.

반면에, 구현 과정의 현실적 도전과제와 잠재적 부작용 역시 간과할 수 없는 중요한 고려사항입니다.

이러한 양면성을 고려할 때, 맥락과 구체적 상황에 따른 차별화된 접근이 필요합니다. 모든 상황에 적용 가능한 단일 해답보다는, 특정 조건과 환경에 맞춘 유연한 접근법이 더 효과적일 것입니다.

결론적으로, ${topic}은 이분법적 판단보다 통합적 사고를 통해 그 가치와 한계를 함께 고려하는 것이 중요합니다.`;
        break;

      default:
        // 기타 역할이나 진행자의 경우 일반적 응답
        response = `${role} 역할의 관점: ${topic}에 대한 견해입니다. 이 토론에서 다양한 관점을 고려하는 것이 중요합니다.`;
    }

    // 턴 기록 저장
    const newTurn: DebateTurn = {
      id: uuid(),
      role,
      content: response,
      timestamp: new Date().toISOString(),
    };

    debate.turns.push(newTurn);
    debate.updatedAt = new Date().toISOString();

    return {
      success: true,
      message: `${role} 역할의 응답이 생성되었습니다.`,
      data: {
        response,
        turn_id: newTurn.id,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "역할 응답 생성 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

/**
 * 토론의 다음 턴으로 진행하는 함수
 * @param debate_id 토론 ID
 * @param current_role 현재 발언 중인 역할
 * @param action 다음 행동 유형 (next, question, summary)
 * @returns 다음 턴 정보
 */
export const next_turn = async ({
  debate_id,
  current_role,
  action,
}: {
  debate_id: string;
  current_role: string;
  action: string;
}) => {
  try {
    // 토론 세션 가져오기
    const debate = debates.get(debate_id);
    if (!debate) {
      throw new Error(`ID ${debate_id}에 해당하는 토론을 찾을 수 없습니다.`);
    }

    // 현재 역할이 토론에 참여 중인지 확인
    if (!debate.roles.includes(current_role)) {
      throw new Error(
        `역할 '${current_role}'은(는) 이 토론에 참여하고 있지 않습니다.`
      );
    }

    // 다음 턴 결정
    let nextRole = "";
    let nextAction = "";

    if (action === "next") {
      // 순차적으로 다음 역할로 이동
      const currentIndex = debate.roles.indexOf(current_role);
      const nextIndex = (currentIndex + 1) % debate.roles.length;
      nextRole = debate.roles[nextIndex];
      nextAction = "의견 제시";
    } else if (action === "question") {
      // 진행자가 질문을 던지는 턴
      nextRole = "진행자";
      nextAction = "질문";
    } else if (action === "summary") {
      // 진행자가 요약을 제공하는 턴
      nextRole = "진행자";
      nextAction = "요약";
    } else {
      throw new Error(`알 수 없는 액션 유형: ${action}`);
    }

    // 턴 업데이트
    debate.currentTurn += 1;
    debate.updatedAt = new Date().toISOString();

    return {
      success: true,
      message: "다음 턴으로 진행됩니다.",
      data: {
        next_role: nextRole,
        action: nextAction,
        turn_number: debate.currentTurn,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "다음 턴 진행 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

/**
 * 진행 중인 토론에 새 역할을 추가하는 함수
 * @param debate_id 토론 ID
 * @param role 추가할 역할
 * @param introduction 새 역할의 소개 내용 (선택 사항)
 * @returns 업데이트된 역할 목록
 */
export const add_role = async ({
  debate_id,
  role,
  introduction,
}: {
  debate_id: string;
  role: string;
  introduction?: string;
}) => {
  try {
    // 토론 세션 가져오기
    const debate = debates.get(debate_id);
    if (!debate) {
      throw new Error(`ID ${debate_id}에 해당하는 토론을 찾을 수 없습니다.`);
    }

    // 역할이 이미 존재하는지 확인
    if (debate.roles.includes(role)) {
      throw new Error(`역할 '${role}'은(는) 이미 이 토론에 참여하고 있습니다.`);
    }

    // 새 역할 추가
    debate.roles.push(role);
    debate.updatedAt = new Date().toISOString();

    // 소개 턴 추가 (있는 경우)
    if (introduction) {
      const introTurn: DebateTurn = {
        id: uuid(),
        role,
        content: introduction,
        timestamp: new Date().toISOString(),
      };
      debate.turns.push(introTurn);
    }

    return {
      success: true,
      message: `역할 '${role}'이(가) 토론에 추가되었습니다.`,
      data: {
        roles: debate.roles,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "역할 추가 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

/**
 * 토론 내용을 요약하는 함수
 * @param debate_id 토론 세션 ID
 * @returns 토론 요약 정보
 */
export const summarize_debate = async ({
  debate_id,
}: {
  debate_id: string;
}) => {
  try {
    // 토론 ID 검증
    if (!debate_id) {
      throw new Error("토론 ID가 필요합니다.");
    }

    // 토론 세션 검색
    const debate = debates.get(debate_id);
    if (!debate) {
      throw new Error(`ID ${debate_id}에 해당하는 토론을 찾을 수 없습니다.`);
    }

    // 토론이 아직 시작되지 않은 경우
    if (debate.turns.length === 0) {
      throw new Error("아직 토론이 시작되지 않았습니다.");
    }

    // 각 역할별 발언 수집
    const roleStatements: Record<string, string[]> = {};

    // 역할별 빈 배열 초기화
    for (const role of debate.roles) {
      roleStatements[role] = [];
    }

    // 발언 내용 수집
    for (const turn of debate.turns) {
      if (roleStatements[turn.role]) {
        roleStatements[turn.role].push(turn.content);
      }
    }

    // 각 역할별 주요 주장 요약
    const roleSummaries: Record<string, string> = {};
    for (const role of debate.roles) {
      if (roleStatements[role].length > 0) {
        // 여기서는 간단히 마지막 발언으로 요약을 대체하지만,
        // 실제로는 OpenAI API를 사용해 요약을 생성할 수 있습니다.
        roleSummaries[role] =
          `${role}의 마지막 발언: ${roleStatements[role][roleStatements[role].length - 1]}`;
      } else {
        roleSummaries[role] = `${role}은(는) 아직 발언하지 않았습니다.`;
      }
    }

    return {
      success: true,
      message: "토론 요약이 생성되었습니다.",
      data: {
        debate_id,
        topic: debate.topic,
        turn_count: debate.turns.length,
        last_updated: debate.updatedAt,
        role_summaries: roleSummaries,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "토론 요약 생성 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

/**
 * 토론을 종료하고 최종 요약을 제공하는 함수
 * @param debate_id 토론 ID
 * @param conclusion_type 결론 유형 (consensus, perspectives, open)
 * @returns 토론 종료 정보 및 최종 요약
 */
export const end_debate = async ({
  debate_id,
  conclusion_type = "perspectives",
}: {
  debate_id: string;
  conclusion_type?: string;
}) => {
  try {
    // 토론 세션 가져오기
    const debate = debates.get(debate_id);
    if (!debate) {
      throw new Error(`ID ${debate_id}에 해당하는 토론을 찾을 수 없습니다.`);
    }

    // 토론 비활성화
    debate.isActive = false;
    debate.updatedAt = new Date().toISOString();

    // 결론 생성 (실제 구현에서는 OpenAI API 호출 등으로 대체)
    let conclusion = "";
    if (conclusion_type === "consensus") {
      conclusion = `"${debate.topic}" 주제에 대한 주요 합의점은 다음과 같습니다: [합의점 내용]`;
    } else if (conclusion_type === "perspectives") {
      conclusion = `"${debate.topic}" 주제에 대한 각 역할의 주요 관점은 다음과 같습니다: [각 역할별 관점]`;
    } else if (conclusion_type === "open") {
      conclusion = `"${debate.topic}" 주제에 대한 토론을 통해 다양한 의견이 제시되었으며, 이 주제는 계속해서 탐구가 필요합니다.`;
    } else {
      conclusion = `"${debate.topic}" 주제에 대한 토론이 종료되었습니다.`;
    }

    return {
      success: true,
      message: "토론이 성공적으로 종료되었습니다.",
      data: {
        topic: debate.topic,
        conclusion,
        turn_count: debate.turns.length,
        duration:
          new Date(debate.updatedAt).getTime() -
          new Date(debate.createdAt).getTime(),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "토론 종료 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

/**
 * 토론 주제에 관한 정보를 검색하는 함수
 * @param topic 검색할 주제
 * @param aspect 주제의 특정 측면 (선택 사항)
 * @param limit 검색 결과 수 제한 (선택 사항)
 * @returns 검색 결과
 */
export const search_for_topic_info = async ({
  topic,
  aspect,
  limit = 5,
}: {
  topic: string;
  aspect?: string;
  limit?: number;
}) => {
  try {
    // 실제 구현에서는 웹 검색 API를 호출하거나 데이터베이스에서 검색
    // 여기서는 가상의 검색 결과 반환
    const query = aspect ? `${topic} ${aspect}` : topic;

    return {
      success: true,
      message: "주제 정보 검색이 완료되었습니다.",
      data: {
        query,
        results: [
          `${topic}에 대한 검색 결과입니다. 실제 구현에서는 웹 검색 API를 사용하세요.`,
        ],
        source: "가상 검색 결과",
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "주제 정보 검색 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

/**
 * 벡터 스토어에서 토론 관련 정보를 검색하는 함수
 * @param query 검색 쿼리
 * @param limit 반환할 최대 결과 수
 * @param vector_store_id 검색할 벡터 스토어 ID
 * @returns 검색 결과
 */
export const search_vector_store = async ({
  query,
  limit = 5,
  vector_store_id = "vs_67f4af0cc6608191972fec1243828947", // 토론 벡터스토어 ID
}: {
  query: string;
  limit?: number;
  vector_store_id?: string;
}) => {
  try {
    // 벡터 스토어 검색 API 호출
    const searchParams = new URLSearchParams({
      query,
      limit: limit.toString(),
      vector_store_id,
    });

    const response = await fetch(
      `/api/functions/search_vector_store?${searchParams}`
    ).then((res) => res.json());

    return {
      success: true,
      message: "벡터 스토어 검색이 완료되었습니다.",
      data: response.data || [],
      total: response.data?.length || 0,
    };
  } catch (error) {
    return {
      success: false,
      message: "벡터 스토어 검색 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      data: [],
      total: 0,
    };
  }
};

/**
 * 새로운 토론 세션을 생성하는 함수
 * @param topic 토론 주제
 * @param roles 토론에 참여할 역할들 (기본값: ["긍정적", "부정적", "중립적"])
 * @returns 생성된 토론 세션 정보
 */
export const create_debate = async ({
  topic,
  roles = ["긍정적", "부정적", "중립적"],
  initial_prompt,
}: {
  topic: string;
  roles?: string[];
  initial_prompt?: string;
}) => {
  try {
    // 입력 검증
    if (!topic || topic.trim() === "") {
      throw new Error("토론 주제가 필요합니다.");
    }

    // 유효한 역할 확인 (최소 2개, 최대 5개의 역할)
    if (!Array.isArray(roles) || roles.length < 2) {
      throw new Error("토론에는 최소 2개의 역할이 필요합니다.");
    }

    if (roles.length > 5) {
      throw new Error("토론에는 최대 5개의 역할만 참여할 수 있습니다.");
    }

    // 중복 역할 제거 및 유효성 검사
    const uniqueRoles = [...new Set(roles)];

    if (uniqueRoles.length !== roles.length) {
      console.warn("중복된 역할이 제거되었습니다.");
    }

    // 유효한 역할 이름인지 검사 (빈 문자열 체크)
    if (uniqueRoles.some((role) => !role || role.trim() === "")) {
      throw new Error("역할 이름은 비어있을 수 없습니다.");
    }

    // 토론 ID 생성
    const debate_id = `debate_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 현재 시간 기록
    const now = new Date().toISOString();

    // 토론 세션 생성
    const debate: Debate = {
      id: debate_id,
      topic,
      roles: uniqueRoles,
      turns: [],
      createdAt: now,
      updatedAt: now,
    };

    // 초기 프롬프트가 있으면 첫 번째 턴으로 추가
    if (initial_prompt && initial_prompt.trim() !== "") {
      debate.turns.push({
        role: "시스템",
        content: initial_prompt,
        timestamp: now,
      });
    }

    // 토론 세션 저장
    debates.set(debate_id, debate);

    // 응답 반환
    return {
      success: true,
      message: "새로운 토론이 생성되었습니다.",
      data: {
        debate_id,
        topic,
        roles: uniqueRoles,
        created_at: now,
        initial_prompt: initial_prompt || null,
      },
    };
  } catch (error) {
    // 오류 응답 반환
    return {
      success: false,
      message: "토론 생성 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

/**
 * 토론에 새로운 턴(발언)을 추가하는 함수
 * @param debate_id 토론 세션 ID
 * @param role 발언자 역할
 * @param content 발언 내용
 * @returns 업데이트된 토론 정보
 */
export const add_turn = async ({
  debate_id,
  role,
  content,
}: {
  debate_id: string;
  role: string;
  content: string;
}) => {
  try {
    // 입력 검증
    if (!debate_id) {
      throw new Error("토론 ID가 필요합니다.");
    }

    if (!role || role.trim() === "") {
      throw new Error("발언자 역할이 필요합니다.");
    }

    if (!content || content.trim() === "") {
      throw new Error("발언 내용이 필요합니다.");
    }

    // 토론 세션 검색
    const debate = debates.get(debate_id);
    if (!debate) {
      throw new Error(`ID ${debate_id}에 해당하는 토론을 찾을 수 없습니다.`);
    }

    // 유효한 역할인지 확인 (시스템 역할은 항상 허용)
    if (role !== "시스템" && !debate.roles.includes(role)) {
      throw new Error(
        `'${role}'은(는) 이 토론에서 유효한 역할이 아닙니다. 유효한 역할: ${debate.roles.join(", ")}`
      );
    }

    // 현재 시간 설정
    const now = new Date().toISOString();

    // 새 턴 생성
    const newTurn = {
      role,
      content,
      timestamp: now,
    };

    // 턴 추가
    debate.turns.push(newTurn);

    // 토론 업데이트 시간 갱신
    debate.updatedAt = now;

    // 토론 세션 업데이트
    debates.set(debate_id, debate);

    // 응답 반환
    return {
      success: true,
      message: "토론에 새 발언이 추가되었습니다.",
      data: {
        debate_id,
        topic: debate.topic,
        roles: debate.roles,
        turn_count: debate.turns.length,
        latest_turn: {
          role,
          content:
            content.length > 100 ? `${content.substring(0, 100)}...` : content,
          timestamp: now,
        },
      },
    };
  } catch (error) {
    // 오류 응답 반환
    return {
      success: false,
      message: "토론에 발언 추가 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};

/**
 * 특정 토론 세션의 정보를 조회하는 함수
 * @param debate_id 토론 세션 ID
 * @returns 토론 세션 정보
 */
export const get_debate = async ({ debate_id }: { debate_id: string }) => {
  try {
    // 토론 ID 검증
    if (!debate_id) {
      throw new Error("토론 ID가 필요합니다.");
    }

    // 토론 세션 검색
    const debate = debates.get(debate_id);
    if (!debate) {
      throw new Error(`ID ${debate_id}에 해당하는 토론을 찾을 수 없습니다.`);
    }

    // 응답 반환
    return {
      success: true,
      message: "토론 정보를 조회했습니다.",
      data: {
        debate_id,
        topic: debate.topic,
        roles: debate.roles,
        turns: debate.turns,
        createdAt: debate.createdAt,
        updatedAt: debate.updatedAt,
        turn_count: debate.turns.length,
      },
    };
  } catch (error) {
    // 오류 응답 반환
    return {
      success: false,
      message: "토론 정보 조회 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};
