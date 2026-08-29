import { NextRequest, NextResponse } from "next/server";
import { DataService } from "@/lib/dataService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const success = await DataService.importAllData(body);
    if (!success) {
      return NextResponse.json({ error: "Invalid backup format" }, { status: 400 });
    }
    return NextResponse.json({ message: "Data imported successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to import data" }, { status: 500 });
  }
}
