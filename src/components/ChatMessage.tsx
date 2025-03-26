import { Message } from "../types/chat";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0">
          <span className="text-white font-bold text-sm">AI</span>
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-[rgb(var(--secondary-bg))] border border-[rgb(var(--border-color))] rounded-bl-none"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center ml-2 flex-shrink-0">
          <span className="text-white font-bold text-sm">U</span>
        </div>
      )}
    </div>
  );
}
