import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { runMigrations } from "@/lib/migrations";

export const dynamic = "force-dynamic";

export function GET() {
  runMigrations();
  db.prepare("SELECT 1").get();
  return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
