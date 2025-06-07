// Base entity types
export type BaseUser = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  password: string | null;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BaseDepartment = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BaseProject = {
  id: string;
  name: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  userId: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BaseTask = {
  id: string;
  name: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate: Date | null;
  projectId: string;
};

export type BaseEmployee = {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  joiningDate: Date;
  basicSalary: number;
  userId: string;
  departmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Relation types
export type TaskWithRelations = BaseTask & {
  assignedTo: EmployeeWithDepartment[];
  project: BaseProject;
};

export interface EmployeeWithDepartment extends BaseEmployee {
  department: {
    id: string;
    name: string;
  } | null;
  tasks: TaskWithRelations[];
  user: Pick<BaseUser, 'id' | 'name' | 'email'>;
}

export interface ProjectWithRelations extends BaseProject {
  user: Pick<BaseUser, 'id' | 'name' | 'email'>;
  client: {
    id: string;
    name: string;
  };
  tasks: TaskWithRelations[];
  employees: Array<{
    employee: EmployeeWithDepartment;
  }>;
}

export interface EmployeeWithTasks extends BaseEmployee {
  tasks: TaskWithRelations[];
  user: Pick<BaseUser, 'id' | 'name' | 'email'>;
}
