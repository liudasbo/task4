import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function PUT(request) {
  try {
    const { userIds, status } = await request.json(); // Naudojame userIds vietoj emails

    if (!userIds || !status) {
      return NextResponse.json(
        { error: "User IDs and status are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await User.updateMany(
      { email: { $in: userIds } }, // Filtruojame pagal el. paštus
      { $set: { status } }
    );

    if (result.modifiedCount > 0) {
      return NextResponse.json(
        { message: `${result.modifiedCount} users updated successfully` },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No users found to update" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating users:", error);
    return NextResponse.json(
      { error: "Failed to update users" },
      { status: 500 }
    );
  }
}
