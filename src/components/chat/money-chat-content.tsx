"use client";

import { useReducer, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  sendMoneyChat,
  getChatSessions,
  saveChatSession,
  deleteChatSession,
  type ChatMessage,
  type ChatSessionItem,
} from "@/actions/money-chat";
import { useAiCheck, AiSetupDialog } from "@/components/ai-setup-dialog";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";
import {
  Send,
  Loader2,
  MessageCircle,
  Bot,
  User,
  Trash2,
  Plus,
  History,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Message = ChatMessage & { id: string };

const SUGGESTIONS = [
  "How much did I spend this month?",
  "What's my biggest expense category?",
  "Compare this month vs last month",
  "How much do I spend on food?",
  "Am I under budget?",
  "What's my net cashflow?",
];

// ── Reducer types & function ──

type ChatState = {
  messages: Message[];
  input: string;
  loading: boolean;
  sessionId: string | null;
  sessions: ChatSessionItem[];
  showHistory: boolean;
  historyLoading: boolean;
};

type ChatAction =
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "SET_INPUT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SESSION_ID"; payload: string | null }
  | { type: "SET_SESSIONS"; payload: ChatSessionItem[] }
  | { type: "SET_SHOW_HISTORY"; payload: boolean }
  | { type: "SET_HISTORY_LOADING"; payload: boolean }
  | { type: "SEND_MESSAGE"; payload: { messages: Message[] } }
  | { type: "RECEIVE_REPLY"; payload: { messages: Message[] } }
  | { type: "START_NEW_CHAT" }
  | { type: "LOAD_SESSION"; payload: { messages: Message[]; sessionId: string } }
  | { type: "DELETE_SESSION"; payload: string }
  | { type: "LOAD_SESSIONS_DONE"; payload: ChatSessionItem[] };

const chatInitialState: ChatState = {
  messages: [],
  input: "",
  loading: false,
  sessionId: null,
  sessions: [],
  showHistory: false,
  historyLoading: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "SET_INPUT":
      return { ...state, input: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_SESSION_ID":
      return { ...state, sessionId: action.payload };
    case "SET_SESSIONS":
      return { ...state, sessions: action.payload };
    case "SET_SHOW_HISTORY":
      return { ...state, showHistory: action.payload };
    case "SET_HISTORY_LOADING":
      return { ...state, historyLoading: action.payload };
    case "SEND_MESSAGE":
      return { ...state, messages: action.payload.messages, input: "", loading: true };
    case "RECEIVE_REPLY":
      return { ...state, messages: action.payload.messages, loading: false };
    case "START_NEW_CHAT":
      return { ...state, messages: [], sessionId: null, showHistory: false };
    case "LOAD_SESSION":
      return { ...state, messages: action.payload.messages, sessionId: action.payload.sessionId, showHistory: false };
    case "DELETE_SESSION": {
      const isCurrentSession = state.sessionId === action.payload;
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== action.payload),
        ...(isCurrentSession ? { messages: [], sessionId: null } : {}),
      };
    }
    case "LOAD_SESSIONS_DONE":
      return { ...state, sessions: action.payload, historyLoading: false };
    default:
      return state;
  }
}

export function MoneyChatContent() {
  const [state, dispatch] = useReducer(chatReducer, chatInitialState);
  const { messages, input, loading, sessionId, sessions, showHistory, historyLoading } = state;
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { checkAi, showSetup, setShowSetup } = useAiCheck();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSessions = useCallback(async () => {
    dispatch({ type: "SET_HISTORY_LOADING", payload: true });
    const items = await getChatSessions();
    dispatch({ type: "LOAD_SESSIONS_DONE", payload: items });
  }, []);

  // Auto-save after each AI reply
  const autoSave = useCallback(async (msgs: Message[], sid: string | null) => {
    if (msgs.length < 2) return sid;
    const title = msgs[0].content.slice(0, 60) + (msgs[0].content.length > 60 ? "..." : "");
    const chatMsgs = msgs.map((m) => ({ role: m.role, content: m.content }));
    const res = await saveChatSession(sid, title, chatMsgs);
    return res.id;
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!checkAi()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
    };

    const newMessages = [...messages, userMsg];
    dispatch({ type: "SEND_MESSAGE", payload: { messages: newMessages } });

    const chatHistory = newMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const res = await sendMoneyChat(chatHistory);

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "error" in res ? `Error: ${res.error}` : res.reply,
    };

    const allMessages = [...newMessages, assistantMsg];
    dispatch({ type: "RECEIVE_REPLY", payload: { messages: allMessages } });

    // Auto-save
    const newId = await autoSave(allMessages, sessionId);
    if (newId && !sessionId) dispatch({ type: "SET_SESSION_ID", payload: newId });

    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const startNewChat = () => {
    dispatch({ type: "START_NEW_CHAT" });
  };

  const loadSession = (session: ChatSessionItem) => {
    dispatch({
      type: "LOAD_SESSION",
      payload: {
        messages: session.messages.map((m) => ({
          ...m,
          id: crypto.randomUUID(),
        })),
        sessionId: session.id,
      },
    });
  };

  const handleDeleteSession = async (id: string) => {
    await deleteChatSession(id);
    dispatch({ type: "DELETE_SESSION", payload: id });
    toast.success("Chat deleted");
  };

  const openHistory = async () => {
    dispatch({ type: "SET_SHOW_HISTORY", payload: true });
    await loadSessions();
  };

  return (
    <>
      <AiSetupDialog open={showSetup} onOpenChange={setShowSetup} />
      <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Money Chat</h2>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={openHistory} className="h-8 text-xs">
              <History className="h-3.5 w-3.5 mr-1" />
              History
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={startNewChat} className="h-8 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                New
              </Button>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Ask anything about your finances
              </p>
              <p className="text-xs text-muted-foreground/60 mb-4">
                I have access to your transactions, budgets, bills, and more.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 text-muted-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <Card
                className={cn(
                  "max-w-[85%]",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : ""
                )}
              >
                <CardContent className="p-3">
                  <div
                    className={cn(
                      "text-sm whitespace-pre-wrap break-words",
                      msg.role === "user" ? "text-primary-foreground" : ""
                    )}
                  >
                    {msg.content}
                  </div>
                </CardContent>
              </Card>
              {msg.role === "user" && (
                <div className="shrink-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center mt-0.5">
                  <User className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Thinking...
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => dispatch({ type: "SET_INPUT", payload: e.target.value })}
            placeholder="Ask about your money..."
            disabled={loading}
            autoFocus
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* History Dialog */}
      <ResponsiveDialog open={showHistory} onOpenChange={(v) => dispatch({ type: "SET_SHOW_HISTORY", payload: v })}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Chat History</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Your previous conversations
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {historyLoading && (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!historyLoading && sessions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No chat history yet
              </p>
            )}

            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-2 rounded-lg hover:bg-muted/50 p-2 group"
              >
                <button
                  onClick={() => loadSession(session)}
                  className="flex-1 text-left min-w-0"
                >
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {session.messages.length} messages
                    {" \u00B7 "}
                    {new Date(session.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteSession(session.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
