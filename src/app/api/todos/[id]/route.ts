import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = getAuthUser(request)

    if (!authUser) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await request.json()

    const todo = await prisma.todo.updateMany({
      where: {
        id: params.id,
        userId: authUser.userId,
      },
      data,
    })

    if (todo.count === 0) {
      return new NextResponse("Todo not found", { status: 404 })
    }

    const updatedTodo = await prisma.todo.findUnique({
      where: { id: params.id },
    })

    return NextResponse.json(updatedTodo)
  } catch (error) {
    console.error("Update todo error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = getAuthUser(request)

    if (!authUser) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const result = await prisma.todo.deleteMany({
      where: {
        id: params.id,
        userId: authUser.userId,
      },
    })

    if (result.count === 0) {
      return new NextResponse("Todo not found", { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Delete todo error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
