import { NextRequest, NextResponse } from "next/server";

// Rutas que requieren autenticación
const protectedPaths = ["/dashboard", "/admin", "/reservations", "/profile"];
// Rutas que solo deben verse si NO está logueado
const authPaths = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Leer cookie "session_active" seteada en AuthContext
  const sessionActive = request.cookies.get("session_active");
  
  // 1. Proteger rutas privadas
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));
  if (isProtected && !sessionActive) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // 2. Prevenir acceso a login/register si ya estás logueado
  const isAuthPath = authPaths.includes(pathname);
  if (isAuthPath && sessionActive) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Aplicar a todas las rutas excepto las de la API y recursos estáticos
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
