import { ProfileLayout } from "@/components/profile/profile-layout";

export default function ProfileRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileLayout>{children}</ProfileLayout>;
}
