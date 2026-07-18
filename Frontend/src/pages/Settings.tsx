import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
// import useDarkMode from "@/hooks/use-dark-mode";

import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Users, 
  Mail, 
  Database,
  Save,
  AlertTriangle,
  Plus,
  Trash2,
  Moon,
  Sun 
} from "lucide-react";

const Settings = () => {
  const [riskThresholds, setRiskThresholds] = useState({
    low: 40,
    high: 70
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    dailyReports: true,
    highRiskAlerts: true,
    systemUpdates: false
  });

  const [emailSettings, setEmailSettings] = useState({
    alertRecipients: "admin@ecommerce.com, risk@ecommerce.com",
    reportRecipients: "management@ecommerce.com",
    alertFrequency: "immediate"
  });

  // const { isDark, toggleDarkMode } = useDarkMode();
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved successfully",
      description: "Your configuration has been updated.",
    });
  };

  const riskRules = [
    { id: 1, name: "High Return Rate", condition: "Return rate > 50%", weight: 30, active: true },
    { id: 2, name: "Quick Returns", condition: "Return within 1 day", weight: 25, active: true },
    { id: 3, name: "Vague Reasons", condition: "Reason contains 'defective'", weight: 20, active: true },
    { id: 4, name: "Category Risk", condition: "Fashion category", weight: 15, active: false },
    { id: 5, name: "Multiple Flags", condition: "Previous fraud flags", weight: 35, active: true }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">System Settings</h2>
            <p className="text-muted-foreground">Configure risk analysis parameters and system preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Scoring Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Scoring Settings
            </CardTitle>
            <CardDescription>Configure risk score thresholds and calculation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="lowThreshold">Low Risk Threshold (0-{riskThresholds.low})</Label>
                <Input
                  id="lowThreshold"
                  type="number"
                  value={riskThresholds.low}
                  onChange={(e) => setRiskThresholds({...riskThresholds, low: parseInt(e.target.value)})}
                  className="mt-1"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="highThreshold">High Risk Threshold ({riskThresholds.high}-100)</Label>
                <Input
                  id="highThreshold"
                  type="number"
                  value={riskThresholds.high}
                  onChange={(e) => setRiskThresholds({...riskThresholds, high: parseInt(e.target.value)})}
                  className="mt-1"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Risk Calculation Rules</h4>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
              <div className="space-y-3">
                {riskRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch checked={rule.active} onCheckedChange={() => {}} />
                      <div>
                        <p className="font-medium text-sm">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">{rule.condition}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Weight: {rule.weight}</Badge>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure alerts and notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                { id: "emailAlerts", label: "Email Alerts", desc: "Receive email notifications for high-risk events" },
                { id: "dailyReports", label: "Daily Reports", desc: "Automatic daily summary reports" },
                { id: "highRiskAlerts", label: "High Risk Alerts", desc: "Immediate alerts for high-risk customers" },
                { id: "systemUpdates", label: "System Updates", desc: "Notifications about system maintenance" }
              ].map((item) => (
                <div className="flex items-center justify-between" key={item.id}>
                  <div>
                    <Label htmlFor={item.id}>{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    id={item.id}
                    checked={notifications[item.id as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, [item.id]: checked })
                    }
                  />
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Email Configuration</h4>
              <div>
                <Label htmlFor="alertRecipients">Alert Recipients</Label>
                <Textarea
                  id="alertRecipients"
                  value={emailSettings.alertRecipients}
                  onChange={(e) => setEmailSettings({ ...emailSettings, alertRecipients: e.target.value })}
                  className="mt-1"
                  rows={2}
                  placeholder="email1@company.com, email2@company.com"
                />
              </div>
              <div>
                <Label htmlFor="alertFrequency">Alert Frequency</Label>
                <Select
                  value={emailSettings.alertFrequency}
                  onValueChange={(value) =>
                    setEmailSettings({ ...emailSettings, alertFrequency: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Configuration
            </CardTitle>
            <CardDescription>General system settings and data management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="dataRetention">Data Retention Period (days)</Label>
                <Input id="dataRetention" type="number" defaultValue="365" className="mt-1" min="30" max="2555" />
              </div>
              <div>
                <Label htmlFor="apiRate">API Rate Limit (requests/minute)</Label>
                <Input id="apiRate" type="number" defaultValue="1000" className="mt-1" min="100" />
              </div>
              <div>
                <Label htmlFor="batchSize">Batch Processing Size</Label>
                <Input id="batchSize" type="number" defaultValue="500" className="mt-1" min="50" max="2000" />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Danger Zone
              </h4>

<div className="p-4 border rounded-lg bg-red-100 text-red-900 dark:bg-[#2a1a1a] dark:border-[#553333] dark:text-red-300">
                <h5 className="font-medium text-red-800 mb-2">Reset All Settings</h5>
                <p className="text-sm text-red-600 mb-3">This will reset all configuration to factory defaults.</p>
                <Button variant="destructive" size="sm">Reset Settings</Button>
              </div>

<div className="p-4 border rounded-lg bg-red-100 text-red-900 dark:bg-[#2a1a1a] dark:border-[#553333] dark:text-red-300">
                <h5 className="font-medium text-red-800 mb-2">Clear All Data</h5>
                <p className="text-sm text-red-600 mb-3">Permanently delete all customer data and analytics.</p>
                <Button variant="destructive" size="sm">Clear Data</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage admin users and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Current Users</h4>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>

              {[
                { name: "Admin User", email: "admin@ecommerce.com", role: "Administrator", active: true },
                { name: "Risk Manager", email: "risk@ecommerce.com", role: "Risk Analyst", active: true },
                { name: "Data Analyst", email: "data@ecommerce.com", role: "Viewer", active: false }
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={user.active ? "default" : "secondary"}>{user.role}</Badge>
                    <Switch checked={user.active} />
                    <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Session Settings</h4>

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input id="sessionTimeout" type="number" defaultValue="60" className="mt-1" min="15" max="480" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="forcePassword">Force Password Reset</Label>
                  <p className="text-sm text-muted-foreground">Require all users to reset passwords</p>
                </div>
                <Button variant="outline" size="sm">Force Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;
