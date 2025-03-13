"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [generalSettings, setGeneralSettings] = useState({
    companyName: "AI Email Automation Inc.",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    language: "en-US",
  })

  const [emailSettings, setEmailSettings] = useState({
    emailSignature: "Best regards,\nThe AI Email Team",
    defaultSender: "sales@aiemail.com",
    replyTo: "support@aiemail.com",
    ccAdmin: false,
    batchSending: true,
    sendLimit: "100",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    leadAssigned: true,
    leadResponded: true,
    appointmentScheduled: true,
    dailyDigest: true,
    weeklyReport: true,
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    googleCalendar: false,
    outlook: true,
    slack: false,
    zapier: true,
    hubspot: false,
    salesforce: false,
  })

  const handleSaveGeneral = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast({
      title: "Settings saved",
      description: "Your general settings have been updated successfully.",
    })
  }

  const handleSaveEmail = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast({
      title: "Email settings saved",
      description: "Your email settings have been updated successfully.",
    })
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated successfully.",
    })
  }

  const handleSaveIntegrations = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast({
      title: "Integration settings saved",
      description: "Your integration settings have been updated successfully.",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your account and application preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={generalSettings.companyName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <select
                    id="dateFormat"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={generalSettings.dateFormat}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={generalSettings.language}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="ja-JP">Japanese</option>
                </select>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p>{user?.name || "Admin User"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{user?.email || "admin@example.com"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Role</Label>
                    <p>{user?.role || "Administrator"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Account Created</Label>
                    <p>January 15, 2023</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure your email sending preferences and defaults.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailSignature">Default Email Signature</Label>
                <textarea
                  id="emailSignature"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={emailSettings.emailSignature}
                  onChange={(e) => setEmailSettings({ ...emailSettings, emailSignature: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultSender">Default Sender Email</Label>
                  <Input
                    id="defaultSender"
                    value={emailSettings.defaultSender}
                    onChange={(e) => setEmailSettings({ ...emailSettings, defaultSender: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replyTo">Reply-To Email</Label>
                  <Input
                    id="replyTo"
                    value={emailSettings.replyTo}
                    onChange={(e) => setEmailSettings({ ...emailSettings, replyTo: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Sending Options</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ccAdmin">CC Admin on All Emails</Label>
                    <p className="text-sm text-muted-foreground">Send a copy of all outgoing emails to the admin</p>
                  </div>
                  <Switch
                    id="ccAdmin"
                    checked={emailSettings.ccAdmin}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, ccAdmin: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="batchSending">Enable Batch Sending</Label>
                    <p className="text-sm text-muted-foreground">Send emails in batches to avoid rate limits</p>
                  </div>
                  <Switch
                    id="batchSending"
                    checked={emailSettings.batchSending}
                    onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, batchSending: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sendLimit">Daily Send Limit</Label>
                  <Input
                    id="sendLimit"
                    type="number"
                    value={emailSettings.sendLimit}
                    onChange={(e) => setEmailSettings({ ...emailSettings, sendLimit: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveEmail} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage when and how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <h3 className="text-lg font-medium">Notification Events</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="leadAssigned">Lead Assigned</Label>
                  <Switch
                    id="leadAssigned"
                    checked={notificationSettings.leadAssigned}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, leadAssigned: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="leadResponded">Lead Responded</Label>
                  <Switch
                    id="leadResponded"
                    checked={notificationSettings.leadResponded}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, leadResponded: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="appointmentScheduled">Appointment Scheduled</Label>
                  <Switch
                    id="appointmentScheduled"
                    checked={notificationSettings.appointmentScheduled}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, appointmentScheduled: checked })
                    }
                  />
                </div>
              </div>

              <Separator />

              <h3 className="text-lg font-medium">Summary Reports</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dailyDigest">Daily Digest</Label>
                  <Switch
                    id="dailyDigest"
                    checked={notificationSettings.dailyDigest}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, dailyDigest: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="weeklyReport">Weekly Report</Label>
                  <Switch
                    id="weeklyReport"
                    checked={notificationSettings.weeklyReport}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, weeklyReport: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect with other services and platforms.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Google Calendar</h4>
                      <p className="text-sm text-muted-foreground">Sync appointments with Google Calendar</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrationSettings.googleCalendar}
                    onCheckedChange={(checked) =>
                      setIntegrationSettings({ ...integrationSettings, googleCalendar: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Microsoft Outlook</h4>
                      <p className="text-sm text-muted-foreground">Sync emails and calendar with Outlook</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrationSettings.outlook}
                    onCheckedChange={(checked) => setIntegrationSettings({ ...integrationSettings, outlook: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M22 8.01c0 10-7 12-10 12s-10-2-10-12c0-1.5.5-2 2-2h16c1.5 0 2 .5 2 2Z" />
                        <path d="M17 12.5c-1.5 0-3 .5-3 2s1.5 2 3 2 3-.5 3-2-1.5-2-3-2Z" />
                        <path d="M7 12.5c-1.5 0-3 .5-3 2s1.5 2 3 2 3-.5 3-2-1.5-2-3-2Z" />
                        <path d="M12 2v6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Slack</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications in Slack</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrationSettings.slack}
                    onCheckedChange={(checked) => setIntegrationSettings({ ...integrationSettings, slack: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Zapier</h4>
                      <p className="text-sm text-muted-foreground">Connect with 3,000+ apps</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrationSettings.zapier}
                    onCheckedChange={(checked) => setIntegrationSettings({ ...integrationSettings, zapier: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M16.5 9.4 7.55 4.24" />
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.29 7 12 12 20.71 7" />
                        <line x1="12" x2="12" y1="22" y2="12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">HubSpot</h4>
                      <p className="text-sm text-muted-foreground">Sync contacts and leads with HubSpot</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrationSettings.hubspot}
                    onCheckedChange={(checked) => setIntegrationSettings({ ...integrationSettings, hubspot: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M17 6.1H3" />
                        <path d="M21 12.1H3" />
                        <path d="M15.1 18H3" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Salesforce</h4>
                      <p className="text-sm text-muted-foreground">Sync with Salesforce CRM</p>
                    </div>
                  </div>
                  <Switch
                    checked={integrationSettings.salesforce}
                    onCheckedChange={(checked) =>
                      setIntegrationSettings({ ...integrationSettings, salesforce: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveIntegrations} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

