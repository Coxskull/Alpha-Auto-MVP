import type {
  ReactNode,
} from "react";

type VerificationLayoutProps = {
  children: ReactNode;
};

export default function VerificationLayout({
  children,
}: VerificationLayoutProps) {
  return <>{children}</>;
}