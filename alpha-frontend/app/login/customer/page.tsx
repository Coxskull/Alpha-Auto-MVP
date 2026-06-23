import LoginForm from "@/components/auth/LoginForm";

export default function CustomerLoginPage() {
  return (
    <LoginForm
      role="customer"
      title="Customer Login"
      subtitle="Shop parts and track your orders."
      redirectTo="/customer"
    />
  );
}