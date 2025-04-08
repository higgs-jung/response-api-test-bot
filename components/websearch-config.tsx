"use client";

import React from "react";
import useToolsStore from "@/stores/useToolsStore";
import { Input } from "./ui/input";
import CountrySelector from "./country-selector";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { MapPin, X } from "lucide-react";
import { Separator } from "./ui/separator";

export default function WebSearchConfig() {
  const { webSearchConfig, setWebSearchConfig } = useToolsStore();

  const handleClear = () => {
    setWebSearchConfig({
      user_location: {
        type: "approximate",
        country: "",
        region: "",
        city: "",
      },
    });
  };

  const handleLocationChange = (
    field: "country" | "region" | "city",
    value: string
  ) => {
    setWebSearchConfig({
      ...webSearchConfig,
      user_location: {
        type: "approximate",
        ...webSearchConfig.user_location,
        [field]: value,
      },
    });
  };

  const hasLocation =
    !!webSearchConfig.user_location?.country ||
    !!webSearchConfig.user_location?.region ||
    !!webSearchConfig.user_location?.city;

  return (
    <Card className="border border-muted bg-transparent shadow-none w-full">
      <CardContent className="p-4 w-full overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <h3 className="text-sm font-medium">사용자 위치 설정</h3>
          </div>
          {hasLocation && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 shrink-0"
              onClick={handleClear}>
              <X className="h-4 w-4 mr-1" />
              <span className="text-xs">초기화</span>
            </Button>
          )}
        </div>

        <div className="space-y-4 w-full overflow-hidden">
          <div className="grid grid-cols-4 items-center gap-3 w-full">
            <Label htmlFor="country" className="text-right text-xs">
              국가
            </Label>
            <div className="col-span-3 w-full">
              <CountrySelector
                value={webSearchConfig.user_location?.country ?? ""}
                onChange={(value) => handleLocationChange("country", value)}
              />
            </div>
          </div>

          <Separator className="my-3" />

          <div className="grid grid-cols-4 items-center gap-3 w-full">
            <Label htmlFor="region" className="text-right text-xs">
              지역
            </Label>
            <Input
              id="region"
              type="text"
              placeholder="지역명"
              className="col-span-3 h-9 text-sm w-full"
              value={webSearchConfig.user_location?.region ?? ""}
              onChange={(e) => handleLocationChange("region", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-3 w-full">
            <Label htmlFor="city" className="text-right text-xs">
              도시
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="도시명"
              className="col-span-3 h-9 text-sm w-full"
              value={webSearchConfig.user_location?.city ?? ""}
              onChange={(e) => handleLocationChange("city", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
