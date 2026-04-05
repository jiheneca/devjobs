import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"
import { developerProfileSchema } from "@/lib/validation"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const developer = await prisma.developer.findUnique({
    where: { userId: Number(session.user.id) },
  })

  if (!developer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(developer)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "DEVELOPER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { name, imageUrl, about } = await request.json()

  try {
    const validated = developerProfileSchema.parse({ name, image: imageUrl, about })

    // Update name on User
    await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: { name: validated.name },
    })

    // Upsert developer profile
    const developer = await prisma.developer.upsert({
      where: { userId: Number(session.user.id) },
      update: { image: validated.image || null, about: validated.about || null },
      create: {
        userId: Number(session.user.id),
        image: validated.image || null,
        about: validated.about || null,
      },
    })

    return NextResponse.json({ message: "Profile updated", developer })
  } catch (err) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors }, { status: 422 })
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}