import { useState } from "react";
import { sendMessage } from "../utils/api";
import { Message } from "../types/chat";
import { User, Chat } from "../types/database";
import { Dispatch, SetStateAction } from "react";

interface ChatInputProps {
  onSend: (message: Message) => void;
  selectedModel: string;
  selectedUser: User | null;
  userCredits: number;
  setUserCredits: Dispatch<SetStateAction<number>>;
  currentChat?: Chat | null;
  messages?: Message[];
  setIsModelThinking?: Dispatch<SetStateAction<boolean>>;
}

export default function ChatInput({
  onSend,
  selectedModel,
  selectedUser,
  userCredits,
  setUserCredits,
  currentChat = null,
  messages = [],
  setIsModelThinking,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Clear any previous errors
    setError(null);

    // Check if user is selected
    if (!selectedUser) {
      setError("Please select a user to send messages");
      return;
    }

    // Set model thinking state
    if (setIsModelThinking) {
      setIsModelThinking(true);
    }

    // Get the model cost from the API
    try {
      const response = await fetch(
        `/api/models?name=${encodeURIComponent(selectedModel)}`
      );
      const models = await response.json();
      const selectedModelData = models.find(
        (m: any) => m.name === selectedModel
      );

      if (!selectedModelData) {
        throw new Error("Selected model information not found");
      }

      const modelCost = selectedModelData.token_cost;

      // Check if user has enough credits - strict check to prevent sending messages with insufficient credits
      if (userCredits < modelCost) {
        setError(
          `Insufficient credits. This model requires ${modelCost} credits per message. You have ${userCredits} credits.`
        );
        if (setIsModelThinking) {
          setIsModelThinking(false);
        }
        return;
      }

      const userMessage: Message = { role: "user", content: input };
      onSend(userMessage);
      setInput("");
      setIsLoading(true);

      // Deduct credits
      setUserCredits((prev) => prev - modelCost);

      // Update user credits in the database
      await fetch(`/api/users/${selectedUser.id}/credits`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credits: userCredits - modelCost,
        }),
      });

      try {
        // Include chat history as context if available
        const contextMessages = currentChat
          ? [...messages, userMessage]
          : [userMessage];

        // For existing chats, manually update the chat history with the user message first
        if (currentChat) {
          await fetch(`/api/chats/${currentChat.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [...messages, userMessage],
            }),
          });
        }

        // Send message with chat context
        const responseMessage = await sendMessage(
          contextMessages,
          selectedModel,
          currentChat?.id,
          selectedUser.id
        );

        onSend(responseMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        onSend({
          role: "assistant",
          content:
            "Sorry, there was an error processing your message. Please try again.",
        });

        // Refund credits on error
        setUserCredits((prev) => prev + modelCost);

        // Update user credits in the database (refund)
        await fetch(`/api/users/${selectedUser.id}/credits`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credits: userCredits,
          }),
        });
      } finally {
        setIsLoading(false);
        // Reset model thinking state
        if (setIsModelThinking) {
          setIsModelThinking(false);
        }
      }
    } catch (error) {
      console.error("Error checking model cost:", error);
      setError("Error checking model cost. Please try again.");
      if (setIsModelThinking) {
        setIsModelThinking(false);
      }
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-3 p-2 bg-[rgb(30,10,10)] text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="dark-input flex-grow p-2 rounded-r-none"
          placeholder={
            selectedUser
              ? "Type your message..."
              : "Select a user to start chatting"
          }
          disabled={isLoading || !selectedUser}
        />
        <button
          type="submit"
          className={`px-4 rounded-r-lg ${
            isLoading || !selectedUser
              ? "bg-gray-600 cursor-not-allowed"
              : "dark-button-primary"
          } text-white`}
          disabled={isLoading || !selectedUser}
        >
          {isLoading ? (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </div>
  );
}
