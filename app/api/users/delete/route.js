import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function DELETE(request) {
  try {
    const { userIds } = await request.json(); // Naudojame userIds vietoj emails

    if (!userIds || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await User.deleteMany(
      { email: { $in: userIds } } // Filtruojame pagal el. paštus
    );

    if (result.deletedCount > 0) {
      return NextResponse.json(
        { message: `${result.deletedCount} users deleted successfully` },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No users found to delete" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json(
      { error: "Failed to delete users" },
      { status: 500 }
    );
  }
}
