import { NextResponse } from "next/server";
import { deleteMemoryForUser, loadMemoryViewForUser, updateMemoryFavoriteForUser } from "@/lib/server/data";
import { getCurrentUserId, isAuthenticationError } from "@/lib/server/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await context.params;
    const body = (await request.json()) as { favorite?: boolean };

    if (typeof body.favorite !== "boolean") {
      return NextResponse.json({ error: "favorite must be a boolean." }, { status: 400 });
    }

    const updated = await updateMemoryFavoriteForUser(userId, id, body.favorite);
    if (!updated) return NextResponse.json({ error: "Memory not found." }, { status: 404 });

    return NextResponse.json(await loadMemoryViewForUser(userId));
  } catch (error) {
    if (isAuthenticationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update memory." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();
    const { id } = await context.params;
    await deleteMemoryForUser(userId, id);
    return NextResponse.json(await loadMemoryViewForUser(userId));
  } catch (error) {
    if (isAuthenticationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete memory." }, { status: 500 });
  }
}
