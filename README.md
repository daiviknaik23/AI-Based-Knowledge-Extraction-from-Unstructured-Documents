# 🧠 AI-Based Knowledge Extraction from Unstructured Documents

An end-to-end AI-powered web application that processes unstructured documents (PDFs, images, scanned files) using OCR, transforms them into embeddings, indexes them into a vector database, and uses Retrieval-Augmented Generation (RAG) to offer document summarization, contextual Q&A, citations, translation, and text-to-speech capabilities.

---

## ⚡ Core Features

*   **📊 Sleek Glassmorphism Dashboard:** Track your knowledge base statistics (total documents, vector chunks, storage, and status).
*   **📤 Smart Document Uploader:** Drag-and-drop file upload supporting `.pdf`, `.txt`, `.png`, and `.jpg` format files.
*   **🔍 Automatic OCR Processing:** Integrates Tesseract OCR for text extraction from scanned images and scanned PDFs.
*   **📖 Smart Summaries:** Instantly generate concise summaries, key takeaways, and action items from long documents.
*   **💬 Interactive Q&A (RAG):** Chat directly with your documents. Get precise answers based on retrieved context, complete with page citations.
*   **🗣️ Text-to-Speech (TTS):** Listen to your AI-generated summaries and responses using integrated text-to-speech audio.
*   **🌐 Multilingual Translation:** Translate summaries and answers to languages like Hindi, Kannada, French, and Spanish instantly.
*   **🌗 Adaptive Dark/Light Mode:** Responsive and modern UI styled dynamically to ensure high contrast and readability.

---

## 🛠️ Technology Stack & Tools Used

### **Frontend**
*   **React 18 & Vite:** Fast build tool and framework for single-page applications.
*   **Tailwind CSS & PostCSS:** Custom utility-first CSS configurations supporting dynamic theme switching.
*   **Framer Motion:** Smooth, premium micro-animations and page transitions.
*   **React Dropzone:** User-friendly file upload interaction.
*   **Lucide React:** Modern SVG iconography.
*   **Axios:** HTTP client for communication with backend APIs.

### **Backend**
*   **FastAPI:** High-performance, asynchronous Python web framework.
*   **Uvicorn:** Production ASGI web server.
*   **Pydantic & Pydantic-Settings:** Type validation and secure environment variable management.
*   **SlowAPI:** Rate limiter middleware to prevent spamming and excessive API consumption.

### **AI & RAG Engine**
*   **LangChain:** Standard framework for chains, retrievers, and prompt templates.
*   **ChromaDB:** Lightweight, high-performance vector database used to store and query document chunk embeddings.
*   **HuggingFace `sentence-transformers`:** Runs `all-MiniLM-L6-v2` locally to generate dense vector embeddings without incurring external API costs.
*   **Google Gemini API / OpenAI API:** Integrated LLMs for high-quality translation, summarization, and query reasoning.

### **Document Parsing & OCR**
*   **PyTesseract (Tesseract OCR):** Text extraction from images and scanned PDF documents.
*   **pdfplumber & PyPDF:** PDF parsing engines to extract text, structural information, and pages.
*   **Pillow (PIL):** Image pre-processing and loading for OCR tasks.

---

## 🏗️ Folder Structure

```text
GenAI_Project/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app initialization & routing
│   │   ├── routes/              # API router endpoints (upload, query, summarize, etc.)
│   │   ├── services/            # Core business logic (translation, TTS)
│   │   ├── models/              # Pydantic validation schemas
│   │   ├── vectorstore/         # ChromaDB interface and embedding initialization
│   │   ├── rag/                 # RAG pipeline logic and prompts
│   │   ├── ocr/                 # Tesseract OCR integrations
│   │   └── summarizer/          # Summarization prompts and handlers
│   ├── uploads/                 # Temporary directory for uploaded source files
│   ├── chroma_db/               # Vector database files
│   ├── requirements.txt         # Backend dependencies list
│   └── .env                     # Backend configuration (ignored in git)
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components (Sidebar, Layout, Header)
│   │   ├── pages/               # Page components (Dashboard, Summarize, Query, Upload)
│   │   ├── context/             # Global Theme Context state
│   │   ├── services/            # Axios API calls definition
│   │   └── App.jsx              # Routing & root application component
│   ├── package.json             # Frontend script definitions and dependencies
│   ├── tailwind.config.js       # Custom theme and color configurations
│   └── .env                     # Frontend environment pointing to backend
├── docker-compose.yml           # Multi-container orchestration config
├── Dockerfile.backend           # Containerization steps for python API
└── Dockerfile.frontend          # Containerization steps for Vite frontend
```

---

## 🚀 Step-by-Step Setup Guide

### **1. Prerequisites**
1. **Python (3.10+)**
2. **Node.js (18+)**
3. **Tesseract OCR (Required for OCR)**
   * **Windows:** Download the installer from the [UB-Mannheim Tesseract repository](https://github.com/UB-Mannheim/tesseract/wiki). Install it to `C:\Program Files\Tesseract-OCR\tesseract.exe`.
   * **Ubuntu/Debian:** `sudo apt-get install tesseract-ocr`
   * **macOS:** `brew install tesseract`

---

### **2. Backend Setup**
1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```powershell
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
5. Open `.env` and fill in your details:
   ```env
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your-gemini-api-key-here
   OPENAI_API_KEY=your-openai-api-key-here
   TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe   # Path to Tesseract binary
   ```
6. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

### **3. Frontend Setup**
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the frontend packages:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Confirm the API endpoint matches the backend port:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
5. Run the frontend development server:
   ```bash
   npm run dev
   ```
6. Open your browser and navigate to `http://localhost:5173`.

---

## 📤 Pushing to GitHub

Since your project is ready to go, follow these commands to publish it to a GitHub repository:

1. **Initialize Git Repository:**
   ```bash
   git init
   ```
2. **Stage All Files:** (Notice: sensitive files like `.env`, `venv/`, `node_modules/`, and databases are automatically excluded by your `.gitignore` configuration).
   ```bash
   git add .
   ```
3. **Commit the Changes:**
   ```bash
   git commit -m "Initial commit: AI-Based Knowledge Extraction app"
   ```
4. **Set Main Branch and Add Remote Link:**
   Create an empty repository on GitHub, then link it (replace with your repository's URL):
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   ```
5. **Push Code:**
   ```bash
   git push -u origin main
   ```

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to modify, distribute, and build upon this project for both commercial and personal use.
