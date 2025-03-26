import { useState } from "react";
import { addCustomModel } from "../utils/api";

interface AddModelFormProps {
  onModelAdded: () => void;
  onCancel: () => void;
}

export default function AddModelForm({
  onModelAdded,
  onCancel,
}: AddModelFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [modelPath, setModelPath] = useState("");
  const [tokenCost, setTokenCost] = useState(1.0);
  const [parameters, setParameters] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !modelPath.trim() || tokenCost <= 0) {
      setError("Name, model path, and a positive token cost are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addCustomModel(
        name.trim(),
        modelPath.trim(),
        tokenCost,
        description.trim() || undefined,
        parameters.trim() || undefined
      );

      onModelAdded();
    } catch (error: any) {
      setError(error.message || "Failed to add model");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark-card p-4">
      <h2 className="text-lg font-semibold mb-4">Add Custom Model</h2>

      {error && (
        <div className="mb-4 p-2 bg-[rgb(30,10,10)] text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Model Name*</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="dark-input w-full p-2"
            placeholder="e.g., my-custom-model"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Model Path*</label>
          <input
            type="text"
            value={modelPath}
            onChange={(e) => setModelPath(e.target.value)}
            className="dark-input w-full p-2"
            placeholder="e.g., organization/model-name"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Token Cost*</label>
          <input
            type="number"
            value={tokenCost}
            onChange={(e) => setTokenCost(Number(e.target.value))}
            className="dark-input w-full p-2"
            min="0.1"
            step="0.1"
            required
          />
          <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
            Credits required per message (e.g., 1.0 = 1 credit per message)
          </p>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="dark-input w-full p-2"
            rows={2}
            placeholder="Brief description of the model"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Parameters</label>
          <input
            type="text"
            value={parameters}
            onChange={(e) => setParameters(e.target.value)}
            className="dark-input w-full p-2"
            placeholder="e.g., 7B, 13B (optional)"
          />
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            className={`${
              isLoading
                ? "bg-gray-600 cursor-not-allowed"
                : "dark-button-primary"
            } px-4 py-2 rounded`}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Model"}
          </button>
          <button
            type="button"
            className="dark-button-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
