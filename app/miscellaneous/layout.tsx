import DashboardLayout from "../components/dashboardLayout";

export default function MiscellaneousLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}