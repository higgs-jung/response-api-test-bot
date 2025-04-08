import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BotDefinition } from "@/app/api/bots/core/bot-schema";
import { loadAllBots, loadBot, saveBot } from "@/lib/bot-loader";

interface BotStoreState {
  availableBots: BotDefinition[];
  activeBotId: string | null;
  activeBot: BotDefinition | null;
  loadingBots: boolean;
  error: string | null;

  // 액션
  initializeBots: () => Promise<void>;
  switchBot: (botId: string) => Promise<void>;
  refreshBots: () => Promise<void>;
  getBot: (botId: string) => Promise<BotDefinition>;
  saveBot: (botId: string, botData: Omit<BotDefinition, "id">) => Promise<void>;
}

const useBotStore = create<BotStoreState>()(
  persist(
    (set, get) => ({
      availableBots: [],
      activeBotId: null,
      activeBot: null,
      loadingBots: false,
      error: null,

      initializeBots: async () => {
        set({ loadingBots: true, error: null });
        try {
          console.log("API로부터 봇 로드 중...");
          const bots = await loadAllBots();
          console.log("API 응답 수신됨:", bots);

          if (!Array.isArray(bots)) {
            throw new Error("API가 유효한 봇 목록을 반환하지 않았습니다");
          }

          if (bots.length === 0) {
            console.log("사용 가능한 봇이 없습니다");
          } else {
            console.log(`${bots.length}개의 봇을 로드했습니다`);
          }

          set({
            availableBots: bots,
            loadingBots: false,
          });

          // 이전에 선택한 봇이 없거나 선택한 봇이 더 이상 존재하지 않는 경우,
          // 첫 번째 봇을 기본값으로 사용
          const { activeBotId } = get();
          if (!activeBotId || !bots.find((b) => b.id === activeBotId)) {
            if (bots.length > 0) {
              console.log(`첫 번째 봇으로 전환: ${bots[0].id}`);
              get().switchBot(bots[0].id);
            }
          } else if (activeBotId) {
            // 선택한 봇이 존재하면 최신 상태로 업데이트
            console.log(`기존 봇으로 전환: ${activeBotId}`);
            get().switchBot(activeBotId);
          }
        } catch (error) {
          console.error("봇 로드 실패:", error);
          set({
            error: `봇 로드 실패: ${error instanceof Error ? error.message : String(error)}`,
            loadingBots: false,
          });
        }
      },

      switchBot: async (botId) => {
        set({ loadingBots: true, error: null });
        try {
          console.log(`봇 전환 중: ${botId}`);
          const bot = await loadBot(botId);
          set({ activeBotId: botId, activeBot: bot, loadingBots: false });
          console.log(`봇 전환 완료: ${botId}`);
        } catch (error) {
          console.error("봇 전환 실패:", error);
          set({
            error: `봇 전환 실패: ${error instanceof Error ? error.message : String(error)}`,
            loadingBots: false,
          });
        }
      },

      refreshBots: async () => {
        try {
          const { activeBotId } = get();
          console.log("봇 새로고침 중...");
          await get().initializeBots();
          if (activeBotId) {
            await get().switchBot(activeBotId);
          }
        } catch (error) {
          console.error("봇 새로고침 실패:", error);
          set({
            error: `봇 새로고침 실패: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      },

      getBot: async (botId) => {
        try {
          return await loadBot(botId);
        } catch (error) {
          console.error("봇 조회 실패:", error);
          throw error;
        }
      },

      saveBot: async (botId, botData) => {
        try {
          await saveBot(botId, botData);
          // 저장 후 봇 목록 새로고침
          await get().refreshBots();
        } catch (error) {
          console.error("봇 저장 실패:", error);
          throw error;
        }
      },
    }),
    {
      name: "bot-store",
      partialize: (state) => ({ activeBotId: state.activeBotId }),
    }
  )
);

export default useBotStore;
