-- AlterTable
ALTER TABLE "Project" ADD COLUMN "endDate" DATETIME;
ALTER TABLE "Project" ADD COLUMN "startDate" DATETIME;

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectEmployees" (
    "employeeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" TEXT,

    PRIMARY KEY ("employeeId", "projectId"),
    CONSTRAINT "ProjectEmployees_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjectEmployees_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ProjectEmployees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProjectEmployees_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProjectEmployees_B_fkey" FOREIGN KEY ("B") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "position" TEXT,
    "joiningDate" DATETIME NOT NULL,
    "basicSalary" REAL NOT NULL,
    "departmentId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("basicSalary", "createdAt", "employeeId", "id", "joiningDate", "name", "updatedAt", "userId") SELECT "basicSalary", "createdAt", "employeeId", "id", "joiningDate", "name", "updatedAt", "userId" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_employeeId_key" ON "Employee"("employeeId");
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectEmployees_AB_unique" ON "_ProjectEmployees"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectEmployees_B_index" ON "_ProjectEmployees"("B");
