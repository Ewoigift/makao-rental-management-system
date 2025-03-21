import { currentUser } from "@clerk/nextjs";

export type UserRole = 'admin' | 'landlord';

export async function getUserRole(): Promise<UserRole | null> {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  // Get the role from user metadata
  const role = user.publicMetadata.role as UserRole;
  return role || 'landlord'; // Default to landlord if no role is set
}

export function hasRequiredRole(userRole: UserRole | null, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  // Admin has access to everything
  if (userRole === 'admin') return true;
  
  // For other roles, must match exactly
  return userRole === requiredRole;
}
