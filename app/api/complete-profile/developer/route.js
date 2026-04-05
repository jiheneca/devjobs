import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"

export async function POST(request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "DEVELOPER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // ✅ Now receives imageUrl (from Cloudinary) instead of a raw URL typed by user
  const { imageUrl, about } = await request.json()

  const developer = await prisma.developer.upsert({
    where: { userId: Number(session.user.id) },
    update: { image: imageUrl ?? null, about },
    create: {
      userId: Number(session.user.id),
      image: imageUrl ?? null,
      about,
    },
  })

  return NextResponse.json({ message: "Profile saved", developer }, { status: 200 })
}