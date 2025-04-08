"use client";
import React, { useEffect } from "react";
import Chat from "./chat";
import useConversationStore from "@/stores/useConversationStore";
import { Item, processMessages, addInitialBotMessage } from "@/lib/assistant";
import {
  handleCommonCommands,
  handleFoodBotCommands,
} from "@/lib/command-handlers";
import useBotStore from "@/stores/useBotStore";

export default function Assistant() {
  const { chatMessages, addConversationItem, addChatMessage, setChatMessages } =
    useConversationStore();
  const { activeBot } = useBotStore();

  // 컴포넌트가 마운트되거나 activeBot이 변경될 때 초기 메시지 추가
  useEffect(() => {
    // 봇이 변경되면 대화 초기화
    setChatMessages([]);
    // 새 봇의 초기 메시지 추가
    addInitialBotMessage();
  }, [activeBot?.id, setChatMessages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // 사용자 메시지 추가
    const userItem: Item = {
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: message.trim() }],
    };
    const userMessage: any = {
      role: "user",
      content: message.trim(),
    };

    addConversationItem(userMessage);
    addChatMessage(userItem);

    // 명령어 처리
    let commandResponse;

    // 현재 활성화된 봇에 따라 적절한 명령어 핸들러 사용
    if (activeBot?.id === "food-recommendation-bot") {
      commandResponse = await handleFoodBotCommands(message);
    } else {
      // 기본 명령어 핸들러
      commandResponse = await handleCommonCommands(message);
    }

    // 명령어가 처리되었으면 응답 추가
    if (commandResponse.isHandled) {
      const botItem: Item = {
        type: "message",
        role: "assistant",
        content: [{ type: "output_text", text: commandResponse.text }],
      };

      addChatMessage(botItem);

      // shouldContinue가 true가 아니면 AI 처리 중단
      if (!commandResponse.shouldContinue) {
        return;
      }
    }

    // 일반 AI 응답 처리
    try {
      await processMessages();
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <Chat items={chatMessages} onSendMessage={handleSendMessage} />
    </div>
  );
}
