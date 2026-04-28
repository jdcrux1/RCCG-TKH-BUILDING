import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.donor.findFirst({
    where: { role: 'ADMIN' }
  })
  console.log(admin)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
