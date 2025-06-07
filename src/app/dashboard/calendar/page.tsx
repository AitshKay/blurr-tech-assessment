'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Clock, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Task } from "@prisma/client";

export default function CalendarPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchTasks();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const todayTasks = tasks.filter(task => 
    task.dueDate && isToday(parseISO(task.dueDate as unknown as string))
  );

  const upcomingTasks = tasks
    .filter(task => 
      task.dueDate && 
      new Date(task.dueDate) > new Date() &&
      !isToday(parseISO(task.dueDate as unknown as string))
    )
    .sort((a, b) => 
      new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    )
    .slice(0, 5);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      router.push(`/dashboard/tasks?dueDate=${format(selectedDate, 'yyyy-MM-dd')}`);
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View and manage your schedule</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              const today = new Date();
              setDate(today);
              router.push(`/dashboard/tasks?dueDate=${format(today, 'yyyy-MM-dd')}`);
            }}
          >
            <CalendarIcon className="h-4 w-4" />
            Today
          </Button>
          <Button asChild>
            <Link href="/dashboard/calendar/new">
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5 w-full">
        <div className="md:col-span-2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{format(date, 'MMMM yyyy')}</CardTitle>
              <CardDescription>Upcoming tasks and deadlines</CardDescription>
            </CardHeader>
            <CardContent className="w-full p-0">
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="w-full"
                  classNames={{
                    months: "w-full",
                    month: "w-full",
                    table: "w-full",
                    head_row: "w-full",
                    row: "w-full mt-2"
                  }}
                  modifiers={{
                    hasTasks: tasks
                      .filter(task => task.dueDate)
                      .map(task => new Date(task.dueDate as unknown as string))
                  }}
                  modifiersStyles={{
                    hasTasks: {
                      borderBottom: '2px solid currentColor',
                      paddingBottom: '2px'
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today</CardTitle>
              <CardDescription>Your schedule for {format(new Date(), 'EEEE, MMMM d')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading...
                </div>
              ) : todayTasks.length > 0 ? (
                todayTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                  >
                    <div className="font-medium flex items-center justify-between">
                      <span>{task.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTaskStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    {task.dueDate && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(task.dueDate as unknown as string), 'h:mm a')}
                      </div>
                    )}
                    {task.projectId && (
                      <div className="text-sm mt-1 flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Project: {task.projectId}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No tasks scheduled for today
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
              <CardDescription>Next 5 tasks on your schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading...
                </div>
              ) : upcomingTasks.length > 0 ? (
                upcomingTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="pl-4 py-2 border-l-2 border-muted hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                  >
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {task.dueDate && (
                        <>
                          {isTomorrow(parseISO(task.dueDate as unknown as string)) 
                            ? 'Tomorrow' 
                            : format(parseISO(task.dueDate as unknown as string), 'EEEE, MMM d')}
                          {', '}
                          {format(parseISO(task.dueDate as unknown as string), 'h:mm a')}
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No upcoming tasks
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
