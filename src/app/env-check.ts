export function checkEnvVariables() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Missing environment variable: ${envVar}`);
    }
  }
}
