"use client";

import React from "react";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { TooltipProvider } from "./ui/tooltip";

export default function PanelConfig({
  title,
  tooltip,
  enabled,
  setEnabled,
  disabled,
  children,
}: {
  title: string;
  tooltip: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const handleToggle = () => {
    setEnabled(!enabled);
  };

  return (
    <div className="space-y-4 mb-6 w-full max-w-full overflow-hidden box-border">
      <div className="flex justify-between items-center w-full">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h1 className="text-black font-medium truncate">{title}</h1>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Switch
          id={title}
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={disabled}
          className="shrink-0"
        />
      </div>
      <div className="mt-2 w-full max-w-full overflow-hidden">
        {enabled && children}
      </div>
    </div>
  );
}
