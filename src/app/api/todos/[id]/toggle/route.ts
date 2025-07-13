import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = getAuthUser(request)

    if (!authUser) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // First get the current todo to toggle its completed status
    const currentTodo = await prisma.todo.findFirst({
      where: {
        id: params.id,
        userId: authUser.userId,
      },
    })

    if (!currentTodo) {
      return new NextResponse("Todo not found", { status: 404 })
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: params.id },
      data: { completed: !currentTodo.completed },
    })

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error("Toggle todo error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
