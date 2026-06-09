import DashboardLayout from '../components/dashboardLayout';

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
