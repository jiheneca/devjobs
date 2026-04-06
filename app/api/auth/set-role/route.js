import { getServerSession } from "next-auth/next"
import { authOptions } from "../[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { role } = await req.json()

  if (!role || !["DEVELOPER", "COMPANY"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { role },
  })

  return NextResponse.json({ ok: true, user })
}