// Kinde session gate for the admin area. Role checks happen per-page
// against the admins table (see lib/admin-auth.ts).
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth({
  loginPage: "/api/auth/login",
});

export const config = {
  matcher: ["/admin/:path*"],
};
