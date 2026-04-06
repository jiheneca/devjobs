const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const hashedPassword1 = await bcrypt.hash('password123', 10)
  const hashedPassword2 = await bcrypt.hash('password123', 10)

  const devUser1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword1,
      role: 'DEVELOPER',
    }
  })

  const devUser2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword2,
      role: 'DEVELOPER',
    }
  })

  const companyUser1 = await prisma.user.create({
    data: {
      name: 'Tech Corp',
      email: 'hr@techcorp.com',
      password: hashedPassword1,
      role: 'COMPANY',
    }
  })

  const companyUser2 = await prisma.user.create({
    data: {
      name: 'Startup Inc',
      email: 'jobs@startupinc.com',
      password: hashedPassword2,
      role: 'COMPANY',
    }
  })

  const developer1 = await prisma.developer.create({
    data: {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      about: 'Full-stack developer with 5 years of experience in React and Node.js',
      userId: devUser1.id,
    }
  })

  const developer2 = await prisma.developer.create({
    data: {
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      about: 'Frontend developer specializing in modern JavaScript frameworks',
      userId: devUser2.id,
    }
  })

  const company1 = await prisma.company.create({
    data: {
      name: 'Tech Corp',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
      description: 'Leading technology company focused on innovative solutions',
      userId: companyUser1.id,
    }
  })

  const company2 = await prisma.company.create({
    data: {
      name: 'Startup Inc',
      logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop',
      description: 'Fast-growing startup building the future of work',
      userId: companyUser2.id,
    }
  })

  const job1 = await prisma.job.create({
    data: {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for a senior full stack developer to join our team. You will be working on exciting projects using React, Node.js, and PostgreSQL.',
      salary: 120000,
      location: 'New York, NY',
      type: 'FULL_TIME',
      companyId: company1.id,
    }
  })

  const job2 = await prisma.job.create({
    data: {
      title: 'Frontend Developer',
      description: 'Join our frontend team to build beautiful user interfaces with React and TypeScript.',
      salary: 90000,
      location: 'San Francisco, CA',
      type: 'FULL_TIME',
      companyId: company1.id,
    }
  })

  const job3 = await prisma.job.create({
    data: {
      title: 'React Developer',
      description: 'Looking for a passionate React developer to work on our mobile app.',
      salary: 85000,
      location: 'Remote',
      type: 'REMOTE',
      companyId: company2.id,
    }
  })

  const job4 = await prisma.job.create({
    data: {
      title: 'Junior Developer',
      description: 'Great opportunity for a junior developer to learn and grow in a supportive environment.',
      salary: 60000,
      location: 'Austin, TX',
      type: 'FULL_TIME',
      companyId: company2.id,
    }
  })

  await prisma.application.create({
    data: {
      developerId: developer1.id,
      jobId: job1.id,
      cvUrl: 'https://example.com/cv/john-doe.pdf',
      message: 'I am very interested in this position and believe my experience aligns well with your requirements.',
    }
  })

  await prisma.application.create({
    data: {
      developerId: developer1.id,
      jobId: job3.id,
      cvUrl: 'https://example.com/cv/john-doe.pdf',
      message: 'I would love to work remotely on this exciting project.',
    }
  })

  await prisma.application.create({
    data: {
      developerId: developer2.id,
      jobId: job2.id,
      cvUrl: 'https://example.com/cv/jane-smith.pdf',
      message: 'My frontend expertise would be a great fit for your team.',
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('Created:')
  console.log('- 4 users (2 developers, 2 companies)')
  console.log('- 2 developers with profiles')
  console.log('- 2 companies with profiles')
  console.log('- 4 job postings')
  console.log('- 3 job applications')
  console.log('')
  console.log('Test users:')
  console.log('Developer: john@example.com / password123')
  console.log('Developer: jane@example.com / password123')
  console.log('Company: hr@techcorp.com / password123')
  console.log('Company: jobs@startupinc.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })