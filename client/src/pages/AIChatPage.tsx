import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Plus, Trash2, MessageCircle } from "lucide-react";
import { Streamdown } from "streamdown";
import DashboardLayout from "@/components/DashboardLayout";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

export default function AIChatPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } =
    trpc.aiChat.getConversations.useQuery();
  const { data: messagesData } = trpc.aiChat.getMessages.useQuery(
    selectedConversation || 0,
    {
      enabled: !!selectedConversation,
    }
  );
  const utils = trpc.useUtils();

  // Mutations
  const createConversationMutation =
    trpc.aiChat.createConversation.useMutation();
  const sendMessageMutation = trpc.aiChat.sendMessage.useMutation();
  const deleteConversationMutation =
    trpc.aiChat.deleteConversation.useMutation();

  // Update conversations list
  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
      if (!selectedConversation && conversationsData.length > 0) {
        setSelectedConversation(conversationsData[0].id);
      }
    }
  }, [conversationsData, selectedConversation]);

  // Update messages
  useEffect(() => {
    if (messagesData) {
      // Only update if messagesData is longer, or if we have no optimistic messages.
      // This prevents background refetches from wiping out messages that haven't been saved yet.
      setMessages(prev => {
        // Find if we have optimistic unsaved messages (no ID)
        const hasOptimistic = prev.some(m => !m.id);
        if (hasOptimistic && prev.length >= messagesData.length) {
          return prev;
        }
        return messagesData;
      });
      scrollToBottom();
    }
  }, [messagesData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCreateConversation = async () => {
    try {
      const result = await createConversationMutation.mutateAsync({
        title: `${t("chat.conversationTitle")} ${new Date().toLocaleDateString()}`,
      });
      if (result.conversationId) {
        setSelectedConversation(result.conversationId);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedConversation || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        message: input,
      });

      if (response.response) {
        const assistantMessage: Message = {
          role: "assistant",
          content: response.response,
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Force React Query to fetch the new messages including IDs
        utils.aiChat.getMessages.invalidate(selectedConversation);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: t("chat.sendError"),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await deleteConversationMutation.mutateAsync(conversationId);
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-120px)] gap-4">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col">
          <Button
            onClick={handleCreateConversation}
            className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
            disabled={createConversationMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("chat.newConversation")}
          </Button>

          <div className="flex-1 overflow-y-auto space-y-2">
            {conversationsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : conversations.length > 0 ? (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group flex justify-between items-center ${
                    selectedConversation === conv.id
                      ? "bg-blue-600/20 border border-blue-500"
                      : "bg-slate-700/50 hover:bg-slate-700"
                  }`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm text-center py-4">
                {t("chat.noMessages")}
              </p>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">{t("chat.startNewChat")}</p>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-700 text-slate-100"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <Streamdown>{msg.content}</Streamdown>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-slate-700 px-4 py-3 rounded-lg flex items-center gap-3">
                          <span className="text-sm text-slate-300">Model is thinking</span>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-slate-700 p-4">
                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && handleSendMessage()}
                    placeholder={t("chat.placeholder")}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">
                  {t("chat.startNewChat")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
