import LoginForm from "@/components/auth/LoginForm";

export default function DriverLoginPage() {
  return (
    <LoginForm
      role="driver"
      title="Driver Login"
      subtitle="Manage pickups and deliveries."
      redirectTo="/driver/dashboard"
    />
  );
}