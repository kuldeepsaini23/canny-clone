import { imagekit } from "@/utils/imagekit";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    console.log("authenticationParameters", authenticationParameters)
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.log("🔴 ERROR", error);
    return NextResponse.json(
      { error: "Failed to authenticate with ImageKit" },
      { status: 500 }
    );
  }
}
