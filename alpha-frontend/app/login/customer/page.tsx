import LoginForm from "@/components/auth/LoginForm";

export default function CustomerLoginPage() {
  return (
    <LoginForm
      role="customer"
      title="Vehicle Owner Login"
      subtitle="Shop for parts, request automotive services, and track your orders."
      redirectTo="/customer"
    />
  );
}