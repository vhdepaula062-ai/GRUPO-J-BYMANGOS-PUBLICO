import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let supabaseResponse = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith("http") || supabaseUrl.includes("placeholder")) {
    const isPublic = pathname === "/" || pathname === "/login" || pathname.startsWith("/seja-parceiro") || pathname.startsWith("/api/auth");
    if (isPublic) return supabaseResponse;
    return NextResponse.json({ title: "Serviço não configurado", detail: "A autenticação do portal da oficina não está disponível.", status: 503 }, { status: 503 });
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    });

    const {
      data: { user }
    } = await supabase.auth.getUser();

    // Rotas de portal protegidas
    const isPortalRoute = pathname.startsWith("/painel") || 
      pathname.startsWith("/agenda") || 
      pathname.startsWith("/servicos") || 
      pathname.startsWith("/relatorios") || 
      pathname.startsWith("/equipe") || 
      pathname.startsWith("/mensalidade") || 
      pathname.startsWith("/configuracoes") || 
      pathname.startsWith("/promocoes") || 
      pathname.startsWith("/suporte") || 
      pathname.startsWith("/clientes") || 
      pathname.startsWith("/check-in");

    if (isPortalRoute && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/login" && user) {
      return NextResponse.redirect(new URL("/painel", request.url));
    }

    // Verificação de Nível de Garantia de Autenticação (MFA / AAL2)
    if (user && isPortalRoute) {
      try {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData) {
          if (aalData.nextLevel === "aal2" && aalData.currentLevel === "aal1") {
            if (pathname !== "/mfa") {
              return NextResponse.redirect(new URL("/mfa", request.url));
            }
          } else if (aalData.currentLevel === "aal2" && pathname === "/mfa") {
            return NextResponse.redirect(new URL("/painel", request.url));
          }
        }
      } catch (mfaErr) {
        // Fallback gracioso
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Workshop middleware error:", error);
    return NextResponse.redirect(new URL("/login?error=auth_unavailable", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
