import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isLogin = pathname.startsWith("/admin/login");

  if (!isLogin) {
    const cookieStore = await cookies();
    if (cookieStore.get("admin-session")?.value !== "1") {
      redirect("/admin/login");
    }
  }

  return <>{children}</>;
}
