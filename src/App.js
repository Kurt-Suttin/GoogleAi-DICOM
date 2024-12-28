import React, { useState } from "react";

// Import Google Generative AI SDK
const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

// Initialize the Generative AI client
const apiKey = process.env.REACT_APP_API_KEY; // Use environment variable in production
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize the model configuration
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 0.2, // Controls creativity in AI responses
  topP: 0.95, // Controls diversity by nucleus sampling
  topK: 40, // Limits the number of highest probability tokens
  maxOutputTokens: 8192, // Max tokens in AI's response
  responseMimeType: "text/plain", // MIME type for the response
};

function App() {
  // State variables for input, response, loading status, and file content
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [imageContent, setImageContent] = useState(""); // For image content

  // Handle file selection and reading
  const handleFileUpload = (event) => {
    const file = event.target.filesaf[0]; // Get the selected file
    if (file) {
      const reader = new FileReader(); // Initialize file reader
      if (file.type.startsWith("image/")) {
        // For image files (jpg, png)
        reader.onload = (e) => {
          setImageContent(e.target.result); // Set the image content (base64 string)
        };
        reader.readAsDataURL(file); // Read as base64
      } else {
        // For text files
        reader.onload = (e) => {
          setFileContent(e.target.result); // Set the file content to state
        };
        reader.readAsText(file); // Read as text
      }
    }
  };

  // Handle the submission to the AI model
  const handleSubmit = async () => {
    if (!input && !fileContent && !imageContent) {
      alert("Please provide input or upload a file.");
      return;
    }

    setIsLoading(true); // Show loading state
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      // Combine input text, file content, and image content
      let prompt = `${input}\n\nFile Content:\n${fileContent}`;
      if (imageContent) {
        // If an image is provided, append it as base64 encoded string
        prompt += `\n\nImage Content:\n[Image Attached as Base64] ${imageContent}`;
      }

      // Send the combined prompt to the AI
      const result = await chatSession.sendMessage(prompt);
      setResponse(result.response.text()); // Display AI response
    } catch (error) {
      console.error("Error with AI:", error);
      setResponse("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Google AI DICOM Feedback</h1>

      {/* Textarea for user input */}
      <textarea
        placeholder="Enter your input here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows="6"
        cols="50"
        style={{ margin: "20px 0", padding: "10px", fontSize: "16px" }}
      />
      <br />

      {/* File input for uploading a file */}
      <input
        type="file"
        accept=".txt,.md,.json,image/*" // Accepting images as well
        onChange={handleFileUpload}
        style={{ marginBottom: "20px" }}
      />
      <br />

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
        disabled={isLoading} // Disable button while loading
      >
        {isLoading ? "Processing..." : "Get Feedback"}
      </button>

      {/* Display AI response */}
      {response && (
        <div style={{ marginTop: "30px", border: "solid black 1px", padding: "10px" }}>
          <h2>Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
