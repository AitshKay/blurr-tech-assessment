import { Task, Status } from "@prisma/client";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/modal";
import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  defaultDropAnimation,
  useSensor,
  useSensors,
  useDroppable
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  onTaskCreated?: () => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

interface ColumnType {
  id: Status;
  label: string;
}

// Sortable item component
const SortableItem = ({ task, onTaskUpdated, onTaskDeleted }: { 
  task: Task; 
  onTaskUpdated?: () => void; 
  onTaskDeleted?: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div 
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 h-full w-6 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="pl-6">
        <TaskCard 
          task={task} 
          onTaskUpdated={onTaskUpdated} 
          onTaskDeleted={onTaskDeleted} 
        />
      </div>
    </div>
  );
};

// Column component
const Column = ({ 
  id, 
  label, 
  tasks, 
  onAddTask, 
  onTaskUpdated, 
  onTaskDeleted 
}: { 
  id: Status; 
  label: string; 
  tasks: Task[];
  onAddTask: (status: Status) => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}) => {
  const taskIds = tasks.map(task => task.id);
  
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      accepts: ['task'],
      type: 'column',
      status: id
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{label}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddTask(id)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      <div 
        ref={setNodeRef}
        data-droppable-id={id}
        data-column-id={id}
        className={`space-y-2 min-h-[100px] rounded-lg p-2 transition-colors ${
          isOver ? 'bg-muted/50 ring-2 ring-primary/50' : 'bg-muted/30'
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div 
              className="text-center text-sm text-muted-foreground p-4 h-full flex items-center justify-center border-2 border-dashed rounded-lg border-muted-foreground/30"
              data-column-id={id}
            >
              Drop tasks here
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <SortableItem 
                  key={task.id} 
                  task={task} 
                  onTaskUpdated={onTaskUpdated}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export function KanbanBoard({ 
  tasks, 
  projectId, 
  onTaskCreated, 
  onTaskUpdated,
  onTaskDeleted 
}: KanbanBoardProps) {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>(Status.TODO);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Update local tasks when tasks prop changes
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const columns: ColumnType[] = [
    { id: Status.TODO, label: "To Do" },
    { id: Status.IN_PROGRESS, label: "In Progress" },
    { id: Status.REVIEW, label: "Review" },
    { id: Status.DONE, label: "Done" },
  ];

  // Filter tasks by project if projectId is provided
  const filteredTasks = projectId 
    ? localTasks.filter(task => task.projectId === projectId)
    : localTasks;

  const groupedTasks = useMemo(() => 
    columns.reduce((acc, column) => {
      acc[column.id] = filteredTasks
        .filter(task => task.status === column.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return acc;
    }, {} as Record<Status, Task[]>)
  , [filteredTasks, columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragOver = (event: any) => {
    const { active, over } = event;
    
    if (!over) {
      return;
    }
    
    // If we're dragging over a column, make sure it's highlighted
    const columnElement = document.querySelector(`[data-droppable-id="${over.id}"]`);
    if (columnElement) {
      columnElement.classList.add('ring-2', 'ring-primary/50');
    }
  };
  
  const handleDragEndCleanup = () => {
    // Remove any lingering highlight classes
    document.querySelectorAll('[data-droppable-id]').forEach(el => {
      el.classList.remove('ring-2', 'ring-primary/50');
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const task = localTasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    // Find the source column (where the task is coming from)
    let sourceColumn: Status | null = null;
    for (const column of columns) {
      if (groupedTasks[column.id].some(t => t.id === active.id)) {
        sourceColumn = column.id;
        break;
      }
    }

    // Find the destination column (where the task is being dropped)
    let destinationColumn: Status | null = null;
    
    // Check if dropped on a column (either header or body)
    const isDroppedOnColumn = columns.some(col => col.id === over.id);
    if (isDroppedOnColumn) {
      destinationColumn = over.id as Status;
    } 
    // Check if dropped on a task in a column
    else {
      for (const column of columns) {
        if (groupedTasks[column.id].some(t => t.id === over.id)) {
          destinationColumn = column.id;
          break;
        }
      }
    }
    
    // If we still don't have a destination column, try to find it by the droppable area
    if (!destinationColumn) {
      for (const column of columns) {
        const droppableElement = document.querySelector(`[data-droppable-id="${column.id}"]`);
        if (droppableElement && droppableElement.contains(over as unknown as Node)) {
          destinationColumn = column.id;
          break;
        }
      }
    }
    
    // If we couldn't determine the columns, or they're the same, do nothing
    if (!sourceColumn || !destinationColumn || sourceColumn === destinationColumn) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    // Find the task being moved
    const taskToUpdate = localTasks.find(task => task.id === active.id);
    if (!taskToUpdate) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    // Optimistically update the UI
    const updatedTasks = localTasks.map(task => 
      task.id === active.id 
        ? { ...task, status: destinationColumn as Status }
        : task
    );
    
    setLocalTasks(updatedTasks);
    setActiveId(null);
    setActiveTask(null);

    try {
      const response = await fetch(`/api/tasks/${active.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: destinationColumn,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      // Refresh the tasks to ensure consistency
      onTaskUpdated?.();
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert optimistic update on error
      setLocalTasks(tasks);
    }
  };

  const handleAddTask = (status: Status) => {
    setSelectedStatus(status);
    setIsTaskFormOpen(true);
  };

  const handleTaskUpdated = () => {
    setIsTaskFormOpen(false);
    onTaskUpdated?.();
    onTaskCreated?.(); // For backward compatibility
  };

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
    duration: 200,
    easing: 'ease-out',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={(e) => {
          handleDragEnd(e);
          handleDragEndCleanup();
        }}
        onDragOver={handleDragOver}
        onDragCancel={handleDragEndCleanup}
      >
        {columns.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            label={column.label}
            tasks={groupedTasks[column.id] || []}
            onAddTask={handleAddTask}
            onTaskUpdated={onTaskUpdated}
            onTaskDeleted={onTaskDeleted}
          />
        ))}
        
        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? (
            <div className="opacity-60 bg-card border rounded-md shadow-lg w-full max-w-xs">
              <TaskCard 
                task={activeTask} 
                onTaskUpdated={onTaskUpdated}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <TaskForm 
            projectId={projectId} 
            initialStatus={selectedStatus} 
            onClose={handleTaskUpdated} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
