"use client";
import React, { useEffect, useState } from "react";
import useBotStore from "@/stores/useBotStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function BotSelector() {
  const {
    availableBots,
    activeBotId,
    switchBot,
    initializeBots,
    loadingBots,
    error,
  } = useBotStore();

  const [initAttempts, setInitAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // 초기화 시도
    const init = async () => {
      try {
        console.log("봇 초기화 시작...");
        await initializeBots();
        console.log("봇 초기화 완료!");
      } catch (e) {
        console.error("봇 초기화 실패:", e);
      } finally {
        setIsRetrying(false);
      }
    };

    init();
  }, [initializeBots, initAttempts]);

  // 디버깅용 로그 추가
  useEffect(() => {
    console.log("현재 사용 가능한 봇:", availableBots);
    console.log("현재 활성화된 봇 ID:", activeBotId);
    console.log("로딩 상태:", loadingBots);
    console.log("에러 상태:", error);
  }, [availableBots, activeBotId, loadingBots, error]);

  const handleRetry = async () => {
    console.log("재시도 버튼 클릭됨");
    setIsRetrying(true);

    // 서버와 클라이언트의 캐시를 완전히 우회하기 위해 타임아웃 추가
    setTimeout(() => {
      setInitAttempts((prev) => prev + 1);
    }, 300);
  };

  if (loadingBots || isRetrying) {
    return (
      <Card className="mb-4">
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ReloadIcon className="h-4 w-4 animate-spin" />
            <span>봇을 로드하는 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>오류 발생</AlertTitle>
        <AlertDescription>
          <p className="text-sm mt-2">{error}</p>
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}>
              {isRetrying ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  재시도 중...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  다시 시도
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={isRetrying}>
              페이지 새로고침
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (availableBots.length === 0) {
    return (
      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>사용 가능한 봇이 없습니다</AlertTitle>
        <AlertDescription>
          <p className="text-sm mt-2">
            봇 데이터를 불러오는 데 문제가 발생했습니다. 다시 시도해 주세요.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            className="mt-4"
            disabled={isRetrying}>
            {isRetrying ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                다시 확인 중...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 확인
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Response Bot Playground</CardTitle>
        <CardDescription>대화할 봇을 선택하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {availableBots.map((bot) => (
            <Button
              key={bot.id}
              variant={activeBotId === bot.id ? "default" : "outline"}
              size="sm"
              onClick={() => switchBot(bot.id)}
              className="relative flex items-center">
              {bot.config.name}
              {activeBotId === bot.id && (
                <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                  활성
                </Badge>
              )}
            </Button>
          ))}
        </div>
        {activeBotId && (
          <p className="mt-4 text-sm text-muted-foreground">
            {
              availableBots.find((b) => b.id === activeBotId)?.config
                .description
            }
          </p>
        )}
      </CardContent>
    </Card>
  );
}
