import { createUser } from "@/action/auth";
import { createClient } from "@/utils/supabase/server";
import { accountType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = decodeURIComponent(
    requestUrl.searchParams.get("redirect") || "/"
  );
  const userType =
    (requestUrl.searchParams.get("userType") as accountType) ||
    accountType.User;
  const affiliateId = requestUrl.searchParams.get("affiliateId");
  const companyInvite = requestUrl.searchParams.get("companyInvite");
  const joinCompany = requestUrl.searchParams.get("joinCompany");

  console.log("code", userType, affiliateId, companyInvite, joinCompany);

  try {
    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        return NextResponse.redirect(
          new URL(
            `/?error=${encodeURIComponent(error.message)}`,
            requestUrl.origin
          )
        );
      }

      const userResult = await createUser(
        userType,
        affiliateId,
        companyInvite,
        joinCompany
      );

      console.log("userResult", userResult);

      if (userResult.status !== 200) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          new URL("/?error=Authentication failed", requestUrl.origin)
        );
      }
    }

    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.redirect(
      new URL("/?error=Unexpected error", requestUrl.origin)
    );
  }
}
