import { ComingSoon } from "@/components/coming-soon";

export default function SettingsPage() {
  return (
    <div className="container p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and app preferences</p>
      </div>
      <ComingSoon />
    </div>
  );
}
