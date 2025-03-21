import { useUser } from "@clerk/nextjs";
import { UserRole } from "@/lib/auth";
import { redirect } from "next/navigation";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGate = ({
  children,
  allowedRole,
}: RoleGateProps) => {
  const { user } = useUser();
  const userRole = user?.publicMetadata.role as UserRole;

  if (!userRole) {
    redirect("/");
  }

  if (userRole !== allowedRole && userRole !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
};
