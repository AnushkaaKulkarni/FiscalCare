"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Shield, Bell, Database, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export function Settings() {
  const { logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [profileData, setProfileData] = useState({
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    business: "Kumar Enterprises",
    gstNumber: "18AABCT1234H1Z0",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    filingReminders: true,
    weeklyReports: false,
    errorNotifications: true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: "Oct 5, 2024",
    loginAttempts: "3 failed attempts in last 30 days",
  })

  const dataConnections = [
    { name: "Tally Integration", status: "connected", lastSync: "Oct 19, 2024" },
    { name: "QuickBooks Integration", status: "disconnected", lastSync: "N/A" },
    { name: "Bank Feed Connection", status: "connected", lastSync: "Oct 19, 2024" },
  ]

  const handleSignOutAllDevices = () => {
    logout()
    toast({
      title: "Signed Out",
      description: "You've been signed out securely from all devices.",
      variant: "default",
    })
    router.push("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account, security, and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="mt-2 bg-background/50 border-border/40"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="mt-2 bg-background/50 border-border/40"
                />
              </div>
              <div>
                <Label htmlFor="business" className="text-foreground">
                  Business Name
                </Label>
                <Input
                  id="business"
                  value={profileData.business}
                  onChange={(e) => setProfileData({ ...profileData, business: e.target.value })}
                  className="mt-2 bg-background/50 border-border/40"
                />
              </div>
              <div>
                <Label htmlFor="gst" className="text-foreground">
                  GST Number
                </Label>
                <Input
                  id="gst"
                  value={profileData.gstNumber}
                  disabled
                  className="mt-2 bg-background/50 border-border/40 opacity-60"
                />
              </div>
              <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
            </div>
            <div className="space-y-4">
              {[
                {
                  key: "emailAlerts",
                  label: "Email Alerts",
                  description: "Receive email notifications for important updates",
                },
                {
                  key: "filingReminders",
                  label: "Filing Reminders",
                  description: "Get reminders before filing deadlines",
                },
                { key: "weeklyReports", label: "Weekly Reports", description: "Receive weekly summary reports" },
                {
                  key: "errorNotifications",
                  label: "Error Notifications",
                  description: "Get notified about data errors and anomalies",
                },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                  <div>
                    <p className="font-medium text-foreground">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        [setting.key]: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded border-border/40"
                  />
                </div>
              ))}
              <Button className="w-full bg-primary hover:bg-primary/90">Save Preferences</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <Lock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Password & Authentication</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground mb-2">Last Password Change</p>
                <p className="font-medium text-foreground">{securitySettings.lastPasswordChange}</p>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                Change Password
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {securitySettings.twoFactorEnabled
                  ? "Two-factor authentication is enabled"
                  : "Add an extra layer of security to your account"}
              </p>
              <Button variant={securitySettings.twoFactorEnabled ? "outline" : "default"} className="w-full">
                {securitySettings.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Login Activity</h3>
            <div className="p-4 rounded-lg bg-background/50">
              <p className="text-sm text-muted-foreground mb-2">Recent Activity</p>
              <p className="font-medium text-foreground">{securitySettings.loginAttempts}</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 space-y-6">
          <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <Database className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Data Connections</h3>
            </div>
            <div className="space-y-3">
              {dataConnections.map((connection, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/40"
                >
                  <div>
                    <p className="font-medium text-foreground">{connection.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {connection.status === "connected" ? `Last synced: ${connection.lastSync}` : "Not connected"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        connection.status === "connected"
                          ? "bg-green-500/10 text-green-700"
                          : "bg-gray-500/10 text-gray-700"
                      }`}
                    >
                      {connection.status === "connected" ? "Connected" : "Disconnected"}
                    </span>
                    <Button size="sm" variant="outline">
                      {connection.status === "connected" ? "Manage" : "Connect"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 border border-red-500/20 bg-red-500/5 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <Button
            onClick={handleSignOutAllDevices}
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out from All Devices
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent hover:bg-red-500/10"
          >
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  )
}
