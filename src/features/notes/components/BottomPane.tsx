import React, { useState, useRef } from "react";
import { cn } from "@/shared/utils";
import { ScrollArea } from "@/shared/components/ScrollArea";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Settings, Send } from "lucide-react";
import { toast } from "@/shared/components/Toast";
import { useResizablePane } from "@/shared/hooks/useResizablePane";
import { useNotesContext } from "../context/notesContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BottomPaneProps {
  height: number;
  setHeight: (height: number) => void;
  paneRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const BottomPane: React.FC<BottomPaneProps> = ({
  height,
  setHeight,
  paneRef,
  onClose,
}) => {
  const { startResizing } = useResizablePane({
    minHeight: 100,
    maxHeight: 400,
    height,
    setHeight,
    paneRef,
    direction: "vertical",
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { performRAGChat, openNoteById } = useNotesContext();

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const assistantMessage = await performRAGChat([...messages, userMessage]);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error in RAG Chat:", error);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={paneRef}
      className={cn(
        "bg-background border-t border-border transition-all duration-300 overflow-hidden relative",
        "flex-shrink-0"
      )}
      style={{ height }}
    >
      <div
        onMouseDown={startResizing}
        className="absolute top-0 left-0 w-full h-1 cursor-ns-resize hover:bg-accent/50"
        style={{ top: "-1px" }}
      />
      <div className="flex justify-between items-center p-2 h-10 border-b border-border">
        <span className="font-semibold text-sm">Chat</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => toast("Settings feature is not implemented yet")}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col h-[calc(100%-2.5rem)]">
        <ScrollArea className="flex-grow p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "mb-4",
                message.role === "user" ? "text-right" : "text-left"
              )}
            >
              <div
                className={cn(
                  "inline-block px-4 py-2 rounded-md",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children, ...props }) => {
                      if (href?.startsWith("note://")) {
                        const noteId = href.replace("note://", "");
                        return (
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              openNoteById(noteId);
                            }}
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      }
                      return (
                        <a href={href} {...props}>
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mb-4 text-left">
              <div className="inline-block px-4 py-2 rounded-md bg-secondary text-secondary-foreground">
                <p>...</p>
              </div>
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomPane;
