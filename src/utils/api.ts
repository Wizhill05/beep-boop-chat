import axios from "axios";
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  Message,
} from "../types/chat";
import { Bookmark, Chat, User } from "../types/database";

const API_URL = "http://localhost:1234/v1/chat/completions";

// Send a message to the AI model
export async function sendMessage(
  messages: Message[],
  model: string,
  chatId?: number,
  userId?: number
): Promise<Message> {
  try {
    const request: ChatCompletionRequest = {
      model: model,
      messages,
      temperature: 0.7,
      max_tokens: -1,
      stream: false,
    };

    const response = await axios.post<ChatCompletionResponse>(
      API_URL,
      request,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // If chatId and userId are provided, update the chat history with just the AI response
    // (The user message was already added to the database in ChatInput.tsx)
    if (chatId && userId) {
      // Get the current chat history
      const chat = await getChat(chatId);
      const currentMessages = chat.chat_data.messages || [];

      // Add the AI response to the chat history
      await updateChatHistory(chatId, [
        ...currentMessages,
        response.data.choices[0].message,
      ]);
    }

    return response.data.choices[0].message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// Create a new chat
export async function createChat(
  userId: number,
  title?: string,
  initialMessages?: Message[]
): Promise<Chat> {
  try {
    const response = await fetch("/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        title: title || "New Chat",
        messages: initialMessages || [],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create chat");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

// Get all chats for a user
export async function getUserChats(userId: number): Promise<Chat[]> {
  try {
    const response = await fetch(`/api/chats?userId=${userId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch chats");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
}

// Get a specific chat
export async function getChat(chatId: number): Promise<Chat> {
  try {
    const response = await fetch(`/api/chats/${chatId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch chat");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching chat:", error);
    throw error;
  }
}

// Update chat history
export async function updateChatHistory(
  chatId: number,
  messages: Message[]
): Promise<Chat> {
  try {
    const response = await fetch(`/api/chats/${chatId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update chat");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating chat:", error);
    throw error;
  }
}

// Create a bookmark
export async function createBookmark(
  chatId: number,
  name: string,
  messageIndex: number,
  context?: string,
  description?: string
): Promise<Bookmark> {
  try {
    const response = await fetch("/api/bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId,
        name,
        messageIndex,
        context,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create bookmark");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating bookmark:", error);
    throw error;
  }
}

// Get bookmarks for a chat
export async function getChatBookmarks(chatId: number): Promise<Bookmark[]> {
  try {
    const response = await fetch(`/api/bookmarks?chatId=${chatId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch bookmarks");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    throw error;
  }
}

// Add credits to a user
export async function addCredits(
  userId: number,
  amount: number
): Promise<{ success: boolean; newCredits: number }> {
  try {
    const response = await fetch(`/api/users/${userId}/add-credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add credits");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding credits:", error);
    throw error;
  }
}

// Add a custom model
export async function addCustomModel(
  name: string,
  modelPath: string,
  tokenCost: number,
  description?: string,
  parameters?: string
) {
  try {
    const response = await fetch("/api/models/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        tokenCost,
        modelPath,
        parameters,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add model");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding model:", error);
    throw error;
  }
}
