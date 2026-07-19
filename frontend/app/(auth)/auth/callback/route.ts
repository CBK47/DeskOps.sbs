import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");
  const safeNext = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : null;
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(`${origin}/login?error=auth`);
    if (safeNext) return NextResponse.redirect(`${origin}${safeNext}`);

    const { count } = await supabase
      .from("wellness_assessments")
      .select("*", { count: "exact", head: true });
    return NextResponse.redirect(`${origin}${(count ?? 0) > 0 ? "/queue" : "/wellness?first=1"}`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
