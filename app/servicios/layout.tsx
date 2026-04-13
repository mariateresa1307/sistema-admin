import DashboardLayout from '../components/DashboardLayout';

export default function ServiciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
