import DashboardLayout from '../components/dashboardLayout';

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
