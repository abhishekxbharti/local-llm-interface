"use client";

import ChatTopbar from "./chat-topbar";
import ChatList from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { Attachment, ChatRequestOptions, generateId } from "ai";
import { Message, useChat } from "ai/react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import useChatStore from "@/app/hooks/useChatStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FlipWords } from "../ui/flip-words";
import { AnimatePresence, motion } from "motion/react";

export interface ChatProps {
  id: string;
  initialMessages: Message[] | [];
  isMobile?: boolean;
}

export default function Chat({ initialMessages, id, isMobile }: ChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    setInput,
    reload,
  } = useChat({
    id,
    initialMessages,
    onResponse: (response: Response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onFinish: (message: Message) => {
      const savedMessages = getMessagesById(id);
      saveMessages(id, [...savedMessages, message]);
      setLoadingSubmit(false);
      router.replace(`/c/${id}`);
    },
    onError: (error: Error) => {
      setLoadingSubmit(false);
      router.replace("/");
      console.error(error.message);
      console.error(error.cause);
    },
  });
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const base64Images = useChatStore((state) => state.base64Images);
  const setBase64Images = useChatStore((state) => state.setBase64Images);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const saveMessages = useChatStore((state) => state.saveMessages);
  const getMessagesById = useChatStore((state) => state.getMessagesById);
  const router = useRouter();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.history.replaceState({}, "", `/c/${id}`);

    if (!selectedModel) {
      toast.error("Please select a model");
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
    };

    setLoadingSubmit(true);

    const attachments: Attachment[] = base64Images
      ? base64Images.map((image) => ({
          contentType: "image/base64",
          url: image,
        }))
      : [];

    const requestOptions: ChatRequestOptions = {
      body: {
        selectedModel: selectedModel,
      },
      ...(base64Images && {
        data: {
          images: base64Images,
        },
        experimental_attachments: attachments,
      }),
    };

    handleSubmit(e, requestOptions);
    saveMessages(id, [...messages, userMessage]);
    setBase64Images(null);
  };

  const removeLatestMessage = () => {
    const updatedMessages = messages.slice(0, -1);
    setMessages(updatedMessages);
    saveMessages(id, updatedMessages);
    return updatedMessages;
  };

  const handleStop = () => {
    stop();
    saveMessages(id, [...messages]);
    setLoadingSubmit(false);
  };

  const words = [
    "What’s on your mind?",
    "What would you like to explore?",
    "What are you thinking about?",
    "How can I help right now?",
    "What do you want to work on?",
    "What’s worth thinking about today?",
    "Say what you’re thinking.",
    "What should we start with?",
    "What do you want to create?",
    "What’s the idea?",
  ];

  return (
    <div className="flex flex-col w-full max-w-3xl h-full">
      <ChatTopbar
        isLoading={isLoading}
        chatId={id}
        messages={messages}
        setMessages={setMessages}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col h-full w-full items-center justify-center"
            >
              <div className="flex items-center justify-center">
                <FlipWords words={words} className="mb-8 text-2xl" />
              </div>
              <ChatBottombar
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={onSubmit}
                isLoading={isLoading}
                stop={handleStop}
                setInput={setInput}
              />
            </motion.div>
          ) : (
            <motion.div
              key="chat-state"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col h-full w-full"
            >
              <ChatList
                messages={messages}
                isLoading={isLoading}
                loadingSubmit={loadingSubmit}
                reload={async () => {
                  removeLatestMessage();

                  const requestOptions: ChatRequestOptions = {
                    body: {
                      selectedModel: selectedModel,
                    },
                  };

                  setLoadingSubmit(true);
                  return reload(requestOptions);
                }}
              />
              <ChatBottombar
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={onSubmit}
                isLoading={isLoading}
                stop={handleStop}
                setInput={setInput}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
