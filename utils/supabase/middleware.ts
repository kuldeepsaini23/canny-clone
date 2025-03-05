import env from "@/env";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/utils/prisma/client";

const ROUTE_CONFIG = {
  nonCompanyRoutes: ["/", "/stripe-connect", "/login", "/signup"],

  publicCompanyRoutes: ["landing", "about", "contact", "pricing"],

  protectedCompanyRoutes: [
    "dashboard",
    "settings",
    "profile",
    "billing",
    "team",
    "projects",
  ],
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(env.supabase.url, env.supabase.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: { user },
  } = await supabase.auth.getUser();

  const protocol = env.website.nodeEnv === "development" ? "http" : "https";
  const hostname = request.headers.get("host") ?? "";
  const reqPathName = request.nextUrl.pathname;
  const hostedDomain = env.website.origin.replace(/http:\/\/|https:\/\//, "");

  const hostedDomains = [hostedDomain, `www.${hostedDomain}`];

  // Extract the base route from the path (e.g., '/dashboard' → 'dashboard')
  const pathSegments = reqPathName.split("/").filter(Boolean);
  const baseRoute = pathSegments.length > 0 ? pathSegments[0] : "";

  // Check if the route is related to a company
  const isCompanyRoute =
    ROUTE_CONFIG.publicCompanyRoutes.includes(baseRoute) ||
    ROUTE_CONFIG.protectedCompanyRoutes.includes(baseRoute);

  if (isCompanyRoute) {
    console.log(
      `Checking company for route: ${baseRoute} and hostname: ${hostname}`
    );

    const company = await prisma.company.findFirst({
      where: {
        customDomain: hostname,
      },
    });

    if (company) {
      console.log(`✅ Company found: ${company.name}`);

      if (company.customDomain && hostname !== company.customDomain) {
        console.log(`🔀 Redirecting to custom domain: ${company.customDomain}`);
        return NextResponse.redirect(
          `${protocol}://${company.customDomain}${reqPathName}`,
          { status: 301 }
        );
      }
    } else {
      console.log(`❌ No company found for hostname: ${hostname}`);
    }
  }

  return supabaseResponse;

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!
}
