"use client";

import Link from "next/link";
import {
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Message } from "ai/react";

import { Suspense, useEffect, useState } from "react";
import SidebarSkeleton from "./sidebar-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ModeToggle } from "./theme-toggle";
import { ScrollArea, Scrollbar } from "@radix-ui/react-scroll-area";
import PullModel from "./pull-model";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { TrashIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import useChatStore from "@/app/hooks/useChatStore";

interface SidebarProps {
  isCollapsed: boolean;
  messages: Message[];
  onClick?: () => void;
  isMobile: boolean;
  chatId: string;
  closeSidebar?: () => void;
  onToggle?: () => void;
}

export function Sidebar({
  messages,
  isCollapsed,
  isMobile,
  chatId,
  closeSidebar,
  onToggle,
}: SidebarProps) {
  const router = useRouter();

  const chats = useChatStore((state) => state.chats);
  const handleDelete = useChatStore((state) => state.handleDelete);

  return (
    <div
      data-collapsed={isCollapsed}
      className="relative justify-between group bg-card flex flex-col h-full gap-2 p-2 data-[collapsed=true]:p-1 border-r border-border"
    >
      <div
        className={cn(
          "flex flex-col p-1 max-h-fit overflow-y-auto",
          isCollapsed ? "items-center" : "items-stretch",
          isMobile && "pt-10"
        )}
      >
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn("mb-2", isCollapsed ? "" : "self-end")}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
        <Button
          onClick={() => {
            router.push("/");
            if (closeSidebar) {
              closeSidebar();
            }
          }}
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          className={cn(
            "flex text-sm font-normal items-center",
            isCollapsed
              ? "justify-center h-10 w-10"
              : "justify-start w-full h-10 gap-4"
          )}
        >
          <SquarePen className="shrink-0 h-4 w-4" />
          {!isCollapsed && <div className="flex items-center">New chat</div>}
        </Button>

        {!isCollapsed && (
          <div className="flex flex-col pt-10 gap-2">
            <p className="pl-4 text-xs text-muted-foreground">Your chats</p>
            <Suspense fallback>
              {chats &&
                Object.entries(chats)
                  .sort(
                    ([, a], [, b]) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map(([id, chat]) => (
                    <Link
                      key={id}
                      href={`/c/${id}`}
                      className={cn(
                        {
                          [buttonVariants({ variant: "secondaryLink" })]:
                            id === chatId,
                          [buttonVariants({ variant: "ghost" })]: id !== chatId,
                        },
                        "flex justify-between w-full h-12 text-base font-normal items-center "
                      )}
                    >
                      <div className="flex gap-3 items-center truncate">
                        <div className="flex flex-col">
                          <span className="text-xs font-normal ">
                            {chat.messages.length > 0
                              ? chat.messages[0].content
                              : ""}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex justify-center items-center pr-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal size={16} className="shrink-0" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className=""
                          align="start"
                          side="bottom"
                        >
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full flex gap-2 hover:text-red-500 text-red-500 justify-start items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="shrink-0 w-4 h-4" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader className="space-y-4">
                                <DialogTitle>Delete chat?</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this chat?
                                  This action cannot be undone.
                                </DialogDescription>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline">Cancel</Button>
                                  <Button
                                    variant="destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(id);
                                      router.push("/");
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Link>
                  ))}
            </Suspense>
          </div>
        )}
      </div>

      <div className={cn("mb-4 p-1", isCollapsed ? "flex justify-center" : "")}>
        <ModeToggle
          isCollapsed={isCollapsed}
          className={isCollapsed ? "h-8 w-8" : "w-full h-8"}
        />
      </div>
    </div>
  );
}
