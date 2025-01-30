import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function PUT(request) {
  try {
    const { userIds } = await request.json(); // Naudojame userIds vietoj emails

    if (!userIds) {
      return NextResponse.json(
        { error: "User IDs are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await User.updateMany(
      { email: { $in: userIds } }, // Filtruojame pagal el. paštus
      { $set: { status: "Active" } } // Nustatome būseną kaip "Active"
    );

    if (result.modifiedCount > 0) {
      return NextResponse.json(
        { message: `${result.modifiedCount} users unblocked successfully` },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No users found to unblock" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error unblocking users:", error);
    return NextResponse.json(
      { error: "Failed to unblock users" },
      { status: 500 }
    );
  }
}
