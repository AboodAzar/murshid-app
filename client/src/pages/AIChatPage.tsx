import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Plus,
  Trash2,
  Sparkles,
  User,
  PanelLeftClose,
  PanelRightClose,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Streamdown } from "streamdown";
import DashboardLayout from "@/components/DashboardLayout";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
  feedback?: "up" | "down" | "none";
}

export default function AIChatPage() {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  const rateMessageMutation = trpc.aiChat.rateMessage.useMutation();

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
      setMessages(prev => {
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
        scrollToBottom();
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
      scrollToBottom();
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

  const handleRateMessage = async (messageId: number, feedback: "up" | "down") => {
    // Optimistic update
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, feedback: msg.feedback === feedback ? "none" : feedback }
          : msg
      )
    );

    try {
      const currentMsg = messages.find(m => m.id === messageId);
      const newFeedback = currentMsg?.feedback === feedback ? "none" : feedback;
      await rateMessageMutation.mutateAsync({
        messageId,
        feedback: newFeedback,
      });
    } catch (error) {
      console.error("Failed to rate message:", error);
      // Revert on error
      utils.aiChat.getMessages.invalidate(selectedConversation!);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-6rem)] overflow-hidden bg-background relative -m-4">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-e bg-card/30 flex flex-col overflow-hidden h-full shrink-0"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <Button
                  onClick={handleCreateConversation}
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  disabled={createConversationMutation.isPending}
                >
                  <Plus className="w-4 h-4 me-2" />
                  {t("chat.newConversation")}
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversationsLoading ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors group flex justify-between items-center text-sm ${
                        selectedConversation === conv.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                      onClick={() => setSelectedConversation(conv.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{conv.title}</p>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    {t("chat.noMessages")}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
          {/* Header */}
          <div className="absolute top-0 start-0 p-4 z-10 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground rounded-full h-10 w-10 bg-background/50 backdrop-blur-md border border-border/50"
            >
              {sidebarOpen ? (
                dir === "rtl" ? <PanelRightClose className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5 transform rotate-180" />
              )}
            </Button>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent ps-2">
              Murshid AI
            </h1>
          </div>

          {/* Messages Wrapper */}
          <div className="flex-1 overflow-y-auto scroll-smooth pt-20 pb-40">
            {selectedConversation ? (
              <div className="max-w-4xl mx-auto w-full px-4 sm:px-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-6">
                      <Sparkles className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">{t("chat.title")}</h2>
                    <p className="text-muted-foreground">{t("chat.startNewChat")}</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <AnimatePresence initial={false}>
                      {messages.map((msg, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-4 sm:gap-6 w-full"
                        >
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 border border-border/50 shadow-sm mt-1">
                            {msg.role === "assistant" ? (
                              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 h-full w-full flex items-center justify-center text-white">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                            ) : (
                              <AvatarFallback className="bg-muted text-muted-foreground font-medium text-xs sm:text-sm">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <div className="font-medium text-sm text-foreground/80 mb-1.5">
                              {msg.role === "assistant" ? "Murshid AI" : t("common.profile")}
                            </div>
                            <div className="text-foreground prose prose-sm sm:prose-base dark:prose-invert max-w-none leading-relaxed">
                              {msg.role === "assistant" ? (
                                <Streamdown>{msg.content}</Streamdown>
                              ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              )}
                            </div>
                            {msg.role === "assistant" && msg.id && (
                              <div className="flex items-center gap-2 mt-3 pt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 px-2.5 rounded-full ${msg.feedback === "up" ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:text-blue-600" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
                                  onClick={() => handleRateMessage(msg.id!, "up")}
                                  disabled={rateMessageMutation.isPending}
                                >
                                  <ThumbsUp className={`w-4 h-4 ${msg.feedback === "up" ? "fill-current" : ""}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 px-2.5 rounded-full ${msg.feedback === "down" ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
                                  onClick={() => handleRateMessage(msg.id!, "down")}
                                  disabled={rateMessageMutation.isPending}
                                >
                                  <ThumbsDown className={`w-4 h-4 ${msg.feedback === "down" ? "fill-current" : ""}`} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-4 sm:gap-6 w-full"
                        >
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 border border-border/50 shadow-sm mt-1">
                            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 h-full w-full flex items-center justify-center text-white">
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                          </Avatar>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <div className="font-medium text-sm text-foreground/80 mb-1.5">Murshid AI</div>
                            <div className="flex items-center gap-1.5 mt-2 h-6">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-8" />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
                  <Sparkles className="w-12 h-12 text-blue-400" />
                </div>
                <h2 className="text-3xl font-semibold mb-3 tracking-tight">Murshid AI</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-md text-center px-4">
                  {t("chat.startNewChat")}
                </p>
                <Button
                  onClick={handleCreateConversation}
                  size="lg"
                  className="rounded-full shadow-lg hover:shadow-xl transition-all px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                  disabled={createConversationMutation.isPending}
                >
                  <Plus className="w-5 h-5 me-2" />
                  {t("chat.startNewChat")}
                </Button>
              </div>
            )}
          </div>

          {/* Floating Input Area */}
          <div className="absolute bottom-0 start-0 end-0 bg-gradient-to-t from-background via-background to-transparent pt-10 pb-6 px-4">
            <div className="max-w-4xl mx-auto relative">
              <div className="relative flex items-end gap-2 bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[24px] p-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={t("chat.placeholder")}
                  className="w-full bg-transparent border-0 focus:ring-0 resize-none min-h-[44px] max-h-48 py-3 px-4 text-foreground placeholder:text-muted-foreground scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
                  disabled={isLoading || !selectedConversation}
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading || !selectedConversation}
                  className="shrink-0 h-11 w-11 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm disabled:bg-muted disabled:text-muted-foreground mb-0.5 me-0.5"
                  size="icon"
                >
                  <Send className="w-5 h-5 ms-1" />
                </Button>
              </div>
              <div className="text-center mt-3">
                <span className="text-[11px] text-muted-foreground">
                  Murshid AI can make mistakes. Consider verifying important information.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
