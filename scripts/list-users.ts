import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log('Users in the database:');
      console.table(users);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
