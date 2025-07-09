import 'dotenv/config';
import { prisma } from '../src/lib/prisma.js';
import { hash } from 'bcrypt';

async function main() {
  const email = 'gerson@thecraftedhospitality.com';
  const firstName = 'Gerson';
  const lastName = 'Aguero';
  const role = 'ADMIN';
  const password = 'ChangeMe123!';

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      role,
      authId: passwordHash,
    } as any,
  });

  console.log('✅ Superadmin created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 