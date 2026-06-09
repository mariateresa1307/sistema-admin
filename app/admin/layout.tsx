import DashboardLayout from '../components/dashboardLayout';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
