import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("return_to") || "/inicio";
  const cookieStore = await cookies();

  const existing = cookieStore.get("armoniq_user_id");
  const userId = existing?.value || "cf_user_" + Math.random().toString(36).substring(2, 10);

  cookieStore.set("armoniq_user_id", userId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 24 * 365,
  });
  cookieStore.set("armoniq_user_email", "musico@armoniq.app", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 24 * 365,
  });
  cookieStore.set("armoniq_user_name", "Músico Armoniq", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 24 * 365,
  });

  return redirect(returnTo.startsWith("/") ? returnTo : "/inicio");
}
