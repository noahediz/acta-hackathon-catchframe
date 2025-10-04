import { auth } from "@/auth"
import { DEFAULT_REDIRECT, PUBLIC_ROUTES, ROOT } from "@/lib/routes";

// Or like this if you need to do something here.
export default auth((req) => {
  const { nextUrl } = req; // Extract the nextUrl (requested URL) from the request object

  // Check if the user is authenticated (i.e., if the 'auth' property exists in the request)
  const isAuthenticated = !!req.auth;

  // Check if the current route is a public route (i.e., if it's listed in the PUBLIC_ROUTES array)
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);

  // If the route is public and the user is authenticated, redirect them to the default redirect URL
  if (isPublicRoute && isAuthenticated) {
    return Response.redirect(new URL(DEFAULT_REDIRECT, nextUrl)); // Redirect to the default page if logged in
  }

  // If the route is not public and the user is not authenticated, redirect them to the root (login) page
  if (!isAuthenticated && !isPublicRoute) {
    return Response.redirect(new URL(ROOT, nextUrl)); // Redirect to the root URL (e.g., login) if not authenticated
  }

  // Optionally log in the middleware the user session. Remove in production mode
  console.log(req.auth) //  { session: { user: { ... } } }
})

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Files with extensions (images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot)).*)",
  ],
}