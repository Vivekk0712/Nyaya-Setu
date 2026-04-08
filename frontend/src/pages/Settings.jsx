import { User, Globe, ShieldCheck, Bell } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-foreground">{user?.name || "User Name"}</h2>
              <p className="text-xs text-muted-foreground">{user?.email || "user@email.com"}</p>
              <p className="text-xs text-muted-foreground">Address: [Your Address]</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        </div>

        {/* DigiLocker */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" /> Identity Verification
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">DigiLocker</p>
                <p className="text-xs text-muted-foreground">Connect for verified identity</p>
              </div>
              <Button size="sm" variant="outline">Connect</Button>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Language Preference
          </h3>
          <div className="flex gap-2">
            <Button size="sm" className="text-xs">English</Button>
            <Button size="sm" variant="outline" className="text-xs">हिंदी (Hindi)</Button>
            <Button size="sm" variant="outline" className="text-xs">தமிழ் (Tamil)</Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notifications
          </h3>
          <div className="space-y-3">
            {["Case status updates", "Auto-nudge alerts", "Legal tips & news"].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-card after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-card border border-destructive/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h3>
          <p className="text-xs text-muted-foreground mb-3">Delete your account and all associated data</p>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
