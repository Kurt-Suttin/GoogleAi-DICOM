import React, { useState } from "react";
import { Buffer } from 'buffer';
import './App.css';

// Import Google Generative AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Generative AI client
const apiKey = process.env.REACT_APP_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize the model - Note: Using gemini-pro-vision for image processing
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Handle file selection and reading
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      // Create preview URL for display
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    } else {
      alert("Please upload a valid image file (e.g., jpg, png).");
    }
  };

  // Convert image file to required format for Gemini
  const fileToGenerativePart = async (file) => {
    const imageData = await file.arrayBuffer();
    return {
      inlineData: {
        data: Buffer.from(imageData).toString('base64'),
        mimeType: file.type
      }
    };
  };

  // Handle the submission to the AI model
  const handleSubmit = async () => {
    if (!imageFile) {
      alert("Please upload an image file.");
      return;
    }

    setIsLoading(true);
    try {
      // Convert image to required format
      const imagePart = await fileToGenerativePart(imageFile);

      // Prepare prompt parts
      const prompt = input || "What's in this image?";
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      setResponse(response.text());
    } catch (error) {
      console.error("Error with AI:", error);
      setResponse("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      // Clean up preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Gemini Vision Image Analysis</h1>
      
      <div className="mb-4">
        <textarea
          className="form-control"
          placeholder="Enter your question about the image (optional)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows="3"
        ></textarea>
      </div>

      <div className="mb-3">
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>

      {imagePreview && (
        <div className="mb-3 text-center">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="img-fluid" 
            style={{ maxHeight: '300px' }}
          />
        </div>
      )}

      <div className="text-center">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isLoading || !imageFile}
        >
          {isLoading ? "Analyzing..." : "Analyze Image"}
        </button>
      </div>

      {response && (
        <div className="alert alert-info mt-4">
          <h5>Analysis:</h5>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;