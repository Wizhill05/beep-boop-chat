import { useEffect, useState } from "react";
import { User } from "../types/database";

interface UserSelectorProps {
  onUserSelect: (user: User) => void;
  selectedUser: User | null;
}

export default function UserSelector({
  onUserSelect,
  selectedUser,
}: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newUsername.trim() || !newEmail.trim()) {
      setFormError("Username and email are required");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          name: newName.trim() || null,
          email: newEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error || "Failed to create user");
        return;
      }

      // Reset form
      setNewUsername("");
      setNewName("");
      setNewEmail("");
      setShowCreateForm(false);

      // Refresh users list and select the new user
      await fetchUsers();
      onUserSelect(data);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create user"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-[rgb(var(--text-secondary))]">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-[rgb(30,10,10)] rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="relative">
      {!showCreateForm ? (
        <>
          <div
            className="flex items-center space-x-2 p-2 dark-card hover:border-blue-500 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex-1">
              <div className="font-medium">
                {selectedUser ? selectedUser.username : "Select a user"}
              </div>
              {selectedUser && (
                <div className="text-sm text-[rgb(var(--text-secondary))]">
                  {selectedUser.email}
                </div>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-[rgb(var(--text-secondary))] transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {isExpanded && (
            <div className="absolute z-10 w-full mt-1 bg-[rgb(var(--secondary-bg))] rounded-md shadow-lg border border-[rgb(var(--border-color))]">
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 hover:bg-[rgb(var(--hover-color))] cursor-pointer ${
                      selectedUser?.id === user.id ? "bg-[rgb(25,35,55)]" : ""
                    }`}
                    onClick={() => {
                      onUserSelect(user);
                      setIsExpanded(false);
                    }}
                  >
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-[rgb(var(--text-secondary))]">
                      {user.email}
                    </div>
                    <div className="text-xs text-blue-400 mt-1">
                      Credits: {user.credits}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-[rgb(var(--text-secondary))] text-center">
                  No users found
                </div>
              )}
              <div
                className="p-3 text-center text-blue-400 hover:bg-[rgb(var(--hover-color))] cursor-pointer border-t border-[rgb(var(--border-color))]"
                onClick={() => {
                  setIsExpanded(false);
                  setShowCreateForm(true);
                }}
              >
                + Create New User
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="dark-card p-4">
          <h3 className="font-medium mb-3">Create New User</h3>
          {formError && (
            <div className="mb-3 text-sm text-red-400 bg-[rgb(30,10,10)] p-2 rounded">
              {formError}
            </div>
          )}
          <form onSubmit={handleCreateUser}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Username*
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="dark-input w-full p-2"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="dark-input w-full p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email*</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="dark-input w-full p-2"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="dark-button-primary">
                Create User
              </button>
              <button
                type="button"
                className="dark-button-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
