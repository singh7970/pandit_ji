"use client";
import { PageHeader, EmptyState } from "@/components/ui";
export default function PaymentsPage() {
  return (
    <div>
      <PageHeader title="Payments" subtitle="Razorpay payment records" />
      <EmptyState message="Payments data coming soon — connect Razorpay webhook first" />
    </div>
  );
}
