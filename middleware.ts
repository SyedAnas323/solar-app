export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/packages/:path*",
    "/calculator/:path*",
    "/customers/:path*",
    "/quotations/:path*",
    "/installations/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/inverters/:path*",
  ],
};
