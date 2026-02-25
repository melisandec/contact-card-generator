import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const designs = await prisma.design.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        data: true,
        frontLayers: true,
        backLayers: true,
        isDoubleSided: true,
        width: true,
        height: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return all design data as JSON (the client-side will create the ZIP)
    return NextResponse.json({ designs });
  } catch (error) {
    console.error("Failed to export designs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
