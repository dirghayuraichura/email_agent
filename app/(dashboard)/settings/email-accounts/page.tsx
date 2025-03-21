"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  AlertCircle, 
  Mail, 
  Plus, 
  Trash, 
  Edit, 
  Check, 
  X, 
  RefreshCw,
  ExternalLink
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getEmailAccounts,
  createEmailAccountAction,
  updateEmailAccountAction,
  deleteEmailAccountAction,
  testEmailAccountAction
} from "../../emails/action"
import { EmailProvider } from "@prisma/client"

// Define the email account type
interface EmailAccount {
  id: string
  name: string
  email: string
  provider: EmailProvider
  // Outgoing mail settings
  host?: string
  port?: number
  secure?: boolean
  username?: string
  password?: string
  fromName?: string
  // Incoming mail settings
  imapHost?: string
  imapPort?: number
  imapSecure?: boolean
  isActive: boolean
  credentials?: string | Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export default function EmailAccountsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    provider: "GMAIL" as EmailProvider,
    // Outgoing mail settings
    host: "",
    port: 587,
    secure: true,
    username: "",
    password: "",
    fromName: "",
    // Incoming mail settings
    imapHost: "",
    imapPort: 993,
    imapSecure: true,
  })

  // Fetch email accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accounts = await getEmailAccounts()
        setEmailAccounts(accounts.map(account => ({ ...account, isActive: true })) as EmailAccount[])
      } catch (error) {
        console.error("Error fetching email accounts:", error)
        toast({
          title: "Error",
          description: "Failed to load email accounts. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAccounts()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      provider: "GMAIL" as EmailProvider,
      host: "",
      port: 587,
      secure: true,
      username: "",
      password: "",
      fromName: "",
      imapHost: "",
      imapPort: 993,
      imapSecure: true,
    })
    setEditingAccount(null)
  }

  const handleAddAccount = () => {
    setIsDialogOpen(true)
    resetForm()
  }

  const handleEditAccount = (account: EmailAccount) => {
    setEditingAccount(account)
    
    // Parse credentials if they exist
    let credentials = {};
    if (account.credentials) {
      try {
        credentials = typeof account.credentials === 'string' 
          ? JSON.parse(account.credentials) 
          : account.credentials;
      } catch (e) {
        console.error("Failed to parse credentials:", e);
      }
    }

    // Use a typed credentials object with fallbacks
    const creds = credentials as any;
    
    setFormData({
      name: account.name,
      email: account.email,
      provider: account.provider,
      // Use values from credentials if available, otherwise fall back to account properties
      host: creds.host || account.host || "",
      port: creds.port || account.port || 587,
      secure: creds.secure !== undefined ? creds.secure : (account.secure !== undefined ? account.secure : true),
      username: creds.username || account.username || "",
      password: creds.password || account.password || "",
      fromName: creds.fromName || account.fromName || "",
      imapHost: creds.imapHost || account.imapHost || "",
      imapPort: creds.imapPort || account.imapPort || 993,
      imapSecure: creds.imapSecure !== undefined ? creds.imapSecure : (account.imapSecure !== undefined ? account.imapSecure : true),
    })
    setIsDialogOpen(true)
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this email account?")) {
      return
    }
    
    try {
      await deleteEmailAccountAction(accountId)
      
      // Update the local state
      setEmailAccounts(prev => prev.filter(account => account.id !== accountId))
      
      toast({
        title: "Account deleted",
        description: "Email account has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete email account. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (accountId: string, isActive: boolean) => {
    try {
      await updateEmailAccountAction(accountId, { active: isActive })
      
      // Update the local state
      setEmailAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, active: isActive } 
            : account
        )
      )
      
      toast({
        title: isActive ? "Account activated" : "Account deactivated",
        description: `Email account has been ${isActive ? "activated" : "deactivated"} successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email account. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    
    try {
      const result = await testEmailAccountAction({
        provider: formData.provider,
        host: formData.host || undefined,
        port: formData.port ? Number(formData.port) : undefined,
        secure: formData.secure,
        username: formData.username || "",
        password: formData.password,
      })
      
      if (result.success) {
        toast({
          title: "Connection successful",
          description: "Email account connection test was successful.",
        })
      } else {
        toast({
          title: "Connection failed",
          description: result.message || "Failed to connect to email server. Please check your settings.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to test email account connection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error("Please fill in all required fields.")
      }
      
      // For SMTP provider, validate host and port
      if (formData.provider === "SMTP" && (!formData.host || !formData.port)) {
        throw new Error("Host and port are required for SMTP connections.")
      }
      
      // Create credentials object with all our custom fields
      const credentials = {
        username: formData.username || "",
        password: formData.password,
        host: formData.host || "",
        port: formData.port ? Number(formData.port) : undefined,
        secure: formData.secure,
        fromName: formData.fromName || "",
        imapHost: formData.imapHost || "",
        imapPort: formData.imapPort ? Number(formData.imapPort) : undefined,
        imapSecure: formData.imapSecure,
      };
      
      if (editingAccount) {
        // Update existing account
        await updateEmailAccountAction(editingAccount.id, {
          name: formData.name,
          email: formData.email,
          provider: formData.provider,
          host: formData.host,
          port: formData.port ? Number(formData.port) : undefined,
          secure: formData.secure,
          username: formData.username,
          password: formData.password,
          fromName: formData.fromName,
          imapHost: formData.imapHost,
          imapPort: formData.imapPort ? Number(formData.imapPort) : undefined,
          imapSecure: formData.imapSecure,
          active: editingAccount.isActive
        })
        
        // Update the local state
        setEmailAccounts(prev => 
          prev.map(account => 
            account.id === editingAccount.id 
              ? { 
                  ...account, 
                  name: formData.name,
                  email: formData.email,
                  provider: formData.provider,
                  host: formData.host || undefined,
                  port: formData.port || undefined,
                  secure: formData.secure,
                  username: formData.username || undefined,
                  password: formData.password,
                  fromName: formData.fromName || undefined,
                  imapHost: formData.imapHost || undefined,
                  imapPort: formData.imapPort || undefined,
                  imapSecure: formData.imapSecure,
                  updatedAt: new Date(),
                } 
              : account
          )
        )
        
        toast({
          title: "Account updated",
          description: "Email account has been updated successfully.",
        })
      } else {
        // Create new account - removing the "as any" to ensure type safety
        const newAccount = await createEmailAccountAction({
          name: formData.name,
          email: formData.email,
          provider: formData.provider,
          host: formData.host || "",
          port: formData.port ? Number(formData.port) : undefined,
          secure: formData.secure,
          username: formData.username || "",
          password: formData.password,
          fromName: formData.fromName || "",
          imapHost: formData.imapHost || "",
          imapPort: formData.imapPort ? Number(formData.imapPort) : undefined,
          imapSecure: formData.imapSecure,
          active: true
        })
        
        // Update the local state with our custom fields not present in the API
        setEmailAccounts(prev => [...prev, { 
          ...newAccount, 
          isActive: true,
          fromName: formData.fromName || "",
          imapHost: formData.imapHost || "",
          imapPort: formData.imapPort || undefined,
          imapSecure: formData.imapSecure
        } as EmailAccount])
        
        toast({
          title: "Account created",
          description: "Email account has been created successfully.",
        })
      }
      
      // Close the dialog and reset the form
      setIsDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save email account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Email Accounts</h3>
          <p className="text-muted-foreground">
            Manage your email accounts for sending and receiving emails.
          </p>
        </div>
        <Button onClick={handleAddAccount}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : emailAccounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40 p-6">
            <Mail className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              You don't have any email accounts set up yet.
            </p>
            <Button onClick={handleAddAccount}>
              <Plus className="mr-2 h-4 w-4" />
              Add Email Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Email Accounts</CardTitle>
            <CardDescription>
              You have {emailAccounts.length} email account{emailAccounts.length !== 1 ? "s" : ""} configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>{account.provider}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${account.isActive ? "bg-green-500" : "bg-red-500"}`} />
                        <span>{account.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleActive(account.id, !account.isActive)}
                          title={account.isActive ? "Deactivate" : "Activate"}
                        >
                          {account.isActive ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditAccount(account)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteAccount(account.id)}
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Email Account" : "Add Email Account"}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Update your email account settings."
                : "Add a new email account to send and receive emails."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Work Email"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value) => handleSelectChange("provider", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GMAIL">Gmail</SelectItem>
                      <SelectItem value="OUTLOOK">Outlook</SelectItem>
                      <SelectItem value="SMTP">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name (Optional)</Label>
                  <Input
                    id="fromName"
                    name="fromName"
                    placeholder="Your Name"
                    value={formData.fromName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username (Optional)</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use email address as username
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabs for outgoing and incoming mail settings */}
              <Tabs defaultValue="outgoing" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="outgoing">Outgoing Mail (SMTP)</TabsTrigger>
                  <TabsTrigger value="incoming">Incoming Mail (IMAP)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="outgoing" className="space-y-4 mt-4">
                  {formData.provider === "SMTP" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="host">SMTP Host</Label>
                          <Input
                            id="host"
                            name="host"
                            placeholder="smtp.example.com"
                            value={formData.host}
                            onChange={handleChange}
                            required={formData.provider === "SMTP"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="port">SMTP Port</Label>
                          <Input
                            id="port"
                            name="port"
                            type="number"
                            placeholder="587"
                            value={formData.port}
                            onChange={handleChange}
                            required={formData.provider === "SMTP"}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="secure"
                          checked={formData.secure}
                          onCheckedChange={(checked) => handleSwitchChange("secure", checked)}
                        />
                        <Label htmlFor="secure">Use secure connection (TLS/SSL)</Label>
                      </div>
                    </>
                  )}

                  {formData.provider === "GMAIL" && (
                    <div className="bg-muted p-3 rounded-md flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="mb-1">
                          For Gmail accounts, you need to use an App Password instead of your regular password.
                        </p>
                        <a
                          href="https://support.google.com/accounts/answer/185833"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary flex items-center hover:underline"
                        >
                          Learn how to create an App Password
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="incoming" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="imapHost">IMAP Host</Label>
                      <Input
                        id="imapHost"
                        name="imapHost"
                        placeholder="imap.example.com"
                        value={formData.imapHost}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imapPort">IMAP Port</Label>
                      <Input
                        id="imapPort"
                        name="imapPort"
                        type="number"
                        placeholder="993"
                        value={formData.imapPort}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="imapSecure"
                      checked={formData.imapSecure}
                      onCheckedChange={(checked) => handleSwitchChange("imapSecure", checked)}
                    />
                    <Label htmlFor="imapSecure">Use secure connection (TLS/SSL)</Label>
                  </div>

                  {formData.provider === "GMAIL" && (
                    <div className="bg-muted p-3 rounded-md flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="mb-1">
                          For Gmail, IMAP access must be enabled in your Gmail settings.
                        </p>
                        <a
                          href="https://support.google.com/mail/answer/7126229"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary flex items-center hover:underline"
                        >
                          How to enable IMAP in Gmail
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || isSubmitting}
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 