# Projects & Tasks Implementation

## Overview
This document outlines the implementation of the Projects and Tasks management system, including the Kanban board and task assignment features.

## Technical Decisions

### 1. Database Schema (Prisma)
```prisma
model Project {
  id          String    @id @default(cuid())
  name        String
  description String?
  startDate   DateTime  @map("start_date")
  dueDate     DateTime? @map("due_date")
  status      ProjectStatus @default(PLANNING)
  priority    Priority  @default(MEDIUM)
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  tasks       Task[]
  createdBy   String    @map("created_by")
  createdByUser User    @relation(fields: [createdBy], references: [id])

  @@map("projects")
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(BACKLOG)
  priority    Priority  @default(MEDIUM)
  dueDate     DateTime? @map("due_date")
  projectId   String    @map("project_id")
  project     Project   @relation(fields: [projectId], references: [id])
  assigneeId  String?   @map("assignee_id")
  assignee    Employee? @relation(fields: [assigneeId], references: [id])
  createdBy   String    @map("created_by")
  createdByUser User    @relation(fields: [createdBy], references: [id])
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  comments    Comment[]

  @@map("tasks")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  taskId    String   @map("task_id")
  task      Task     @relation(fields: [taskId], references: [id])
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("comments")
}

enum ProjectStatus {
  PLANNING
  IN_PROGRESS
  ON_HOLD
  COMPLETED
  CANCELLED
}

enum TaskStatus {
  BACKLOG
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### 2. Key Features

#### 2.1 Project Management
- Create and manage projects
- Project dashboard with key metrics
- Filter and search projects
- Project timeline view

#### 2.2 Task Management
- Create and assign tasks
- Task status updates
- Task comments and activity log
- Due date tracking

#### 2.3 Kanban Board
- Drag-and-drop interface
- Filter by assignee, priority, etc.
- Quick task details
- Bulk actions

### 3. Implementation Details

#### 3.1 API Endpoints
```typescript
// Project endpoints
GET    /api/projects          // List projects
POST   /api/projects          // Create project
GET    /api/projects/:id      // Get project details
PUT    /api/projects/:id      // Update project
DELETE /api/projects/:id      // Delete project

// Task endpoints
GET    /api/tasks             // List tasks (with filters)
POST   /api/tasks             // Create task
GET    /api/tasks/:id         // Get task details
PUT    /api/tasks/:id         // Update task
DELETE /api/tasks/:id         // Delete task
POST   /api/tasks/:id/comment // Add comment

// Kanban endpoints
GET    /api/kanban/board     // Get board data
PUT    /api/kanban/tasks/:id/status // Update task status
```

#### 3.2 Task Status Update Logic
```typescript
async function updateTaskStatus(taskId: string, newStatus: TaskStatus, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) throw new Error('Task not found');
  if (task.status === newStatus) return task;

  // Check if user has permission to update this task
  const hasPermission = await checkTaskPermission(task, userId);
  if (!hasPermission) {
    throw new Error('Unauthorized to update this task');
  }

  // Update task status
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
    include: {
      assignee: {
        include: { user: true }
      },
      project: true
    }
  });

  // Log activity
  await createActivityLog({
    type: 'TASK_STATUS_UPDATE',
    taskId: updatedTask.id,
    projectId: updatedTask.projectId,
    userId,
    data: {
      from: task.status,
      to: newStatus
    }
  });

  return updatedTask;
}
```

### 4. UI Components

#### 4.1 Project List
- Card/grid view of projects
- Status indicators
- Progress bars
- Quick actions

#### 4.2 Task Form
- Rich text editor for description
- Assignee dropdown
- Due date picker
- Priority selector

#### 4.3 Kanban Board
- Draggable task cards
- Status columns
- Task preview on hover
- Quick edit actions

#### 4.4 Task Details
- Full task information
- Comment section
- Activity log
- File attachments

### 5. Real-time Updates
- WebSocket for real-time board updates
- Notifications for task assignments and updates
- Activity feed

### 6. Testing Strategy
- Unit tests for task status transitions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for Kanban board

### 7. Performance Considerations
- Pagination for task lists
- Virtual scrolling for Kanban columns
- Optimistic UI updates
- Caching strategies

## Next Steps
1. Implement project CRUD operations
2. Build task management features
3. Develop Kanban board UI
4. Add real-time updates
5. Implement activity logging
6. Write tests

---
*This document will be updated as we implement the Projects & Tasks section.*
