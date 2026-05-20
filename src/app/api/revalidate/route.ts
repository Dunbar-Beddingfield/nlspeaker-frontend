import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { tags } = await req.json().catch(() => ({ tags: [] }));

  if (!Array.isArray(tags) || tags.length === 0) {
    return NextResponse.json({ error: "No tags provided" }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: true, tags });
}
