import DashboardLayout from "../components/dashboardLayout";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}