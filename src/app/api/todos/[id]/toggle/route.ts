import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const awaitedParams = await params;

  // Now use awaitedParams.id
  const authUser = getAuthUser(request);
  if (!authUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const currentTodo = await prisma.todo.findFirst({
    where: {
      id: awaitedParams.id,
      userId: authUser.userId,
    },
  });

  if (!currentTodo) {
    return new NextResponse("Todo not found", { status: 404 });
  }

  const updatedTodo = await prisma.todo.update({
    where: { id: awaitedParams.id },
    data: { completed: !currentTodo.completed },
  });

  return NextResponse.json(updatedTodo);
}
