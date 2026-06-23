import LoginForm from "@/components/auth/LoginForm";

export default function AdminLoginPage() {
  return (
    <LoginForm
      role="admin"
      title="Mission Control Login"
      subtitle="Access dispatcher and admin operations."
      redirectTo="/mission-control/dashboard"
    />
  );
}