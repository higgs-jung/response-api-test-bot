import { MessageItem } from "@/lib/assistant";
import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface MessageProps {
  message: MessageItem;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === "user";

  // 이미지 URL 처리를 위한 컴포넌트 정의
  const components = {
    img: ({ node, src, alt, ...props }: any) => {
      // 이미지 URL이 없거나 빈 문자열인 경우 처리
      if (!src || src === "") {
        return (
          <span className="text-red-500">[이미지를 표시할 수 없습니다]</span>
        );
      }
      return <img src={src} alt={alt || "이미지"} {...props} />;
    },
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-full",
        isUser && "flex-row-reverse"
      )}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "rounded-lg px-4 py-3 max-w-[80%] shadow-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
        <div
          className={cn(
            "prose prose-sm break-words",
            isUser ? "text-primary-foreground" : "text-foreground"
          )}>
          <ReactMarkdown components={components}>
            {(message.content[0]?.text as string) || ""}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Message;
