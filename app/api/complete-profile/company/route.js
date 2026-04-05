import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"

export async function POST(request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { name, logoUrl, description } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 })
  }

  const company = await prisma.company.upsert({
    where: { userId: Number(session.user.id) },
    update: { name, logo: logoUrl ?? null, description: description ?? null },
    create: {
      userId: Number(session.user.id),
      name,
      logo: logoUrl ?? null,
      description: description ?? null,
    },
  })

  return NextResponse.json({ message: "Profile saved", company }, { status: 200 })
}