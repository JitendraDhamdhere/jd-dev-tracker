import { NextResponse } from "next/server";
import { DataService } from "@/lib/dataService";

export async function GET() {
  try {
    const dump = await DataService.exportAllData();
    return new NextResponse(dump, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="devtrack-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
