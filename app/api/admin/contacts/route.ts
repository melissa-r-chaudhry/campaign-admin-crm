import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listContacts, countContacts } from "@/lib/campaign-db";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin-session")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 50;
  const offset = (page - 1) * limit;
  const search = (searchParams.get("q") ?? "").trim();

  const [rows, total] = await Promise.all([
    listContacts({ limit, offset, search }),
    countContacts(search),
  ]);

  return NextResponse.json({ contacts: rows, total, page, limit });
}
