import { cn } from "@/lib/utils"
import { Priority } from "@prisma/client"

type TaskPriorityBadgeProps = {
  priority: Priority
  className?: string
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  const priorityMap: Record<Priority, { label: string; color: string }> = {
    LOW: { label: 'Low', color: 'bg-green-100 text-green-800' },
    NORMAL: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    HIGH: { label: 'High', color: 'bg-yellow-100 text-yellow-800' },
  }

  const priorityInfo = priorityMap[priority] || { label: priority, color: 'bg-gray-100 text-gray-800' }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        priorityInfo.color,
        className
      )}
    >
      {priorityInfo.label}
    </span>
  )
}
