"use client";
import Assistant from "@/components/assistant";
import ToolsPanel from "@/components/tools-panel";
import BotSelector from "@/components/BotSelector";
import { PanelRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";

export default function Main() {
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden border-r">
        <div className="p-4 border-b">
          <BotSelector />
        </div>
        <div className="flex-1 overflow-hidden">
          <Assistant />
        </div>
      </div>

      {/* Desktop tools panel */}
      <div className="hidden md:block w-80 border-l bg-background">
        <Card className="h-full rounded-none border-0 shadow-none overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 w-full max-w-[20rem] overflow-hidden">
              <ToolsPanel />
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Mobile tools panel - Using Sheet component */}
      <Sheet open={isToolsPanelOpen} onOpenChange={setIsToolsPanelOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed bottom-4 right-4 z-10 rounded-full shadow-md">
            <PanelRight className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 overflow-hidden">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle>도구 설정</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-57px)]">
            <div className="p-4 w-full max-w-full overflow-hidden">
              <BotSelector />
              <Separator className="my-4" />
              <ToolsPanel />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
