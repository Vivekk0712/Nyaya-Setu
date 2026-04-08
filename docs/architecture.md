# 🏛️ System Architecture: Nyaya-Setu

This document outlines the technical architecture, multi-agent workflow, and data infrastructure for **Nyaya-Setu**, an autonomous legal defense system. 

The architecture is designed to be decoupled, low-latency, and highly scalable, utilizing open-source frontend/backend frameworks combined with enterprise-grade vector storage and state-of-the-art AI reasoning.

---

## 1. High-Level Architecture Diagram

```text
       [ User (Web / Mobile Browser) ]
                  |
                  | (1) Voice / Text Input (Local Language)
                  v
+---------------------------------------------------+
|                 FRONTEND LAYER                    |
|           React.js (Vite) + Tailwind CSS          |
|  (Handles UI, Voice-to-Text translation logic)    |
+---------------------------------------------------+
                  |
                  | (2) JSON API Payload
                  v
+---------------------------------------------------+
|                  BACKEND LAYER                    |
|           FastAPI (Python Async Router)           |
|                                                   |
|      +-------------------------------------+      |
|      |   MULTI-AGENT ORCHESTRATOR          |      |
|      |   > Interpreter Agent (Intake)      |      |
|      |   > Filing Agent (Drafting)         |      |
|      |   > Advisory Agent (Follow-ups)     |      |
|      +-------------------------------------+      |
+---------------------------------------------------+
        |                 |                  |
   (3)  |            (4)  |             (5)  |
        v                 v                  v
+---------------+ +----------------+ +------------------+
| DATA LAYER    | | AI ENGINE      | | EXTERNAL APIs    |
| Supabase      | | Gemini 3.1 Pro | | - DigiLocker API |
| (pgvector)    | | (LLM endpoint) | |   (KYC/Identity) |
| (Legal RAG)   | |                | | - SMTP/Email API |
+---------------+ +----------------+ +------------------+
                                             |
      (6) Auto-Triggered Nudge (After 7 Days)|
                                             v
                             [ Local Authorities / SHO ]
```

---

## 2. Component Breakdown

### A. Frontend (Client Layer)
* **Framework:** React.js initialized with Vite for rapid compilation.
* **Styling:** Tailwind CSS for a responsive, accessible interface tailored for mobile users (as most Tier-2/3 citizens access the web via phones).
* **Responsibilities:** Captures user incident reports (text or audio), manages authentication states, and displays the generated PDF legal drafts for user review.

### B. Backend (Application & Routing Layer)
* **Framework:** FastAPI (Python).
* **Why FastAPI?** Native async support makes it perfect for handling multiple simultaneous LLM API calls and database queries without blocking the main thread.
* **Responsibilities:** Serves as the API gateway, handles CORS, orchestrates the multi-agent logic, and compiles the final AI output into a downloadable PDF (using `reportlab` or `pdfkit`).

### C. Data & Vector Storage Layer
* **Database:** Supabase with the `pgvector` extension.
* **Schema:** * `users_table`: Stores standard user sessions.
  * `cases_table`: Tracks generated FIRs, timestamps, and follow-up statuses.
  * `legal_embeddings`: The pgvector table storing chunked text and 1536-dimensional embeddings of the Bharatiya Nyaya Sanhita (BNS) and consumer protection gazettes.

### D. AI & External Integrations
* **Inference Core:** **Gemini 3.1 Pro**. Handles complex legal reasoning, multilingual translation, and formal document generation with massive context windows to prevent hallucinations.
* **Identity Protocol:** **DigiLocker API**. Securely fetches the user's Aadhaar-linked identity to populate the legal drafts with verified, legally binding personal details.

---

## 3. The Multi-Agent Workflow

Instead of a monolithic prompt, the system routes tasks through three distinct AI agents:

### Agent 1: The Interpreter Agent (Intake & Translation)
* **Trigger:** User submits an incident in broken, informal language (e.g., "My boss didn't pay me and locked me out").
* **Action:** Embeds the user query, queries Supabase pgvector for relevant BNS/Labor laws, and passes the context to Gemini 3.1 Pro.
* **Output:** Returns a translated, simple summary to the user: *"This violates Section X of the BNS. Shall I draft a formal complaint?"*

### Agent 2: The Filing Agent (Execution)
* **Trigger:** User approves the draft creation.
* **Action:** 1. Calls DigiLocker API to fetch exact legal name and address.
  2. Prompts Gemini 3.1 Pro with strict system instructions to act as an Indian legal drafter.
  3. Maps the retrieved laws and user identity into a highly structured formal letter/FIR format.
* **Output:** Generates a complete PDF, leaving placeholders only for physical or digital signatures.

### Agent 3: The Advisory Agent (Proactive Accountability)
* **Trigger:** A cron job/scheduler running on the FastAPI server checks the `cases_table` daily.
* **Action:** If a case is marked as "Filed" but 7 days have passed without the user clicking "Resolved", the agent wakes up.
* **Output:** Autonomously drafts a follow-up "nudge" email addressed to higher authorities (e.g., Superintendent of Police), citing the original filing date and mandating a response.

---

## 4. RAG (Retrieval-Augmented Generation) Pipeline
1. **Ingestion:** Official Indian legal PDFs are parsed, split into 500-1000 token chunks using LangChain, and embedded using an embedding model.
2. **Storage:** Chunks and their vectors are pushed to Supabase pgvector.
3. **Retrieval:** During Agent 1's execution, a similarity search (`cosine distance`) retrieves the top 3 most relevant legal clauses to ground the Gemini model in actual law, entirely preventing legal hallucination.

## 5. Security & Compliance
* No sensitive user data (Aadhaar numbers) is permanently stored in the local database; it is fetched ephemerally via the DigiLocker API for document generation only.
* Vector embeddings contain only public, open-source legal text, ensuring no privacy leakage in the RAG pipeline.
```

***

Drop this into your project alongside your `README.md`. When the judges look at your repo, this document will scream "Senior Engineer." Let's go win this thing!