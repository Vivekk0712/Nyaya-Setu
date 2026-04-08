### Project: "Nyaya-Setu: The Autonomous Public Defender"
**The Elevator Pitch:** An autonomous, multi-agent legal defense system that translates complex government legalese into simple dialects, drafts formal legal filings (FIRs/Consumer Complaints) mapped to the new BNS laws, and proactively nudges government departments until justice is served.

---

### The Architecture: A 3-Agent Loop (Powered by Gemini + FastAPI)

#### Agent 1: The Interpreter & Intake Agent
* **What it does:** The user uploads a scary-looking legal notice (like a land acquisition notice) OR records a voice note saying, "My landlord locked me out and stole my deposit." 
* **The Tech:** * The FastAPI backend receives the input.
    * It queries **Supabase pgvector** (which holds the new Bharatiya Nyaya Sanhita - BNS and Consumer Protection Act PDFs) using RAG to find the exact laws broken.
    * The Agent replies in the user's local language (e.g., Hindi): *"what your landlord did is a violation of BNS Section X (wrongful restraint). You have the right to file a police complaint. Should I draft it for you?"*

#### Agent 2: The Drafting & Filing Agent
* **What it does:** If the user clicks "Yes," this agent takes over to eliminate the "Legal Debt" of hiring a lawyer.
* **The Tech:**
    * It simulates pinging a **Mock DigiLocker API** to fetch the user's verified identity (Name, Age, Address).
    * It takes the legal sections retrieved by Agent 1 and autonomously generates a highly formal, perfectly formatted FIR or Legal Notice PDF.
    * It presents the PDF on your React Vite frontend, ready to be e-signed and sent to the local Station House Officer (SHO) or E-Courts portal.

#### Agent 3: The Proactive Advisory Agent (The "Nudge" Engine)
* **What it does:** This is the killer feature. Justice is slow, so the AI acts as a relentless advocate. 
* **The Tech:**
    * Once the mock complaint is "filed," the system starts a timer.
    * If 7 days pass with no action from the authorities, the Advisory Agent autonomously drafts and sends a simulated follow-up email to the higher-ups (e.g., the Superintendent of Police), citing the original complaint number and the legal mandate for a timely response. 
    * On the frontend dashboard, the user sees a timeline: *Drafted -> Filed -> Follow-up Nudge Sent.*

---

### The Lightning-Fast Open-Source Stack
* **Frontend:** React (Vite) + Tailwind CSS (Build a sleek dashboard showing the chat on the left and the generated legal PDF on the right).
* **Backend:** FastAPI (Python) to route requests between the three agents.
* **AI Inference:** Gemini 2.5 pro API for instant agentic reasoning.
* **Vector Database:** Supabase pgvector (document retrieval of the BNS laws and sections etc).
* **Document Generation:** `reportlab` or `pdfkit` in Python to instantly convert the AI's drafted text into a downloadable PDF.

