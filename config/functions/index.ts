// 모든 함수를 함수 카테고리별 파일에서 가져와 내보냅니다
import * as weatherFunctions from "./weather-functions";
import * as mapsFunctions from "./maps-functions";
import * as utilsFunctions from "./utils-functions";
import * as sheetsFunctions from "./sheets-functions";
import * as eventFunctions from "./event-functions";
import * as vectorStoreFunctions from "./vector-store-functions";
import * as debateFunctions from "./debate-functions";
import { botFunctions } from "./bot-functions"; // 봇 함수 가져오기 방식 수정

// 봇 함수 추가 메시지 출력
console.log("함수 초기화 중...");
console.log(
  "봇 함수 로드됨:",
  Object.keys(botFunctions).length > 0 ? "O" : "X"
);
console.log("봇 함수 목록:", Object.keys(botFunctions).join(", "));

// 모든 함수를 하나로 결합하여 내보냅니다
export const functionsMap = {
  ...weatherFunctions,
  ...mapsFunctions,
  ...utilsFunctions,
  ...sheetsFunctions,
  ...eventFunctions,
  ...vectorStoreFunctions,
  ...debateFunctions,
  ...botFunctions, // 봇 함수 추가
};

// 개별 함수도 모두 내보냅니다
export * from "./weather-functions";
export * from "./maps-functions";
export * from "./utils-functions";
export * from "./sheets-functions";
export * from "./event-functions";
export * from "./vector-store-functions";
export * from "./debate-functions";
