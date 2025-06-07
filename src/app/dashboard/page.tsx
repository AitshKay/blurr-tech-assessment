import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getDashboardData } from "@/app/actions/dashboard";
import { Calendar, Users, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

function StatCard({ title, value, icon: Icon, trend, className = "" }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: string; type: 'up' | 'down' | 'neutral' };
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.type === 'up' ? 'text-green-500' : trend.type === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const data = await getDashboardData();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={data.employeeCount}
          icon={Users}
          trend={{ value: `+5 from last month`, type: 'up' }}
        />
        <StatCard
          title="Active Projects"
          value={data.projectCount}
          icon={FileText}
          trend={{ value: `${Math.round((data.projectCount / Math.max(1, data.employeeCount)) * 10) / 10} per team`, type: 'neutral' }}
        />
        <StatCard
          title="Completed Tasks"
          value={`${Math.round((data.recentProjects.flatMap(p => p.tasks).filter(t => t.status === 'DONE').length / Math.max(1, data.taskCount)) * 100)}%`}
          icon={CheckCircle}
          trend={{ value: `${data.taskCount} total tasks`, type: 'neutral' }}
        />
        <StatCard
          title="Upcoming Deadlines"
          value={data.recentProjects.flatMap(p => p.tasks).filter(t => t.dueDate && new Date(t.dueDate) > new Date()).length}
          icon={AlertTriangle}
          className="border-red-200 dark:border-red-900/50"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/projects">View All</Link>
              </Button>
            </div>
            <CardDescription>Latest projects you're working on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Link href={`/dashboard/projects/${project.id}`} className="font-medium hover:underline">
                      {project.name}
                    </Link>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="capitalize">{project.status.toLowerCase()}</span>
                      {project.tasks.length > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{project.tasks.length} active tasks</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {project.user?.name && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={project.user?.email ? `https://github.com/${project.user?.email}.png` : ''} alt={project.user?.name} />
                        <AvatarFallback>{getInitials(project.user?.name)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              {data.recentProjects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No projects found. Create your first project to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/employees">View All</Link>
              </Button>
            </div>
            <CardDescription>Recently joined team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.recentEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={employee.user?.image || ''} alt={employee.name} />
                      <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/dashboard/employees/${employee.id}`} className="font-medium hover:underline">
                        {employee.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {employee.employeeId}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(employee.joiningDate).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
              {data.recentEmployees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No team members found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link href="/dashboard/employees/new">
                <Users className="h-6 w-6" />
                <span>Add Employee</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link href="/dashboard/projects/new">
                <FileText className="h-6 w-6" />
                <span>Create Project</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link href="/dashboard/tasks/new">
                <CheckCircle className="h-6 w-6" />
                <span>Add Task</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link href="/dashboard/calendar">
                <Calendar className="h-6 w-6" />
                <span>View Calendar</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}