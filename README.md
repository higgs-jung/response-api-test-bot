# Response API Test Bot

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)

오픈AI의 [Responses API](https://platform.openai.com/docs/api-reference/responses)를 활용한 NextJS 기반 챗봇 애플리케이션입니다. 다양한 외부 서비스와 도구를 연동하여 기능을 확장할 수 있는 구조를 갖추고 있습니다.

## 주요 기능

- 멀티턴 대화 처리
- OpenAI 모델 API 활용 (GPT-4, GPT-3.5 등)
- 웹 검색 도구 연동
- 벡터 스토어를 활용한 파일 검색 기능
- 함수 호출 (Function Calling) 기능
- 스트리밍 응답과 도구 호출 처리
- 다양한 봇 프로필 지원
- 외부 API 연동 (구글 맵스, 시트 등)
- 이미지 생성 기능

## 프로젝트 구조

```
/
├── app/                # Next.js 앱 디렉토리
│   ├── api/            # API 엔드포인트
│   │   ├── bots/       # 봇 관련 API
│   │   ├── functions/  # 함수 관련 API
│   │   ├── handlers/   # 이벤트 핸들러
│   │   ├── proxy/      # 프록시 API
│   │   ├── turn_response/ # 응답 처리
│   │   └── vector_stores/ # 벡터 스토어 관리
│   ├── lib/            # 앱 레벨 유틸리티
│   ├── globals.css     # 전역 스타일
│   ├── layout.tsx      # 앱 레이아웃
│   └── page.tsx        # 메인 페이지
├── bots/               # 봇 정의 및 설정
│   ├── debate-bot/     # 토론 봇
│   ├── everart-image-bot/ # 이미지 생성 봇
│   ├── food-bot/       # 음식 추천 봇
│   ├── japan-to-global-bot/ # 번역 봇
│   └── welcome-message-bot/ # 환영 메시지 봇
├── components/         # UI 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   ├── BotSelector.tsx # 봇 선택 컴포넌트
│   ├── chat.tsx        # 채팅 인터페이스
│   ├── file-search-setup.tsx # 파일 검색 설정
│   ├── functions-view.tsx # 함수 호출 뷰
│   ├── message.tsx     # 메시지 컴포넌트
│   └── ... 기타 컴포넌트
├── config/             # 설정 파일
│   ├── functions/      # 함수 정의
│   │   ├── index.ts    # 함수 통합 인덱스
│   │   ├── maps-functions.ts # 지도 관련 함수
│   │   ├── debate-functions.ts # 토론 관련 함수
│   │   ├── event-functions.ts # 이벤트 관련 함수
│   │   └── ... 기타 함수 정의
│   ├── constants.ts    # 상수 정의
│   ├── functions.ts    # 함수 통합
│   └── tools-list.ts   # 도구 목록
├── data/               # 정적 데이터
├── lib/                # 라이브러리 함수
│   ├── tools/          # 도구 관련 유틸리티
│   ├── utils/          # 유틸리티 함수
│   ├── assistant.ts    # 어시스턴트 로직
│   └── bot-loader.ts   # 봇 로더
├── public/             # 정적 파일
├── scripts/            # 스크립트
├── stores/             # 상태 저장소
├── .gitignore          # Git 제외 파일
├── next.config.js      # Next.js 설정
├── package.json        # 패키지 정의
└── tailwind.config.ts  # Tailwind 설정
```

## 주요 프로세스

### 1. 봇 시스템

이 애플리케이션은 모듈화된 봇 시스템을 사용합니다. 각 봇은 다음과 같은 구조로 정의됩니다:

```
/bots
  /[bot-id]
    config.json  - 봇 기본 설정
    prompt.md    - 봇 기본 프롬프트
    tools.json   - 봇이 사용 가능한 도구 설정
    functions.json - 봇의 함수 정의 (선택 사항)
    /handlers    - 특수 처리 핸들러 (선택 사항)
```

### 2. 봇 정의 스키마

```typescript
interface BotDefinition {
  id: string;
  config: {
    name: string;
    description: string;
    initial_message?: string;
    model?: string;
    profiles?: Array<{
      id: string;
      name: string;
      description: string;
      active?: boolean;
    }>;
  };
  prompt: string;
  tools: {
    web_search?: boolean;
    file_search?: boolean;
    function?: boolean;
    code_interpreter?: boolean;
    image_vision?: boolean;
    plugins?: string[];
    vector_store?: {
      id: string;
      name: string;
    };
  };
  functions?: any[];
}
```

### 3. 함수 호출 프로세스

1. `config/functions/` 디렉토리에 함수 정의
2. `config/functions/index.ts`에 함수 등록
3. 봇 설정에서 함수 사용 설정 (functions.json)
4. 클라이언트 측에서 함수 호출 처리 (`components/functions-view.tsx`)
5. 서버 측 함수 실행 (`app/api/functions/[function_name]/route.ts`)

### 4. API 엔드포인트

- `GET /api/bots` - 모든 봇 목록 가져오기
- `GET /api/bots/[botId]` - 특정 봇 정보 가져오기
- `POST /api/turn_response` - 대화 응답 생성
- `POST /api/functions/[function_name]` - 특정 함수 실행
- `POST /api/vector_stores/add_file` - 파일 추가
- `GET /api/vector_stores/retrieve_store` - 벡터 스토어 검색

## 설치 방법

1. **OpenAI API 키 설정:**

   - OpenAI 계정이 필요합니다. [가입하기](https://platform.openai.com/signup)
   - API 키를 발급받아 `.env.local` 파일에 설정:

   ```bash
   OPENAI_API_KEY=sk-your_api_key_here
   ```

2. **저장소 클론:**

   ```bash
   git clone https://github.com/your-username/response-api-test-bot.git
   cd response-api-test-bot
   ```

3. **의존성 설치:**

   ```bash
   npm install
   ```

4. **개발 서버 실행:**

   ```bash
   npm run dev
   ```

   애플리케이션은 [`http://localhost:3000`](http://localhost:3000)에서 접속 가능합니다.

## 외부 서비스 연동

이 프로젝트는 다음과 같은 외부 서비스와 연동할 수 있습니다:

- **구글 맵스 API**: 위치 정보 및 장소 검색
- **구글 스프레드시트**: 데이터 저장 및 관리
- **EverArt API**: 이미지 생성
- **벡터 데이터베이스**: 문서 검색 및 관리

각 서비스 연동을 위해서는 해당 API 키를 `.env.local` 파일에 설정해야 합니다.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 LICENSE 파일을 참조하세요.
