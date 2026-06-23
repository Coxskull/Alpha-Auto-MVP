import LoginForm from "@/components/auth/LoginForm";

export default function ProviderLoginPage() {
  return (
    <LoginForm
      role="provider"
      title="Provider Login"
      subtitle="Manage supplier orders and fulfillment."
      redirectTo="/provider/dashboard"
    />
  );
}