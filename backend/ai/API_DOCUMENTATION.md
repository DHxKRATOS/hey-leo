# LEO AI Backend - Complete Guide

Welcome! This guide explains how our AI-powered chatbot backend works in simple terms. Think of this as the "brain" behind your smart digital business card that can answer questions about you or your business.

---

## 🎯 What Does This Backend Do?

Imagine you have a smart assistant that:
1. **Learns** about you from documents, websites, and information you provide
2. **Remembers** everything you teach it
3. **Answers** questions visitors ask about you
4. **Gets smarter** over time by learning from conversations

That's exactly what this backend does!

---

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [How It Works (Simple Explanation)](#how-it-works-simple-explanation)
- [All Available APIs](#all-available-apis)
  - [1. Chat API](#1-chat-api---talk-to-your-ai-assistant)
  - [2. Documents API](#2-documents-api---teach-from-files)
  - [3. Web Scraper API](#3-web-scraper-api---learn-from-websites)
  - [4. FAQ API](#4-faq-api---add-question--answer-pairs)
  - [5. Additional Text API](#5-additional-text-api---add-custom-information)
  - [6. Bio Generator API](#6-bio-generator-api---create-professional-bios)
  - [7. Analytics API](#7-analytics-api---track-performance)
  - [8. Examples API](#8-examples-api---suggest-questions)
  - [9. Cache API](#9-cache-api---clear-memory)
- [Understanding Key Concepts](#understanding-key-concepts)
- [Technical Details](#technical-details)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- OpenAI API key
- Qdrant database (cloud or local)

### Installation

```bash
# Navigate to the backend folder
cd backend/ai

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (create a .env file)
cp .env.example .env
# Edit .env with your API keys

# Run the server
uvicorn app.main:app --reload
```

The server will start at `http://localhost:8000`

---

## 🧠 How It Works (Simple Explanation)

### The Learning Process

Think of it like teaching a student:

1. **You provide information** (documents, websites, FAQs)
2. **The system reads and understands** the content
3. **It breaks information into small chunks** (like flashcards)
4. **Each chunk gets a "fingerprint"** (called an embedding)
5. **Everything is stored in a smart database** (Qdrant)

### The Answering Process

When someone asks a question:

1. **Question comes in** → "Who is John Doe?"
2. **System checks if it's a greeting** → If yes, responds instantly
3. **If not, it searches the database** → Finds relevant information
4. **AI reads the information** → Understands the context
5. **Generates a smart answer** → Sends response back

### The Magic Behind It

We use something called **Hybrid Search**:
- **Semantic Search**: Understands meaning (like "CEO" and "founder" are similar)
- **Keyword Search**: Finds exact matches (like names)
- **RRF Fusion**: Combines both for best results

---

## 📡 All Available APIs

### 1. Chat API - Talk to Your AI Assistant

**What it does**: This is the main API that answers questions about you or your business.

**Endpoint**: `POST /api/chat/query`

**How it works**:
1. Receives a question from a visitor
2. Checks if it's a simple greeting (like "hi" or "hello")
   - If yes: Responds immediately with a friendly greeting
   - If no: Searches your knowledge base and generates an answer
3. Returns the answer with confidence score

**Example Request**:
```json
{
  "query": "Who is the founder of the company?",
  "user_id": "7",
  "card_id": "25",
  "visitor_id": "John Smith",
  "role": "visitor"
}
```

**Example Response**:
```json
{
  "message_id": "abc-123",
  "query": "Who is the founder of the company?",
  "answer": "The founder is Nishant Contractor, who co-founded Third Rock Techkno in 2010.",
  "sources": [
    {
      "text": "Nishant Contractor co-founded Third Rock Techkno...",
      "source_type": "document",
      "score": 0.89
    }
  ],
  "confidence": 0.89,
  "chat_session_id": "session-456"
}
```

**What the fields mean**:
- `query`: The question that was asked
- `answer`: The AI-generated response
- `sources`: Where the information came from
- `confidence`: How sure the AI is (0.0 = not sure, 1.0 = very sure)
- `chat_session_id`: Tracks the conversation

**Special Features**:
- ✅ **Instant Greetings**: Responds to "hi", "hello", "how are you" instantly
- ✅ **Smart Search**: Uses hybrid search for best results
- ✅ **Confidence Filtering**: Only shows answers it's confident about
- ✅ **Conversation Memory**: Remembers the chat session

---

### 2. Documents API - Teach From Files

**What it does**: Upload PDF, Word, or text files to teach your AI assistant.

#### Upload a Document

**Endpoint**: `POST /api/documents/upload`

**How it works**:
1. You upload a file (PDF, DOCX, TXT)
2. System extracts all text from the file
3. Breaks it into small, manageable chunks
4. Stores each chunk in the database
5. Now your AI can answer questions from this document!

**Example Request** (using curl):
```bash
curl -X POST "http://localhost:8000/api/documents/upload" \
  -F "file=@resume.pdf" \
  -F "user_id=7" \
  -F "card_id=25"
```

**Example Response**:
```json
{
  "message": "Document uploaded successfully",
  "document_id": "doc-789",
  "chunks_created": 15,
  "filename": "resume.pdf"
}
```

**What happens**:
- Your resume is read
- Split into 15 pieces (chunks)
- Each piece is stored with a unique ID
- AI can now answer questions about your resume

#### List All Documents

**Endpoint**: `GET /api/documents/list?user_id=7&card_id=25`

**Returns**: All documents you've uploaded

#### Delete a Document

**Endpoint**: `DELETE /api/documents/delete?user_id=7&card_id=25&document_id=doc-789`

**What it does**: Removes the document and all its chunks from the database

---

### 3. Web Scraper API - Learn From Websites

**What it does**: Give it a website URL, and it will read and learn from that website.

#### Scrape a Website

**Endpoint**: `POST /api/scraper/scrape`

**How it works**:
1. You provide a website URL
2. System visits the website
3. Extracts all text content
4. Cleans and processes the text
5. Stores it in the database
6. AI can now answer questions about that website!

**Example Request**:
```json
{
  "url": "https://example.com/about-us",
  "user_id": "7",
  "card_id": "25"
}
```

**Example Response**:
```json
{
  "message": "URL scraped successfully",
  "url": "https://example.com/about-us",
  "chunks_created": 8
}
```

**Use Cases**:
- Your company's About Us page
- Your LinkedIn profile
- Your portfolio website
- Blog posts about you
- News articles featuring you

#### List Scraped URLs

**Endpoint**: `GET /api/scraper/list?user_id=7&card_id=25`

**Returns**: All websites you've scraped

#### Delete Scraped Content

**Endpoint**: `DELETE /api/scraper/delete?user_id=7&card_id=25&url=https://example.com`

---

### 4. FAQ API - Add Question & Answer Pairs

**What it does**: Add specific questions and answers that you want the AI to know exactly.

#### Add an FAQ

**Endpoint**: `POST /api/faq/add`

**How it works**:
1. You provide a question and its answer
2. System stores them together
3. When someone asks a similar question, AI uses your exact answer

**Example Request**:
```json
{
  "question": "What are your business hours?",
  "answer": "We're open Monday to Friday, 9 AM to 6 PM EST.",
  "user_id": "7",
  "card_id": "25"
}
```

**Example Response**:
```json
{
  "message": "FAQ added successfully",
  "faq_id": "faq-123"
}
```

**Why use FAQs**:
- ✅ Guarantee exact answers to common questions
- ✅ Control the response for sensitive topics
- ✅ Provide specific details (prices, hours, contact info)

#### List All FAQs

**Endpoint**: `GET /api/faq/list?user_id=7&card_id=25`

#### Delete an FAQ

**Endpoint**: `DELETE /api/faq/delete?user_id=7&card_id=25&faq_id=faq-123`

---

### 5. Additional Text API - Add Custom Information

**What it does**: Add any text information that doesn't fit into documents, websites, or FAQs.

#### Add Additional Text

**Endpoint**: `POST /api/additional/add`

**How it works**:
1. You provide custom text
2. If you already have additional text, it **merges** with the old text (doesn't duplicate)
3. Stores the combined text
4. AI can now use this information

**Example Request**:
```json
{
  "text": "I specialize in AI and machine learning. I've worked on 50+ projects and have 10 years of experience.",
  "user_id": "7",
  "card_id": "25"
}
```

**Example Response**:
```json
{
  "message": "Additional text added successfully (merged with existing)",
  "chunks_created": 1
}
```

**Use Cases**:
- Personal achievements
- Skills and expertise
- Awards and recognition
- Hobbies and interests
- Any information you want to share

**Smart Merging**:
If you add more text later, it combines with your existing text instead of creating duplicates!

#### List Additional Text

**Endpoint**: `GET /api/additional/list?user_id=7&card_id=25`

#### Delete Additional Text

**Endpoint**: `DELETE /api/additional/delete?user_id=7&card_id=25`

---

### 6. Bio Generator API - Create Professional Bios

**What it does**: Automatically generates a professional bio based on your information.

**Endpoint**: `POST /api/bio/generate`

**How it works**:
1. You provide basic information (name, job title, company)
2. Optionally add extra details
3. AI writes a professional bio for you
4. Bio is automatically stored in your knowledge base

**Example Request**:
```json
{
  "user_id": "7",
  "card_id": "25",
  "first_name": "John",
  "last_name": "Doe",
  "job_title": "Senior Software Engineer",
  "company_name": "Tech Corp",
  "email_id": "john@example.com",
  "phone_number": "+1-555-0100",
  "urls": ["https://linkedin.com/in/johndoe"],
  "text": "Passionate about AI and cloud computing"
}
```

**Example Response**:
```json
{
  "bio": "John Doe is a Senior Software Engineer at Tech Corp, where he specializes in AI and cloud computing. With a passion for innovative technology solutions, John brings extensive expertise to every project. Connect with him at john@example.com or +1-555-0100.",
  "message": "Bio generated and stored successfully"
}
```

**What happens next**:
- The generated bio is automatically added to your knowledge base
- Your AI can now use this bio to introduce you
- Visitors asking "Who are you?" will get this professional introduction

---

### 7. Analytics API - Track Performance

**What it does**: Shows you how well your AI is performing and what questions people are asking.

#### Get Basic Metrics

**Endpoint**: `GET /api/analytics/metrics?user_id=7&card_id=25`

**Returns**:
```json
{
  "total_conversations": 150,
  "total_messages": 450,
  "average_confidence": 0.85,
  "response_quality": "excellent",
  "frequent_questions": [
    {
      "question": "What services do you offer?",
      "count": 25
    },
    {
      "question": "How can I contact you?",
      "count": 18
    }
  ]
}
```

**What the metrics mean**:
- `total_conversations`: Number of unique chat sessions
- `total_messages`: Total questions answered
- `average_confidence`: How confident the AI is on average (0.85 = 85% confident)
- `response_quality`: Overall quality rating
  - `excellent`: 80%+ confidence
  - `good`: 60-80% confidence
  - `fair`: 40-60% confidence
  - `poor`: Below 40% confidence
- `frequent_questions`: Most common questions asked

#### Get User-Wide Analytics

**Endpoint**: `GET /api/analytics/user-metrics?user_id=7`

**Returns**: Analytics across all your cards (if you have multiple)

#### Update Answer Accuracy

**Endpoint**: `PATCH /api/analytics/messages/{message_id}/accuracy`

**What it does**: Mark an answer as accurate or inaccurate to help improve the AI

**Example Request**:
```json
{
  "is_accurate": true
}
```

**Why this matters**: 
- Helps the AI learn which answers are good
- Improves future responses
- Identifies areas where more information is needed

#### Search Conversations

**Endpoint**: `GET /api/analytics/search-conversations?user_id=7&card_id=25&query=pricing`

**What it does**: Find all conversations that mentioned a specific topic

**Use Cases**:
- See what people ask about pricing
- Find conversations about specific products
- Identify common concerns or questions

#### Improve an Answer

**Endpoint**: `POST /api/analytics/improve-answer`

**What it does**: Provide a better answer for a question

**Example Request**:
```json
{
  "user_id": "7",
  "card_id": "25",
  "query": "What are your prices?",
  "improved_answer": "Our basic package starts at $99/month, professional at $199/month, and enterprise pricing is custom. Contact us for details."
}
```

**What happens**:
- The improved answer is stored
- Next time someone asks a similar question, they get your improved answer
- No need to wait for AI to generate a response

---

### 8. Examples API - Suggest Questions

**What it does**: Automatically generates example questions visitors can ask.

#### Generate Example Questions

**Endpoint**: `GET /api/examples/generate?user_id=7&card_id=25`

**How it works**:
1. Analyzes all your stored information
2. Uses AI to generate relevant questions
3. Returns 3-5 example questions

**Example Response**:
```json
{
  "questions": [
    "What services does the company offer?",
    "Who is the founder?",
    "How can I get in touch?",
    "What industries do you specialize in?"
  ],
  "total_documents": 25,
  "message": "Generated 4 example questions"
}
```

**Use Cases**:
- Show visitors what they can ask
- Help people get started with the chatbot
- Highlight key information

#### Get Quick Examples

**Endpoint**: `GET /api/examples/quick?user_id=7&card_id=25`

**What it does**: Returns pre-generated examples instantly (faster than generating new ones)

---

### 9. Cache API - Clear Memory

**What it does**: Clears the system's temporary memory to free up space.

**Endpoint**: `POST /api/cache/clear`

**How it works**:
1. System stores recent responses in memory for speed
2. Sometimes you want to clear this to see fresh results
3. This API clears all cached responses

**Example Response**:
```json
{
  "message": "Cache cleared successfully",
  "cleared_items": 150
}
```

**When to use**:
- After updating a lot of information
- When testing changes
- If responses seem outdated

---

## 🔑 Understanding Key Concepts

### User ID & Card ID

- **User ID**: Your unique identifier (like your account number)
- **Card ID**: Each digital business card has its own ID
- You can have multiple cards (personal, business, etc.)
- Each card has its own knowledge base

### Namespace

Think of namespace as folders:
- `null` or empty: Default folder (everyone sees this)
- `"private"`: Private folder (only you see this)
- `"team-sales"`: Team folder (only sales team sees this)

### Confidence Score

A number from 0.0 to 1.0 that shows how sure the AI is:
- **0.9-1.0**: Very confident (excellent answer)
- **0.7-0.9**: Confident (good answer)
- **0.5-0.7**: Somewhat confident (okay answer)
- **Below 0.5**: Not confident (might not be accurate)

### Sources

Every answer includes sources showing where the information came from:
- **document**: From an uploaded file
- **web**: From a scraped website
- **faq**: From an FAQ you added
- **additional**: From additional text you provided

### Chat Session

A conversation between a visitor and your AI:
- Each session has a unique ID
- Tracks the entire conversation
- Helps with analytics and improvements

### Visitor ID vs Role

- **Visitor ID**: Who is asking (can be "Anonymous" or a name)
- **Role**: 
  - `"visitor"`: Real visitor (conversation is saved)
  - `"admin"`: You testing (conversation is NOT saved)

---

## 🔧 Technical Details

### Architecture

```
User Request
    ↓
FastAPI Server (Python)
    ↓
┌─────────────────────────────────┐
│  Greeting Detection             │ → Instant response for "hi", "hello"
│  (No AI needed)                 │
└─────────────────────────────────┘
    ↓ (if not greeting)
┌─────────────────────────────────┐
│  Hybrid Search                  │
│  - Dense Search (Semantic)      │ → Understands meaning
│  - Sparse Search (Keywords)     │ → Finds exact matches
│  - RRF Fusion                   │ → Combines both
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Qdrant Vector Database         │ → Stores all information
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  OpenAI GPT-4                   │ → Generates smart answers
└─────────────────────────────────┘
    ↓
Response to User
```

### Technologies Used

- **FastAPI**: Web framework (handles API requests)
- **OpenAI**: AI model for understanding and generating text
- **Qdrant**: Vector database (stores information smartly)
- **Python**: Programming language
- **Uvicorn**: Web server

### Performance

- **Greeting Response**: < 50ms (instant)
- **Regular Query**: 1-3 seconds
- **Document Upload**: 5-30 seconds (depends on size)
- **Web Scraping**: 3-10 seconds (depends on website)

### Costs (Approximate)

- **Chat Query**: $0.0001 - $0.001 per query
- **Document Upload**: $0.001 - $0.01 per document
- **Web Scraping**: $0.001 - $0.005 per page
- **Bio Generation**: $0.002 per bio

---

## 🎓 Common Workflows

### Setting Up a New Card

1. **Generate a bio** (`/api/bio/generate`)
2. **Upload your resume** (`/api/documents/upload`)
3. **Scrape your LinkedIn** (`/api/scraper/scrape`)
4. **Add FAQs** for common questions (`/api/faq/add`)
5. **Test with chat** (`/api/chat/query`)
6. **Generate examples** (`/api/examples/generate`)

### Improving Responses

1. **Check analytics** (`/api/analytics/metrics`)
2. **Find low-confidence answers** (confidence < 0.7)
3. **Add more information** (documents, FAQs, additional text)
4. **Provide improved answers** (`/api/analytics/improve-answer`)
5. **Test again** (`/api/chat/query`)

### Regular Maintenance

1. **Review frequent questions** weekly
2. **Update FAQs** for new common questions
3. **Check confidence scores** monthly
4. **Clear cache** after major updates
5. **Update bio** when job changes

---

## 🆘 Troubleshooting

### "I don't have enough information" Response

**Problem**: AI can't find relevant information

**Solutions**:
1. Add more documents/information
2. Check if namespace is correct
3. Add specific FAQ for that question
4. Lower confidence threshold

### Low Confidence Scores

**Problem**: Answers have confidence < 0.6

**Solutions**:
1. Add more detailed information
2. Use FAQs for specific questions
3. Improve answer quality with `/improve-answer`
4. Add additional text with more context

### Slow Response Times

**Problem**: Queries take > 5 seconds

**Solutions**:
1. Check internet connection
2. Reduce number of documents
3. Clear cache
4. Check OpenAI API status

---

## 📞 Support

For technical issues or questions:
1. Check the logs in `backend/ai/logs/`
2. Review this documentation
3. Contact your development team

---

## 🔐 Security Notes

- Never share your OpenAI API key
- Keep your `.env` file private
- Use `role: "admin"` for testing (conversations won't be saved)
- Use `role: "visitor"` for real users (conversations are saved)
- Regularly review stored conversations for sensitive information

---

## 📝 Version

- **Version**: 0.1.0
- **Last Updated**: December 2025
- **Framework**: FastAPI
- **Python Version**: 3.8+

---

**Made with ❤️ for LEO AI**
