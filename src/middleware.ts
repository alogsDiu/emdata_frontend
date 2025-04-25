import { NextResponse } from "next/server";
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import type { NextRequest } from "next/server";
 
let locales = ['en', 'ru', 'kz'];

// Get the preferred locale, similar to the above or using a library
function  getLocale(request:NextRequest) { 
  let headers = { 'accept-language': request.headers.get("accept-language") || 'en-US,en;q=0.5' };
  let languages = new Negotiator({headers}).languages().map(
    lang => lang.slice(0, 2)
  ); //GET THE LANGUAGES AND SLICE THEM TO HAVE LENGTH OF 2 

  return match(languages,locales,"ru")
}
 
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
 
  // ---- START: Added Check ----
  // Skip middleware for specific paths (assets, API routes, etc.)
  if (
      pathname.startsWith('/_next') ||         // Ignore Next.js internal paths
      pathname.startsWith('/api') ||           // Ignore API routes
      /\.(.*)$/.test(pathname) ||           // Ignore files with extensions (e.g., .ico, .png, .svg, .css, .js)
      pathname === '/favicon.ico'           // Explicitly ignore root favicon
      // Add any other specific root paths you want to ignore here
  ) {
      return; // Let the request proceed without locale modifications
  }
  // ---- END: Added Check ----


  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
      return; // Pathname already has locale, do nothing
  }

  // Redirect if there is no locale
  const locale = getLocale(request);
  const newPathname = `/${locale}${pathname === '/' ? '' : pathname}`; // Handle root path correctly

  request.nextUrl.pathname = newPathname;

  // Redirect to the new URL with the locale prefix
  return NextResponse.redirect(request.nextUrl);
}
 
// export const config = {
//   matcher: [
//     // Skip all internal paths (_next)
//     // '/((?!_next).*)',
//     '/((?!_next/static|_next/image|_next/public|api|.*\\..*).*)',
//   ],
// }