import DashboardLayout from '../components/dashboardLayout';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
