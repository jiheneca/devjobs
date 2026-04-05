import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/app/lib/prisma"

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "DEVELOPER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const resolvedParams = await params
  const jobId = parseInt(resolvedParams.id)
  const { cvUrl, message } = await request.json()

  if (!cvUrl) {
    return NextResponse.json({ error: "CV URL is required" }, { status: 400 })
  }

  try {
    // Check if developer profile exists
    const developer = await prisma.developer.findUnique({
      where: { userId: parseInt(session.user.id) },
    })

    if (!developer) {
      return NextResponse.json({ error: "Complete your profile first" }, { status: 400 })
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        developerId_jobId: {
          developerId: developer.id,
          jobId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied for this job" },
        { status: 409 }
      )
    }

    // Create application
    await prisma.application.create({
      data: {
        developerId: developer.id,
        jobId,
        cvUrl,
        message: message || null,
      },
    })

    return NextResponse.json({ message: "Application submitted successfully" }, { status: 201 })
  } catch (err) {
    console.error("Application error:", err)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}