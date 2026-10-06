import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("return_to") || "/acceso";
  const cookieStore = await cookies();
  cookieStore.delete("armoniq_user_id");
  cookieStore.delete("armoniq_user_email");
  cookieStore.delete("armoniq_user_name");
  return redirect(returnTo.startsWith("/") ? returnTo : "/acceso");
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("return_to") || "/acceso";
  const cookieStore = await cookies();
  cookieStore.delete("armoniq_user_id");
  cookieStore.delete("armoniq_user_email");
  cookieStore.delete("armoniq_user_name");
  return redirect(returnTo.startsWith("/") ? returnTo : "/acceso");
}
