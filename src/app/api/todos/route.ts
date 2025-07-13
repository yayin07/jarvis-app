import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

// get
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request)

    if (!authUser) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const todos = await prisma.todo.findMany({
      where: { userId: authUser.userId },
      orderBy: [{ completed: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(todos)
  } catch (error) {
    console.error("Fetch todos error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

// post
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request)

    if (!authUser) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await request.json()

    const todo = await prisma.todo.create({
      data: {
        ...data,
        userId: authUser.userId,
      },
    })

    return NextResponse.json(todo)
  } catch (error) {
    console.error("Create todo error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
