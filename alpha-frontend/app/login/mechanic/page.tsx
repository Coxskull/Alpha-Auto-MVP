import LoginForm from "@/components/auth/LoginForm";

export default function MechanicLoginPage() {
  return (
    <LoginForm
      role="mechanic"
      title="Mechanic Login"
      subtitle="Manage service jobs and repair requests."
      redirectTo="/mechanic/dashboard"
    />
  );
}