import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // Load the API key from electron store when the component mounts
    window.electron.getOpenAIKey().then((key) => setApiKey(key || ""));
  }, []);

  const handleSave = () => {
    // Save the API key using electron store
    window.electron.setOpenAIKey(apiKey);
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <div className="container mx-auto p-4 mt-2">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="mb-4">
        <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
          OpenAI API Key
        </label>
        <div className="flex items-center">
          <div className="flex-grow">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
              placeholder="Enter your OpenAI API key"
            />
          </div>
          <button
            type="button"
            onClick={toggleApiKeyVisibility}
            className="ml-2 p-2 focus:outline-none"
          >
            {showApiKey ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      <Button onClick={handleSave}>Save</Button>
    </div>
  );
};

export default Settings;
