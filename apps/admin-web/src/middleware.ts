import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Rotas que NÃO exigem autenticação
const PUBLIC_ROUTES = ["/login", "/mfa", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let supabaseResponse = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith("http") || supabaseUrl.includes("placeholder")) {
    if (pathname === "/" || pathname === "/login") return pathname === "/" ? NextResponse.redirect(new URL("/login", request.url)) : supabaseResponse;
    return NextResponse.json({ title: "Serviço não configurado", detail: "A autenticação do painel administrativo não está disponível.", status: 503 }, { status: 503 });
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

    // Permitir rotas públicas
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    // Rota raiz → redirecionar para /dashboard ou /login
    if (pathname === "/") {
      if (user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Rota protegida sem sessão → redirecionar para /login
    if (!isPublicRoute && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Usuário logado tentando acessar login → redirecionar para /dashboard
    if (pathname === "/login" && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Verificação de Nível de Garantia de Autenticação (MFA / AAL2)
    if (user) {
      try {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData) {
          // Se o usuário possui segundo fator cadastrado mas a sessão atual é AAL1
          if (aalData.nextLevel === "aal2" && aalData.currentLevel === "aal1") {
            if (pathname !== "/mfa" && !pathname.startsWith("/api/auth")) {
              return NextResponse.redirect(new URL("/mfa", request.url));
            }
          } else if (aalData.currentLevel === "aal2" && pathname === "/mfa") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        }
      } catch (mfaErr) {
        // Log seguro e fallback gracioso sem quebrar acesso
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware auth error:", error);
    return NextResponse.redirect(new URL("/login?error=auth_unavailable", request.url));
  }
}

export const config = {
  matcher: [
    // Proteger todas as rotas exceto assets estáticos e _next
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
