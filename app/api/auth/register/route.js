import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validation"

export async function POST(request) {
  try {
    const body = await request.json()

    const validatedData = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }


    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        emailVerified: new Date(),
      },
    })

    return NextResponse.json(
      { 
        message: "User created successfully",
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
