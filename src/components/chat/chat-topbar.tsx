"use client";

import React, { useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "../ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { PanelLeftOpen } from "lucide-react";
import { Sidebar } from "../sidebar";
import { Message } from "ai/react";
import { getSelectedModel } from "@/lib/model-helper";
import useChatStore from "@/app/hooks/useChatStore";

interface ChatTopbarProps {
  isLoading: boolean;
  chatId?: string;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

export default function ChatTopbar({
  isLoading,
  chatId,
  messages,
  setMessages,
}: ChatTopbarProps) {
  const [models, setModels] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const data = await res.json().catch(() => null);
        if (!data?.models?.length) return;

        setModels(data.models.map(({ name }: { name: string }) => name));
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    })();
  }, []);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setOpen(false);
  };

  const handleCloseSidebar = () => {
    setSheetOpen(false);
  };

  return (
    <div className="w-full flex px-4 py-6 items-center justify-between lg:justify-start">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <Sidebar
            chatId={chatId || ""}
            isCollapsed={false}
            isMobile={true}
            messages={messages}
            closeSidebar={handleCloseSidebar}
          />
        </SheetContent>
      </Sheet>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={isLoading}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedModel || "Select model"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-1">
          {models.length > 0 ? (
            models.map((model) => (
              <Button
                key={model}
                variant="ghost"
                className="w-full"
                onClick={() => {
                  handleModelChange(model);
                }}
              >
                {model}
              </Button>
            ))
          ) : (
            <Button variant="ghost" disabled className=" w-full">
              No models available
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
