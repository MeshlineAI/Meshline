import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Scan history, batch portfolio scans, alerts, and MESH staking.",
};

export default function DashboardPage() {
  return (
    <PageShell>
      <div className="pb-24">
        <DashboardContent />
      </div>
    </PageShell>
  );
}
