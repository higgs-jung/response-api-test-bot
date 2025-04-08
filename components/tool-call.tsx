import React from "react";
import { ToolCallItem } from "@/lib/assistant";
import { BookOpenText, Clock, Globe, Zap } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface ToolCallProps {
  toolCall: ToolCallItem;
}

function ApiCallCell({ toolCall }: ToolCallProps) {
  return (
    <Card className="w-[85%] ml-10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Zap className="h-4 w-4" />
          <span className="font-medium text-sm">
                {toolCall.status === "completed"
                  ? `Called ${toolCall.name}`
                  : `Calling ${toolCall.name}...`}
          </span>
          <Badge
            variant={toolCall.status === "completed" ? "default" : "secondary"}
            className="ml-auto">
            {toolCall.status}
          </Badge>
              </div>

        <div className="bg-muted/50 rounded-md overflow-hidden">
          <div className="border-b p-2 overflow-auto max-h-60">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Arguments:
            </p>
            <SyntaxHighlighter
              customStyle={{
                backgroundColor: "transparent",
                padding: "8px",
                marginTop: 0,
                marginBottom: 0,
                fontSize: "12px",
              }}
              language="json"
              style={coy}>
              {JSON.stringify(toolCall.parsedArguments, null, 2)}
            </SyntaxHighlighter>
          </div>

          <div className="p-2 overflow-auto max-h-60">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Result:
            </p>
            {toolCall.output ? (
              <SyntaxHighlighter
                customStyle={{
                  backgroundColor: "transparent",
                  padding: "8px",
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: "12px",
                }}
                language="json"
                style={coy}>
                  {JSON.stringify(JSON.parse(toolCall.output), null, 2)}
                </SyntaxHighlighter>
              ) : (
              <div className="text-muted-foreground flex items-center gap-2 p-2">
                <Clock className="h-4 w-4 animate-spin" /> 결과를 기다리는 중...
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FileSearchCell({ toolCall }: ToolCallProps) {
  return (
    <div className="flex gap-2 items-center ml-10">
      <Badge
        variant="outline"
        className={cn(
          "flex gap-1 items-center",
          toolCall.status === "completed" ? "bg-primary/10" : "bg-secondary/50"
        )}>
        <BookOpenText className="h-3 w-3" />
        <span className="text-xs">
        {toolCall.status === "completed"
            ? "파일 검색 완료"
            : "파일 검색 중..."}
        </span>
      </Badge>
    </div>
  );
}

function WebSearchCell({ toolCall }: ToolCallProps) {
  return (
    <div className="flex gap-2 items-center ml-10">
      <Badge
        variant="outline"
        className={cn(
          "flex gap-1 items-center",
          toolCall.status === "completed" ? "bg-primary/10" : "bg-secondary/50"
        )}>
        <Globe className="h-3 w-3" />
        <span className="text-xs">
          {toolCall.status === "completed" ? "웹 검색 완료" : "웹 검색 중..."}
        </span>
      </Badge>
    </div>
  );
}

export default function ToolCall({ toolCall }: ToolCallProps) {
  return (
    <div className="py-1">
      {(() => {
        switch (toolCall.tool_type) {
          case "function_call":
            return <ApiCallCell toolCall={toolCall} />;
          case "file_search_call":
            return <FileSearchCell toolCall={toolCall} />;
          case "web_search_call":
            return <WebSearchCell toolCall={toolCall} />;
          default:
            return null;
        }
      })()}
    </div>
  );
}
