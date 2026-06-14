import { NextResponse } from "next/server";
import { createMemoryForUser, loadMemoryViewForUser, type CreateMemoryInput } from "@/lib/server/data";
import { getCurrentUserId, isAuthenticationError } from "@/lib/server/auth";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    return NextResponse.json(await loadMemoryViewForUser(userId));
  } catch (error) {
    if (isAuthenticationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load memories." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const input = (await request.json()) as CreateMemoryInput;
    await createMemoryForUser(userId, {
      memory: input.memory,
      place: input.place ?? null,
      tags: input.tags ?? [],
      comments: input.comments ?? []
    });

    return NextResponse.json(await loadMemoryViewForUser(userId), { status: 201 });
  } catch (error) {
    if (isAuthenticationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create memory." }, { status: 500 });
  }
}
