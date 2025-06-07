import { cn } from "@/lib/utils"
import { Status } from "@prisma/client"

type TaskStatusBadgeProps = {
  status: Status
  className?: string
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const statusMap: Record<Status, { label: string; color: string }> = {
    TODO: { label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    REVIEW: { label: 'In Review', color: 'bg-yellow-100 text-yellow-800' },
    DONE: { label: 'Done', color: 'bg-green-100 text-green-800' },
    BLOCKED: { label: 'Blocked', color: 'bg-red-100 text-red-800' },
  }

  const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusInfo.color,
        className
      )}
    >
      {statusInfo.label}
    </span>
  )
}
