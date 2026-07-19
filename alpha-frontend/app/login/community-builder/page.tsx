import LoginForm from "@/components/auth/LoginForm";

export default function CommunityBuilderLoginPage() {
  return (
    <LoginForm
      role="community_builder"
      title="Community Builder Login"
      subtitle="Build your local Alpha network and monitor real business activity."
      redirectTo="/entrepreneur/dashboard"
    />
  );
}