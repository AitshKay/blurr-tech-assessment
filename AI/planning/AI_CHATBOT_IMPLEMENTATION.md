# AI Chatbot Implementation

## Overview
This document outlines the implementation of the AI Chatbot feature that will allow users to query information about their tasks and projects using natural language.

## Technical Decisions

### 1. Architecture
```
┌─────────────┐    ┌───────────────┐    ┌─────────────────┐
│  Frontend   │───▶│  API Routes   │◀───│  AI Service    │
│ (React)     │◀───│  (Next.js)    │───▶│  (OpenAI API)  │
└─────────────┘    └───────────────┘    └─────────────────┘
                        │
                        ▼
                ┌───────────────┐
                │  Database     │
                │  (Prisma)     │
                └───────────────┘
```

### 2. Database Schema Additions
```prisma
model ChatSession {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  title     String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  messages  ChatMessage[]


  @@map("chat_sessions")
}

model ChatMessage {
  id        String   @id @default(cuid())
  sessionId String   @map("session_id")
  session   ChatSession @relation(fields: [sessionId], references: [id])
  role      String   // 'user' | 'assistant' | 'system'
  content   String
  createdAt DateTime @default(now()) @map("created_at")

  @@map("chat_messages")
}
```

### 3. Key Features

#### 3.1 Natural Language Queries
- Task status queries
- Project progress updates
- Employee availability
- Upcoming deadlines
- Workload distribution

#### 3.2 Smart Suggestions
- Task prioritization
- Resource allocation
- Timeline predictions
- Bottleneck identification

### 4. Implementation Details

#### 4.1 API Endpoints
```typescript
// Chat endpoints
GET    /api/ai/chat/sessions         // List chat sessions
POST   /api/ai/chat/sessions         // Create new session
GET    /api/ai/chat/sessions/:id     // Get session with messages
DELETE /api/ai/chat/sessions/:id     // Delete session

// Message endpoints
POST   /api/ai/chat/messages        // Send message and get response
```

#### 4.2 AI Service Integration
```typescript
// src/lib/ai/chat-service.ts
class AIChatService {
  private openai: OpenAIApi;
  
  constructor() {
    this.openai = new OpenAIApi(new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    }));
  }


  async processQuery(userId: string, query: string, context: ChatContext) {
    // 1. Get relevant data based on query
    const relevantData = await this.getRelevantData(userId, query, context);
    
    // 2. Construct system prompt with context
    const systemPrompt = this.buildSystemPrompt(context, relevantData);
    
    // 3. Call OpenAI API
    const response = await this.openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.7,
    });

    // 4. Process and return response
    return this.processAIResponse(response.data.choices[0].message.content);
  }

  private async getRelevantData(userId: string, query: string, context: ChatContext) {
    // Query database based on the user's query
    // Return relevant tasks, projects, employees, etc.
  }

  
  private buildSystemPrompt(context: ChatContext, data: any): string {
    // Build a detailed system prompt with context and data
  }
  
  private processAIResponse(response: string): ChatResponse {
    // Process and format the AI response
  }
}
```

#### 4.3 Context Management
```typescript
interface ChatContext {
  userId: string;
  currentProjectId?: string;
  recentTasks?: string[];
  userRole: UserRole;
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
}
```

### 5. UI Components

#### 5.1 Chat Interface
- Message list with different styling for user/assistant
- Typing indicators
- Message timestamps
- Suggestion chips for common queries

#### 5.2 Query Suggestions
- Predefined common queries
- Context-aware suggestions
- Quick action buttons

#### 5.3 Response Rendering
- Markdown support
- Data visualization for metrics
- Interactive elements (e.g., task links)
- Loading states

### 6. Security & Privacy
- Data access controls
- Input sanitization
- Rate limiting
- Sensitive data filtering

### 7. Performance Optimization
- Caching frequent queries
- Debounced input
- Lazy loading of message history
- Optimistic UI updates

## Next Steps
1. Set up OpenAI API integration
2. Implement chat session management
3. Create the chat UI components
4. Add context awareness
5. Implement data querying
6. Add response formatting
7. Write tests
8. Add monitoring and analytics

---
*This document will be updated as we implement the AI Chatbot feature.*
