"use client";
import React from "react";
import FileSearchSetup from "./file-search-setup";
import WebSearchConfig from "./websearch-config";
import FunctionsView from "./functions-view";
import PanelConfig from "./panel-config";
import useToolsStore from "@/stores/useToolsStore";
import useBotStore from "@/stores/useBotStore";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Settings, Search, Globe, Code, Bot } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function ToolsPanel() {
  const {
    fileSearchEnabled,
    setFileSearchEnabled,
    webSearchEnabled,
    setWebSearchEnabled,
    functionsEnabled,
    setFunctionsEnabled,
  } = useToolsStore();

  const { activeBot, availableBots, switchBot } = useBotStore();

  const handleBotChange = (botId: string) => {
    switchBot(botId);
  };

  return (
    <div className="h-full w-full max-w-full overflow-hidden box-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          도구 설정
        </CardTitle>
        <CardDescription>
          AI 어시스턴트가 사용할 도구를 설정합니다
        </CardDescription>
      </CardHeader>

      <Separator className="mb-4" />

      <div className="p-4 mb-4 border border-border rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">현재 봇</h3>
        </div>

        <Select value={activeBot?.id || ""} onValueChange={handleBotChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="봇을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {availableBots.map((bot) => (
              <SelectItem key={bot.id} value={bot.id}>
                {bot.config.avatar && `${bot.config.avatar} `}
                {bot.config.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeBot && (
          <p className="text-xs text-muted-foreground mt-2">
            {activeBot.config.description}
          </p>
        )}
      </div>

      <div className="w-full max-w-full overflow-hidden">
        <Tabs
          defaultValue="functions"
          className="w-full max-w-full overflow-hidden">
          <TabsList className="grid grid-cols-3 mb-4 w-full">
            <TabsTrigger value="functions" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">함수</span>
            </TabsTrigger>
            <TabsTrigger value="websearch" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">웹 검색</span>
            </TabsTrigger>
            <TabsTrigger value="filesearch" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">파일 검색</span>
            </TabsTrigger>
          </TabsList>

          <div className="w-full max-w-full overflow-hidden">
            <TabsContent
              value="functions"
              className="w-full max-w-full overflow-hidden">
              <PanelConfig
                title="함수"
                tooltip="로컬에 정의된 함수를 사용할 수 있습니다"
                enabled={functionsEnabled}
                setEnabled={setFunctionsEnabled}>
                <FunctionsView />
              </PanelConfig>
            </TabsContent>

            <TabsContent
              value="websearch"
              className="w-full max-w-full overflow-hidden">
              <PanelConfig
                title="웹 검색"
                tooltip="인터넷을 검색할 수 있습니다"
                enabled={webSearchEnabled}
                setEnabled={setWebSearchEnabled}>
                <WebSearchConfig />
              </PanelConfig>
            </TabsContent>

            <TabsContent
              value="filesearch"
              className="w-full max-w-full overflow-hidden">
              <PanelConfig
                title="파일 검색"
                tooltip="지식 베이스(벡터 스토어)를 검색할 수 있습니다"
                enabled={fileSearchEnabled}
                setEnabled={setFileSearchEnabled}>
                <FileSearchSetup />
              </PanelConfig>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
