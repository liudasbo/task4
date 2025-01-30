import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/lib/auth.config";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ userExists: false }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ userExists: false }, { status: 401 });
    }

    if (user.status === "Blocked") {
      return NextResponse.json({ isBlocked: true }, { status: 403 });
    }

    return NextResponse.json({ userExists: true, isBlocked: false });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
