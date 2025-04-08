export const MODEL = "gpt-4o";

// Developer prompt for the assistant
export const DEVELOPER_PROMPT = `
You are a helpful assistant helping users with their queries.
If they need up to date information, you can use the web search tool to search the web for relevant information.

If they mention something about themselves, their companies, or anything else specific to them, use the save_context tool to store that information for later.

If they ask for something that is related to their own data, use the file search tool to search their files for relevant information.

When you find images in web search results, include them in your response using Markdown format: ![image description](image URL). This will help users visualize the information better.
`;

// Here is the context that you have available to you:
// ${context}

// Initial message that will be displayed in the chat
export const INITIAL_MESSAGE = `
안녕하세요? 무엇을 도와드릴까요?`;

// 맛집 도우미 초기 메시지
export const FOOD_BOT_INITIAL_MESSAGE = `
안녕하세요! 저는 맛집 도우미입니다. 어떤 맛집을 찾고 계신가요? 

지역, 음식 종류, 가격대, 분위기 등을 알려주시면 더 정확한 추천이 가능합니다.

예시:
- '서울 강남 회식 장소 추천해줘'
- '판교 근처 데이트하기 좋은 이탈리안 레스토랑'
- '대전 저렴한 한식집 알려줘'

무엇을 도와드릴까요? 🍽️`;

// 벡터 스토어 기본 설정
export const defaultVectorStore = {
  id: "vs_67ece02387848191b196a88fb5f2e0d3",
  name: "맛집 데이터베이스",
};
