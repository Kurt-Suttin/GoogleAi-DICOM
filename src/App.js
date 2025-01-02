import React, { useState } from "react";
import { Buffer } from "buffer";
import "./App.css";

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
  const [showModal, setShowModal] = useState(false);

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
        data: Buffer.from(imageData).toString("base64"),
        mimeType: file.type,
      },
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
      setShowModal(true); // Show modal with response
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

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Image Analysis</h1>

      <div className="mb-4">
        <label htmlFor="questionOptions" className="form-label text-muted">
          Choose a suggested question or type your own:
        </label>
        <select
          id="questionOptions"
          className="form-select mb-2"
          onChange={(e) => setInput(e.target.value)}
          value={input}
        >
          <option value="">-- Select a suggested question --</option>
          <option value="What's this?">What's this?</option>
          <option value="What looks wrong in this image?">
            What looks wrong in this image?
          </option>
          <option value="Describe this image">Describe this image</option>
        </select>

        {input && (
          <textarea
            className="form-control"
            placeholder="Enter your question about the image (optional)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows="3"
          ></textarea>
        )}
      </div>

      <div className="mb-4">
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>

      {imagePreview && (
        <div className="mb-4 text-center">
          <img
            src={imagePreview}
            alt="Preview"
            className="img-fluid rounded shadow"
            style={{ maxHeight: "300px" }}
          />
        </div>
      )}

      <div className="text-center">
        <button
          className="btn btn-primary px-5 py-2"
          onClick={handleSubmit}
          disabled={isLoading || !imageFile}
        >
          {isLoading ? "Loading..." : "Analyze Image"}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Analysis Result</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>{response}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
