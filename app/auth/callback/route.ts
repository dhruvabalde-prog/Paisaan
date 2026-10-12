import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  // Redirect back to main page preserving session
  return NextResponse.redirect(`${requestUrl.origin}/`);
}
