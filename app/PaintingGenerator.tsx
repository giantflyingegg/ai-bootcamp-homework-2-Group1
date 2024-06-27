"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";

const themes = ["Renaissance", "Impressionism", "Surrealism", "Abstract", "Pop Art"];

export default function PaintingGenerator() {
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageParams, setImageParams] = useState({
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  } = useChat({
    api: "/api/chat", // You'll need to create this API route
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleThemeSelect = (selectedTheme: string) => {
    setTheme(selectedTheme);
  };

  const generateDescription = async () => {
    if (!theme) return;
    await append({
      role: "user",
      content: `Generate a detailed description of a ${theme} style painting.`,
    });
  };

  const generateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: description, ...imageParams }),
      });
      const data = await response.json();
      setImageUrl(data.url);
    } catch (error) {
      console.error("Error generating image:", error);
    }
    setIsGeneratingImage(false);
  };

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      setDescription(messages[messages.length - 1].content);
    }
  }, [messages]);

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto py-24 px-4">
      <h1 className="text-2xl font-bold mb-4">Painting Generator</h1>
      
      <div className="mb-4">
        <h2 className="text-xl mb-2">Select a Theme:</h2>
        <div className="flex flex-wrap gap-2">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => handleThemeSelect(t)}
              className={`px-3 py-1 rounded ${
                theme === t ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generateDescription}
        disabled={!theme || isLoading}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Generate Painting Description
      </button>

      <div className="border p-4 mb-4 h-64 overflow-y-auto" ref={messagesContainerRef}>
        {messages.map((m) => (
          <div key={m.id} className={`mb-2 ${m.role === "user" ? "text-green-500" : "text-blue-500"}`}>
            <strong>{m.role === "user" ? "User: " : "AI: "}</strong>
            {m.content}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-xl mb-2">Image Generation Parameters:</h2>
        <div className="flex flex-col gap-2">
          <select
            value={imageParams.size}
            onChange={(e) => setImageParams({ ...imageParams, size: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="1024x1024">1024x1024</option>
            <option value="512x512">512x512</option>
            <option value="256x256">256x256</option>
          </select>
          <select
            value={imageParams.quality}
            onChange={(e) => setImageParams({ ...imageParams, quality: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="standard">Standard</option>
            <option value="hd">HD</option>
          </select>
          <select
            value={imageParams.style}
            onChange={(e) => setImageParams({ ...imageParams, style: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="vivid">Vivid</option>
            <option value="natural">Natural</option>
          </select>
        </div>
      </div>

      <button
        onClick={generateImage}
        disabled={!description || isGeneratingImage}
        className="bg-purple-500 text-white px-4 py-2 rounded mb-4"
      >
        Generate Image
      </button>

      {isGeneratingImage && <div className="text-center">Generating image...</div>}

      {imageUrl && (
        <div className="mt-4">
          <h2 className="text-xl mb-2">Generated Image:</h2>
          <img src={imageUrl} alt="Generated painting" className="w-full" />
        </div>
      )}
    </div>
  );
}