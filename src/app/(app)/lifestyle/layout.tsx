import { LifestyleTabs } from "@/components/lifestyle/lifestyle-tabs";

export default function LifestyleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <LifestyleTabs />
      {children}
    </div>
  );
}
