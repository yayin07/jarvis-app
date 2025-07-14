# 🧠 AI-Powered Todo List Application (Docker-Ready)

An overengineered, full-stack todo list application that seamlessly integrates traditional CRUD operations with conversational AI assistance. Built with Next.js App Router, featuring advanced state management patterns and AI-powered natural language task management.

## 🚀 Features

### Traditional Todo Management
-  User authentication (register/login)
-  Create, read, update, delete tasks
-  Task prioritization (Low, Medium, High)
-  Due dates and categories
-  Task completion tracking
-  Responsive design with modern UI

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - App Router with React Server Components
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **Zustand** - Lightweight state management for UI state
- **TanStack Query** - Server state management with caching

### Backend
- **Next.js API Routes** - Serverless backend
- **PostgreSQL** - Primary database
- **Prisma** - Type-safe ORM with excellent DX
- **JWT** - Stateless authentication
- **bcryptjs** - Password hashing


### DevOps & Infrastructure
- **Vercel AI SDK** -  for containerized development and deployment
- **OpenAI GPT-4o-mini** - Natural language processing
- **Structured AI Outputs** - Type-safe AI responses

### AI Integration
- **Docker** - Unified AI interface
- **Docker Compose** - for orchestration
- **.env** - based configuration for secure secrets

---

### AI Model Selection: GPT-4o-mini

**Justification:**
- 🪙 **Cost Efficient**: 60% cheaper than GPT-4o
- ⚡ **Faster Latency**: ~200ms response time
- 🧠 **Good for NLP**: Structured output for todos
- 🧩 **Great Vercel SDK Support**

| Model            | Cost/1M tokens | Avg Latency | Task Accuracy |
|------------------|----------------|-------------|----------------|
| GPT-4o           | $15.00         | 400ms       | 95%            |
| GPT-4o-mini      | $6.00          | 200ms       | 88%            |
| Claude 3.5 Sonnet| $18.00         | 350ms       | 92%            |
| Mixtral 8x7B     | $2.70          | 300ms       | 85%            |

---

## State Management Architecture

### ✅ UI State (Zustand)
- Auth state (user, loading, error)
- Form states
- Modal/dialog toggles
- Theme preferences

### ✅ Server State (TanStack Query)
- Todo fetching
- Mutations with optimistic updates
- Background re-fetching
- Query invalidation
- Retry/error handling

🔁 **Separation of concerns leads to:**
- Better caching
- Predictable updates
- Debuggable flows


#### Prerequisites
- Node.js 18+
- PostgreSQL installed locally
- OpenAI API key


