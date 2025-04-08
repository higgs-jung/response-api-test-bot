"use client";

import { toolsList } from "@/config/tools-list";
import { Code } from "lucide-react";
import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import useBotStore from "@/stores/useBotStore";

type ToolParameter = {
  type: string;
  description?: string;
  enum?: string[];
  properties?: { [key: string]: any };
  additionalProperties?: boolean;
};

const getToolArgs = (parameters: any) => {
  // 새로운 OpenAI 함수 API 형식 처리 (type, properties, required, additionalProperties 등)
  if (parameters.type === "object" && parameters.properties) {
    return (
      <div className="ml-4 space-y-2 w-full overflow-hidden">
        {Object.entries(parameters.properties).map(
          ([key, value]: [string, any]) => (
            <div
              key={key}
              className="flex items-center text-xs space-x-2 overflow-hidden">
              <span className="font-medium shrink-0">{key}:</span>
              <Badge variant="outline" className="text-xs h-5 shrink-0">
                {typeof value === "object" && value !== null
                  ? typeof value.type === "string"
                    ? value.type
                    : "object"
                  : typeof value}
              </Badge>
              {value?.description && (
                <span className="text-muted-foreground text-xs overflow-hidden truncate">
                  {typeof value.description === "string"
                    ? value.description
                    : JSON.stringify(value.description)}
                </span>
              )}
            </div>
          )
        )}
        {parameters.required &&
          Array.isArray(parameters.required) &&
          parameters.required.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              필수 매개변수: {parameters.required.join(", ")}
            </div>
          )}
      </div>
    );
  }

  // 기존 형식 처리
  return (
    <div className="ml-4 space-y-2 w-full overflow-hidden">
      {Object.entries(parameters).map(([key, value]: [string, any]) => (
        <div
          key={key}
          className="flex items-center text-xs space-x-2 overflow-hidden">
          <span className="font-medium shrink-0">{key}:</span>
          <Badge variant="outline" className="text-xs h-5 shrink-0">
            {typeof value === "object" && value !== null
              ? typeof value.type === "string"
                ? value.type
                : "object"
              : typeof value}
          </Badge>
          {value?.description && (
            <span className="text-muted-foreground text-xs overflow-hidden truncate">
              {typeof value.description === "string"
                ? value.description
                : JSON.stringify(value.description)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default function FunctionsView() {
  const { activeBot } = useBotStore();

  // 현재 활성화된 봇의 함수 설정 가져오기
  const functionSettings = activeBot?.tools?.functionSettings || {};

  // 필터링된 도구 목록 생성 - 안전하게 필터링
  let filteredTools = [];

  // 봇이 functions.json을 가지고 있는 경우 그것만 사용
  if (activeBot?.functions && Array.isArray(activeBot.functions)) {
    filteredTools = activeBot.functions;
  }
  // 그렇지 않은 경우 toolsList에서 활성화된 함수만 필터링
  else if (activeBot?.tools?.functionSettings) {
    // 명시적으로 활성화된 함수만 필터링
    const enabledFunctionNames = Object.entries(
      activeBot.tools.functionSettings
    )
      .filter(([_, config]) => config.enabled === true)
      .map(([name, _]) => name);

    filteredTools = toolsList.filter((tool) =>
      enabledFunctionNames.includes(tool.name)
    );
  }
  // 봇이 없거나 설정이 없는 경우 전체 도구 목록 사용
  else {
    filteredTools = toolsList;
  }

  return (
    <div className="space-y-4 w-full overflow-hidden">
      {activeBot && (
        <div className="text-sm bg-primary/10 text-primary p-2 rounded-md mb-4">
          <span className="font-semibold">{activeBot.config.name}</span> 봇에서
          사용 가능한 함수만 표시됩니다
        </div>
      )}

      {filteredTools.length === 0 ? (
        <div className="text-center text-muted-foreground p-4">
          이 봇에 설정된 함수가 없습니다
        </div>
      ) : (
        filteredTools.map((tool) => (
          <Card key={tool.name} className="overflow-hidden w-full">
            <CardContent className="p-4 w-full overflow-hidden">
              <div className="flex items-start gap-3 w-full overflow-hidden">
                <div className="bg-primary/10 text-primary rounded-md p-2 mt-0.5 shrink-0">
                  <Code size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium text-sm mb-2 font-mono">
                    {tool.name}
                  </div>
                  {tool.description && (
                    <p className="text-xs text-muted-foreground mb-3 break-words">
                      {typeof tool.description === "string"
                        ? tool.description
                        : JSON.stringify(tool.description)}
                    </p>
                  )}
                  {tool.parameters && typeof tool.parameters === "object" ? (
                    getToolArgs(tool.parameters)
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      매개변수 없음
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
