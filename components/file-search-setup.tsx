"use client";
import React, { useState } from "react";
import useToolsStore from "@/stores/useToolsStore";
import FileUpload from "@/components/file-upload";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { CircleX, Database, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function FileSearchSetup() {
  const { vectorStore, setVectorStore } = useToolsStore();
  const [newStoreId, setNewStoreId] = useState<string>("");

  const unlinkStore = async () => {
    setVectorStore({
      id: "",
      name: "",
    });
  };

  const handleAddStore = async (storeId: string) => {
    if (storeId.trim()) {
      const newStore = await fetch(
        `/api/vector_stores/retrieve_store?vector_store_id=${storeId}`
      ).then((res) => res.json());
      if (newStore.id) {
        console.log("Retrieved store:", newStore);
        setVectorStore(newStore);
      } else {
        alert("벡터 스토어를 찾을 수 없습니다");
      }
    }
  };

  // 아이디를 짧게 표시하는 헬퍼 함수
  const shortenId = (id: string) => {
    if (id.length <= 12) return id;
    return `${id.substring(0, 8)}...`;
  };

  return (
    <Card className="border border-muted bg-transparent shadow-none w-full max-w-full">
      <CardContent className="p-4 w-full max-w-full overflow-hidden">
        <p className="text-sm text-muted-foreground mb-4">
          새 벡터 스토어를 만들려면 파일을 업로드하거나 기존 스토어를
          사용하세요.
        </p>

        <div className="space-y-4 w-full max-w-full overflow-hidden">
          <div className="flex flex-col gap-2 w-full max-w-full">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="text-sm font-medium">벡터 스토어</h3>
            </div>

            {vectorStore?.id ? (
              <div className="flex items-center justify-between gap-2 bg-muted/50 rounded-md p-3 w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs shrink-0">
                          {shortenId(vectorStore.id)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="font-mono text-xs">{vectorStore.id}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {vectorStore.name && (
                    <span className="text-sm text-muted-foreground truncate">
                      {vectorStore.name}
                    </span>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={unlinkStore}>
                        <CircleX className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>벡터 스토어 연결 해제</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <Input
                    type="text"
                    placeholder="ID (vs_XXXX...)"
                    value={newStoreId}
                    onChange={(e) => setNewStoreId(e.target.value)}
                    className="h-9 text-sm w-full"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddStore(newStoreId);
                      }
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-9 shrink-0"
                  onClick={() => handleAddStore(newStoreId)}
                  disabled={!newStoreId.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  추가
                </Button>
              </div>
            )}
          </div>

          <div className="pt-4 w-full max-w-full overflow-hidden">
            <FileUpload
              vectorStoreId={vectorStore?.id ?? ""}
              vectorStoreName={vectorStore?.name ?? ""}
              onAddStore={(id) => handleAddStore(id)}
              onUnlinkStore={() => unlinkStore()}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
