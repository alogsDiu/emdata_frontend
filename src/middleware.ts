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
 
export function middleware(request:NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
 
  if (pathnameHasLocale) return
 
  const locale = getLocale(request);//russian if not lang supported 
  
  request.nextUrl.pathname = `/${locale}${pathname}` 
  
  // e.g. incoming request is /products
  // The new URL is now /en-US/products
  return NextResponse.redirect(request.nextUrl)
}
 
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
  ],
}