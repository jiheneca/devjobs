"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { jobSchema } from "@/lib/validation"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createJob(formData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "COMPANY") {
    throw new Error("Unauthorized")
  }

  const company = await prisma.company.findUnique({
    where: { userId: Number(session.user.id) },
  })
  if (!company) {
    throw new Error("Complete your company profile first")
  }

  const data = Object.fromEntries(formData)
  if (data.salary === "") data.salary = undefined
  else if (data.salary) data.salary = parseFloat(data.salary)

  const validated = jobSchema.parse(data)

  await prisma.job.create({
    data: {
      ...validated,
      companyId: company.id,
    },
  })

  revalidatePath("/dashboard/company")
}

export async function updateJob(id, formData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "COMPANY") {
    throw new Error("Unauthorized")
  }

  const company = await prisma.company.findUnique({
    where: { userId: Number(session.user.id) },
  })
  if (!company) {
    throw new Error("Complete your company profile first")
  }

  const job = await prisma.job.findUnique({
    where: { id: Number(id) },
  })
  if (!job || job.companyId !== company.id) {
    throw new Error("Job not found")
  }

  const data = Object.fromEntries(formData)
  if (data.salary === "") data.salary = undefined
  else if (data.salary) data.salary = parseFloat(data.salary)

  const validated = jobSchema.parse(data)

  await prisma.job.update({
    where: { id: Number(id) },
    data: validated,
  })

  revalidatePath("/dashboard/company")
}

export async function deleteJob(id) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "COMPANY") {
    throw new Error("Unauthorized")
  }

  const company = await prisma.company.findUnique({
    where: { userId: Number(session.user.id) },
  })
  if (!company) {
    throw new Error("Complete your company profile first")
  }

  const job = await prisma.job.findUnique({
    where: { id: Number(id) },
  })
  if (!job || job.companyId !== company.id) {
    throw new Error("Job not found")
  }

  await prisma.job.delete({
    where: { id: Number(id) },
  })

  revalidatePath("/dashboard/company")
}