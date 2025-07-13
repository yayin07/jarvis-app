import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { comparePassword, signToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return new NextResponse("Email and password are required", { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !comparePassword(password, user.password)) {
      return new NextResponse("Invalid credentials", { status: 401 })
    }

    const token = signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
