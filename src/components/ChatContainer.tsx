"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "../types/chat";
import { User, Chat, Bookmark } from "../types/database";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ModelSelector from "./ModelSelector";
import UserSelector from "./UserSelector";
import {
  getUserChats,
  createChat,
  getChat,
  getChatBookmarks,
  createBookmark,
  addCredits,
} from "../utils/api";

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    "phi-4-mini-instruct"
  );
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [showAddCredits, setShowAddCredits] = useState<boolean>(false);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(10);
  const [bookmarkName, setBookmarkName] = useState<string>("");
  const [bookmarkDescription, setBookmarkDescription] = useState<string>("");
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<
    number | null
  >(null);
  const [isModelThinking, setIsModelThinking] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch user chats when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchUserChats();
    }
  }, [selectedUser]);

  // Fetch bookmarks when current chat changes
  useEffect(() => {
    if (currentChat) {
      fetchBookmarks();
    }
  }, [currentChat]);

  const fetchUserChats = async () => {
    if (!selectedUser) return;

    try {
      const chats = await getUserChats(selectedUser.id);
      setUserChats(chats);
    } catch (error) {
      console.error("Error fetching user chats:", error);
    }
  };

  const fetchBookmarks = async () => {
    if (!currentChat) return;

    try {
      const bookmarks = await getChatBookmarks(currentChat.id);
      setBookmarks(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const handleNewMessage = async (message: Message) => {
    setMessages((prev) => [...prev, message]);

    // If it's a user message and there's no current chat, create one first
    if (!currentChat && selectedUser && message.role === "user") {
      // Create a new chat and wait for it to complete
      const newChat = await createNewChat([...messages, message]);

      // Update the current chat state with the new chat
      setCurrentChat(newChat);

      return; // Return early as the message is already included in the new chat
    }

    // Note: We're not updating the chat history here anymore.
    // The sendMessage function in api.ts will handle updating the chat history
    // with both the user message and the AI response to avoid race conditions.
  };

  // Delete a chat
  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the chat selection

    if (!confirm("Are you sure you want to delete this chat?")) return;

    try {
      await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });

      // If we're deleting the current chat, reset the current chat
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }

      // Refresh the chat list
      fetchUserChats();
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Delete a bookmark
  const handleDeleteBookmark = async (bookmarkId: number) => {
    if (!confirm("Are you sure you want to delete this bookmark?")) return;

    try {
      await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "DELETE",
      });

      // Refresh the bookmarks
      fetchBookmarks();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  };

  const createNewChat = async (
    initialMessages: Message[] = []
  ): Promise<Chat | null> => {
    if (!selectedUser) return null;

    try {
      // Use the first user message as the chat title
      let chatTitle = "New Chat";
      if (initialMessages.length > 0) {
        const firstUserMessage = initialMessages.find(
          (msg) => msg.role === "user"
        );
        if (firstUserMessage) {
          // Limit the title length to a reasonable size
          chatTitle =
            firstUserMessage.content.length > 50
              ? firstUserMessage.content.substring(0, 50) + "..."
              : firstUserMessage.content;
        }
      }

      const newChat = await createChat(
        selectedUser.id,
        chatTitle,
        initialMessages
      );

      fetchUserChats(); // Refresh the chat list
      return newChat;
    } catch (error) {
      console.error("Error creating new chat:", error);
      return null;
    }
  };

  // Import the updateChatHistory function
  const updateChatHistory = async (chatId: number, messages: Message[]) => {
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
        }),
      });
    } catch (error) {
      console.error("Error updating chat history:", error);
      throw error;
    }
  };

  const handleSelectChat = async (chatId: number) => {
    try {
      const chat = await getChat(chatId);
      setCurrentChat(chat);
      setMessages(chat.chat_data.messages || []);
      setShowMobileMenu(false);
    } catch (error) {
      console.error("Error selecting chat:", error);
    }
  };

  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setCredits(user.credits);
    setCurrentChat(null);
    setMessages([]);
  };

  const handleAddCredits = async () => {
    if (!selectedUser || creditsToAdd <= 0) return;

    try {
      const result = await addCredits(selectedUser.id, creditsToAdd);
      setCredits(result.newCredits);
      setShowAddCredits(false);
      setCreditsToAdd(10); // Reset to default
    } catch (error) {
      console.error("Error adding credits:", error);
    }
  };

  const handleCreateBookmark = async () => {
    if (!currentChat || !bookmarkName || selectedMessageIndex === null) return;

    try {
      const context = messages[selectedMessageIndex].content;
      await createBookmark(
        currentChat.id,
        bookmarkName,
        selectedMessageIndex,
        context,
        bookmarkDescription
      );

      // Reset form and refresh bookmarks
      setBookmarkName("");
      setBookmarkDescription("");
      setSelectedMessageIndex(null);
      fetchBookmarks();
      setShowBookmarks(false);
    } catch (error) {
      console.error("Error creating bookmark:", error);
    }
  };

  const handleNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setShowMobileMenu(false);
  };

  const formatChatTitle = (chat: Chat) => {
    if (chat.title) return chat.title;

    // Extract first message content if available
    if (chat.chat_data?.messages?.length > 0) {
      const firstUserMsg = chat.chat_data.messages.find(
        (m) => m.role === "user"
      );
      if (firstUserMsg) {
        const content = firstUserMsg.content;
        return content.length > 30 ? content.substring(0, 30) + "..." : content;
      }
    }

    return `Chat ${chat.id}`;
  };

  // If no user is selected, show the user selection screen
  if (!selectedUser) {
    return (
      <div className="flex flex-col h-screen w-full bg-[rgb(var(--background-rgb))]">
        <div className="p-6 max-w-md mx-auto w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Beep Boop Chat
          </h1>
          <div className="dark-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              Select or Create User
            </h2>
            <UserSelector
              selectedUser={selectedUser}
              onUserSelect={handleUserSelect}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[rgb(var(--background-rgb))]">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 dark-button-secondary p-2"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        {showMobileMenu ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          showMobileMenu
            ? "fixed inset-0 z-40 bg-[rgb(var(--background-rgb))]"
            : "hidden"
        } md:flex md:flex-col md:w-80 md:min-w-[320px] bg-[rgb(var(--secondary-bg))] border-r border-[rgb(var(--border-color))]`}
      >
        <div className="p-4 border-b border-[rgb(var(--border-color))]">
          <h1 className="text-xl font-bold">Beep Boop Chat</h1>
        </div>

        <div className="p-4 border-b border-[rgb(var(--border-color))]">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium">{selectedUser.username}</div>
            <div className="text-sm text-blue-400">{credits} credits</div>
          </div>
          <div className="flex space-x-2">
            <button
              className="dark-button-secondary text-sm flex-1"
              onClick={() => setSelectedUser(null)}
            >
              Change User
            </button>
            <button
              className="dark-button-secondary text-sm flex-1"
              onClick={() => setShowAddCredits(true)}
            >
              Add Credits
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-[rgb(var(--border-color))]">
          <button
            className="dark-button-primary w-full mb-2"
            onClick={handleNewChat}
          >
            New Chat
          </button>

          <div className="text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
            Model: {selectedModel}
          </div>
          <ModelSelector
            selectedModel={selectedModel}
            onModelSelect={handleModelSelect}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-sm font-medium text-[rgb(var(--text-secondary))] px-2 py-1">
            Chat History
          </div>
          {userChats.length === 0 ? (
            <div className="text-sm text-[rgb(var(--text-secondary))] p-2">
              No chats yet. Start a new conversation!
            </div>
          ) : (
            <div className="space-y-1">
              {userChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`sidebar-item ${
                    currentChat?.id === chat.id ? "sidebar-item-active" : ""
                  } group`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm truncate">
                        {formatChatTitle(chat)}
                      </div>
                      <div className="text-xs text-[rgb(var(--text-secondary))]">
                        {new Date(chat.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      title="Delete chat"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b border-[rgb(var(--border-color))] bg-[rgb(var(--secondary-bg))]">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {currentChat ? formatChatTitle(currentChat) : "New Chat"}
            </h2>

            {currentChat && (
              <div className="flex space-x-2">
                <button
                  className="dark-button-secondary text-sm"
                  onClick={() => setShowBookmarks(!showBookmarks)}
                >
                  Bookmarks ({bookmarks.length}/10)
                </button>
                <button
                  className="dark-button-secondary text-sm"
                  onClick={() => setSelectedMessageIndex(messages.length - 1)}
                  disabled={messages.length === 0}
                >
                  Bookmark Last
                </button>
              </div>
            )}
          </div>

          {/* Bookmarks dropdown */}
          {showBookmarks && (
            <div className="mt-2 dark-card p-3 max-h-60 overflow-y-auto">
              <h3 className="font-medium mb-2">Bookmarks</h3>
              {bookmarks.length === 0 ? (
                <p className="text-[rgb(var(--text-secondary))] text-sm">
                  No bookmarks yet. Create one by selecting a message.
                </p>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="p-2 border border-[rgb(var(--border-color))] rounded hover:bg-[rgb(var(--hover-color))] group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{bookmark.name}</div>
                          {bookmark.description && (
                            <div className="text-sm text-[rgb(var(--text-secondary))]">
                              {bookmark.description}
                            </div>
                          )}
                          <div className="text-xs text-[rgb(var(--text-secondary))] mt-1">
                            {new Date(bookmark.created_at).toLocaleString()}
                          </div>
                        </div>
                        <button
                          className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                          title="Delete bookmark"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add credits modal */}
          {showAddCredits && (
            <div className="mt-2 dark-card p-4">
              <h3 className="font-medium mb-3">Add Credits</h3>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Amount to Add
                </label>
                <input
                  type="number"
                  min="1"
                  value={creditsToAdd}
                  onChange={(e) => setCreditsToAdd(Number(e.target.value))}
                  className="dark-input w-full p-2"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddCredits}
                  className="dark-button-primary"
                >
                  Add Credits
                </button>
                <button
                  onClick={() => setShowAddCredits(false)}
                  className="dark-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Bookmark Modal */}
        {selectedMessageIndex !== null && (
          <div className="border-b border-[rgb(var(--border-color))] bg-[rgb(var(--secondary-bg))] p-4">
            <h3 className="font-medium mb-3">Create Bookmark</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Bookmark Name*
              </label>
              <input
                type="text"
                value={bookmarkName}
                onChange={(e) => setBookmarkName(e.target.value)}
                className="dark-input w-full p-2"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={bookmarkDescription}
                onChange={(e) => setBookmarkDescription(e.target.value)}
                className="dark-input w-full p-2"
                rows={2}
              />
            </div>
            <div className="mb-3 p-2 bg-[rgb(var(--hover-color))] rounded border border-[rgb(var(--border-color))] text-sm">
              <div className="font-medium mb-1">Selected Message:</div>
              <div className="text-[rgb(var(--text-secondary))]">
                {messages[selectedMessageIndex]?.content.substring(0, 100)}
                {messages[selectedMessageIndex]?.content.length > 100
                  ? "..."
                  : ""}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateBookmark}
                className="dark-button-primary"
                disabled={!bookmarkName}
              >
                Create Bookmark
              </button>
              <button
                onClick={() => setSelectedMessageIndex(null)}
                className="dark-button-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-[rgb(var(--text-secondary))] mt-8">
              <p className="text-lg">
                Welcome to Beep Boop Chat,{" "}
                {selectedUser.name || selectedUser.username}!
              </p>
              <p className="text-sm mt-2">Choose a model and start chatting.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className="group"
                onClick={() => setSelectedMessageIndex(index)}
              >
                <ChatMessage message={message} />
                <div className="hidden group-hover:flex justify-end mt-1">
                  <button className="text-xs text-blue-400 hover:text-blue-300">
                    Bookmark
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Loading animation when model is thinking */}
          {isModelThinking && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <div className="dark-card p-3 rounded-lg max-w-3xl">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t border-[rgb(var(--border-color))] p-4 bg-[rgb(var(--secondary-bg))]">
          <ChatInput
            onSend={handleNewMessage}
            selectedModel={selectedModel}
            selectedUser={selectedUser}
            userCredits={credits}
            setUserCredits={setCredits}
            currentChat={currentChat}
            messages={messages}
            setIsModelThinking={setIsModelThinking}
          />
        </div>
      </div>
    </div>
  );
}
