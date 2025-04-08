"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ToolCall from "./tool-call";
import Message from "./message";
import Annotations from "./annotations";
import { Item } from "@/lib/assistant";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { SendIcon, X } from "lucide-react";
import { Textarea } from "./ui/textarea";
import useBotStore from "@/stores/useBotStore";
import { CommandDefinition, getBotCommands } from "@/lib/utils/command-parser";

interface ChatProps {
  items: Item[];
  onSendMessage: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({ items, onSendMessage }) => {
  const itemsEndRef = useRef<HTMLDivElement>(null);
  const [inputMessageText, setinputMessageText] = useState<string>("");
  // This state is used to provide better user experience for non-English IMEs such as Japanese
  const [isComposing, setIsComposing] = useState(false);
  // 명령어 제안 상태
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState<
    Array<{ trigger: string; description: string }>
  >([]);
  const { activeBot } = useBotStore();

  // 현재 활성화된 봇의 숏컷 가져오기 (config에 정의된 것만 사용)
  const currentBotShortcuts = activeBot?.config?.shortcuts || [];

  const scrollToBottom = () => {
    itemsEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  // 숏컷 선택 핸들러
  const handleShortcutSelect = (text: string) => {
    onSendMessage(text);
  };

  // 명령어 버블 표시 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setinputMessageText(value);

    if (value === "/") {
      // "/" 입력 시 명령어 제안 표시
      const commands = activeBot?.id
        ? getBotCommands(activeBot.id)
        : getBotCommands("default");

      // 명령어 목록 생성
      const suggestions = Object.values(commands).flatMap(
        (cmd: CommandDefinition) =>
          cmd.triggers.map((trigger: string) => ({
            trigger,
            description: cmd.description,
          }))
      );

      setCommandSuggestions(suggestions);
      setShowCommandSuggestions(true);
    } else if (!value.startsWith("/")) {
      // "/" 이외의 문자로 시작할 경우 제안 닫기
      setShowCommandSuggestions(false);
    }
  };

  // 명령어 선택 핸들러
  const handleCommandSelect = (command: string) => {
    setinputMessageText(command + " ");
    setShowCommandSuggestions(false);
    // 텍스트 영역에 포커스 유지
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.focus();
    }
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !isComposing) {
        event.preventDefault();
        if (inputMessageText.trim()) {
          onSendMessage(inputMessageText);
          setinputMessageText("");
          setShowCommandSuggestions(false);
        }
      } else if (event.key === "Escape") {
        setShowCommandSuggestions(false);
      }
    },
    [onSendMessage, inputMessageText, isComposing]
  );

  useEffect(() => {
    scrollToBottom();
  }, [items]);

  return (
    <Card className="flex flex-col h-full shadow-sm">
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full overflow-y-auto px-6 py-4 rounded-none">
          <div className="space-y-5 pt-2 flex flex-col justify-end">
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>대화를 시작하세요</p>
              </div>
            ) : (
              items.map((item, index) => (
                <React.Fragment key={index}>
                  {item.type === "tool_call" ? (
                    <ToolCall toolCall={item} />
                  ) : item.type === "message" ? (
                    <div className="flex flex-col gap-1">
                      <Message message={item} />
                      {item.content &&
                        item.content[0]?.annotations &&
                        item.content[0].annotations.length > 0 && (
                          <Annotations
                            annotations={item.content[0].annotations}
                          />
                        )}
                    </div>
                  ) : null}
                </React.Fragment>
              ))
            )}
            <div ref={itemsEndRef} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t pt-4 relative flex flex-col gap-3">
        {/* 숏컷 버튼 영역 */}
        {currentBotShortcuts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 w-full">
            {currentBotShortcuts.map((shortcut, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="px-3 py-1 rounded-full text-xs h-auto"
                title={shortcut.description}
                onClick={() => handleShortcutSelect(shortcut.text)}>
                {shortcut.text}
              </Button>
            ))}
          </div>
        )}

        {showCommandSuggestions && commandSuggestions.length > 0 && (
          <div className="absolute bottom-full left-4 mb-2 bg-popover shadow-md rounded-lg overflow-hidden border w-80 max-h-80 overflow-y-auto z-10">
            <div className="flex justify-between items-center p-2 border-b">
              <span className="text-sm font-medium">사용 가능한 명령어</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCommandSuggestions(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-2">
              {commandSuggestions.map((cmd, idx) => (
                <div
                  key={idx}
                  className="p-2 hover:bg-accent rounded cursor-pointer"
                  onClick={() => handleCommandSelect(cmd.trigger)}>
                  <div className="font-medium text-sm">{cmd.trigger}</div>
                  <div className="text-xs text-muted-foreground">
                    {cmd.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex w-full items-end gap-2">
          <Textarea
            className="min-h-10 resize-none flex-1"
            placeholder="메시지를 입력하세요... ('/'를 입력하면 명령어 목록이 표시됩니다)"
            value={inputMessageText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            rows={1}
          />
          <Button
            size="icon"
            disabled={!inputMessageText.trim()}
            onClick={() => {
              if (inputMessageText.trim()) {
                onSendMessage(inputMessageText);
                setinputMessageText("");
                setShowCommandSuggestions(false);
              }
            }}
            className="shrink-0">
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Chat;
