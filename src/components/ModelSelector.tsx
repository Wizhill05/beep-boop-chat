import { useEffect, useState } from "react";
import AddModelForm from "./AddModelForm";

interface Model {
  id: number;
  name: string;
  description: string;
  token_cost: number;
}

interface ModelSelectorProps {
  onModelSelect: (modelName: string) => void;
  selectedModel: string;
}

export default function ModelSelector({
  onModelSelect,
  selectedModel,
}: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddModelForm, setShowAddModelForm] = useState(false);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/models");
      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }
      const data = await response.json();
      setModels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load models");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleModelAdded = () => {
    fetchModels();
    setShowAddModelForm(false);
  };

  const selectedModelInfo = models.find((m) => m.name === selectedModel);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-[rgb(var(--text-secondary))]">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="ml-2">Loading models...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-400 bg-[rgb(30,10,10)] rounded-md">
        Error: {error}
      </div>
    );
  }

  if (showAddModelForm) {
    return (
      <AddModelForm
        onModelAdded={handleModelAdded}
        onCancel={() => setShowAddModelForm(false)}
      />
    );
  }

  return (
    <div className="relative">
      <div
        className="flex items-center space-x-2 p-2 dark-card hover:border-blue-500 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="font-medium">
            {selectedModelInfo?.name || "Select a model"}
          </div>
          <div className="text-sm text-[rgb(var(--text-secondary))]">
            {selectedModelInfo?.token_cost} credits per message
          </div>
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
          {models.map((model) => (
            <div
              key={model.id}
              className={`p-3 hover:bg-[rgb(var(--hover-color))] cursor-pointer ${
                model.name === selectedModel ? "bg-[rgb(25,35,55)]" : ""
              }`}
              onClick={() => {
                onModelSelect(model.name);
                setIsExpanded(false);
              }}
            >
              <div className="font-medium">{model.name}</div>
              <div className="text-sm text-[rgb(var(--text-secondary))]">
                {model.token_cost} credits per message
              </div>
              <div className="text-xs text-[rgb(var(--text-secondary))] mt-1">
                {model.description}
              </div>
            </div>
          ))}

          <div
            className="p-3 text-center text-blue-400 hover:bg-[rgb(var(--hover-color))] cursor-pointer border-t border-[rgb(var(--border-color))]"
            onClick={() => {
              setIsExpanded(false);
              setShowAddModelForm(true);
            }}
          >
            + Add Custom Model
          </div>
        </div>
      )}
    </div>
  );
}
