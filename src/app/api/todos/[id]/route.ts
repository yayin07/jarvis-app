import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const awaitedParams = await params;

  const authUser = getAuthUser(request);
  if (!authUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = await request.json();

  const todo = await prisma.todo.updateMany({
    where: {
      id: awaitedParams.id,
      userId: authUser.userId,
    },
    data,
  });

  if (todo.count === 0) {
    return new NextResponse("Todo not found", { status: 404 });
  }

  const updatedTodo = await prisma.todo.findUnique({
    where: { id: awaitedParams.id },
  });

  return NextResponse.json(updatedTodo);
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const awaitedParams = await params;

  const authUser = getAuthUser(request);
  if (!authUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await prisma.todo.deleteMany({
    where: {
      id: awaitedParams.id,
      userId: authUser.userId,
    },
  });

  if (result.count === 0) {
    return new NextResponse("Todo not found", { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
