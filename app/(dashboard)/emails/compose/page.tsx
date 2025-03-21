"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Send, Paperclip, Sparkles, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getEmailAccounts, sendEmailAction, getEmail, generateEmailWithAIAction } from "../action"
import { getLeads } from "../../leads/action"
import type { Lead } from "../../leads/action"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/lib/auth-context"

// Define the EmailAccount type
interface EmailAccount {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  provider: string;
  credentials: any;
  userId: string;
}

interface SelectOption {
  value: string
  label: string
}

// Add styles for react-select
const selectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    '&:hover': {
      borderColor: 'var(--border-hover)'
    }
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)'
  }),
  option: (base: any, state: { isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isFocused ? 'var(--accent)' : 'transparent',
    color: state.isFocused ? 'var(--accent-foreground)' : 'var(--foreground)',
    '&:hover': {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)'
    }
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: 'var(--accent)',
    color: 'var(--accent-foreground)'
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'var(--accent-foreground)'
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: 'var(--accent-foreground)',
    '&:hover': {
      backgroundColor: 'var(--destructive)',
      color: 'var(--destructive-foreground)'
    }
  })
}

export default function ComposeEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [to, setTo] = useState<string[]>([])
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [activeTab, setActiveTab] = useState("compose")
  
  // AI generation states
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiTone, setAiTone] = useState("professional")
  const [aiLength, setAiLength] = useState("medium")
  const [generatingEmail, setGeneratingEmail] = useState(false)
  
  // Reply/Forward states
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [forwardId, setForwardId] = useState<string | null>(null)
  const [originalEmail, setOriginalEmail] = useState<any>(null)
  const [loadingOriginalEmail, setLoadingOriginalEmail] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [recipientInputOpen, setRecipientInputOpen] = useState(false)

  useEffect(() => {
    const fetchEmailAccounts = async () => {
      try {
        const accounts = await getEmailAccounts()
        setEmailAccounts(accounts)
        if (accounts.length > 0) {
          setSelectedAccountId(accounts[0].id)
        }
      } catch (error) {
        console.error("Error fetching email accounts:", error)
        toast({
          title: "Error",
          description: "Failed to load email accounts. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingAccounts(false)
      }
    }

    fetchEmailAccounts()
    
    // Check for reply or forward parameters
    const replyParam = searchParams.get("replyTo")
    const forwardParam = searchParams.get("forward")
    
    if (replyParam) {
      setReplyToId(replyParam)
      fetchOriginalEmail(replyParam, "reply")
    } else if (forwardParam) {
      setForwardId(forwardParam)
      fetchOriginalEmail(forwardParam, "forward")
    }

    const fetchLeads = async () => {
      try {
        const fetchedLeads = await getLeads()
        setLeads(fetchedLeads)
      } catch (error) {
        console.error("Failed to fetch leads:", error)
        toast({
          title: "Error",
          description: "Failed to load leads. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchLeads()
  }, [searchParams, toast])
  
  const fetchOriginalEmail = async (emailId: string, type: "reply" | "forward") => {
    setLoadingOriginalEmail(true)
    try {
      const email = await getEmail(emailId)
      setOriginalEmail(email)
      
      if (type === "reply") {
        setTo([email.fromAccount?.email || ""])
        setSubject(`Re: ${email.subject}`)
        setBody(`\n\n------- Original Message -------\nFrom: ${email.fromAccount?.name || email.fromAccount?.email || "Unknown"}\nDate: ${new Date(email.sentAt || email.createdAt).toLocaleString()}\nSubject: ${email.subject}\n\n${email.body}`)
      } else if (type === "forward") {
        setSubject(`Fwd: ${email.subject}`)
        setBody(`\n\n------- Forwarded Message -------\nFrom: ${email.fromAccount?.name || email.fromAccount?.email || "Unknown"}\nTo: ${email.toAccount?.name || email.toAccount?.email || "Unknown"}\nDate: ${new Date(email.sentAt || email.createdAt).toLocaleString()}\nSubject: ${email.subject}\n\n${email.body}`)
      }
    } catch (error) {
      console.error("Error fetching original email:", error)
      toast({
        title: "Error",
        description: "Failed to load the original email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingOriginalEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await sendEmail()
  }
  
  // Separate the email sending logic from the event handler
  const sendEmail = async () => {
    if (!selectedAccountId) {
      toast({
        title: "Error",
        description: "Please select an email account to send from.",
        variant: "destructive",
      })
      return
    }
    
    if (to.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one recipient.",
        variant: "destructive",
      })
      return
    }
    
    if (!subject) {
      toast({
        title: "Error",
        description: "Please enter a subject for your email.",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    try {
      await sendEmailAction({
        fromAccountId: selectedAccountId,
        to: to.join(','),
        subject,
        body,
        htmlBody: undefined,
        replyToId: replyToId || undefined,
      })
      
      toast({
        title: "Email sent",
        description: "Your email has been sent successfully.",
      })
      
      router.push("/emails")
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Handler for the button click
  const handleSendButtonClick = () => {
    sendEmail()
  }

  const handleGenerateWithAI = async () => {
    if (!aiPrompt) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the AI to generate an email.",
        variant: "destructive",
      })
      return
    }
    
    setGeneratingEmail(true)
    try {
      // First, try to get user's configured models
      const userModels = await fetch('/api/ai-models').then(res => res.json())
      console.log(userModels,"USERMODELS")
      
      if (!userModels || userModels.length === 0) {
        toast({
          title: "No AI models configured",
          description: "Please configure an AI model in the AI Models tab before generating emails.",
          variant: "destructive",
        })
        setActiveTab("compose") // Switch back to compose tab
        return
      }
      
      // Use the first model (or preferred model if available)
      const modelToUse = userModels[0]
      
      // Generate email with user's model
      const result = await generateEmailWithAIAction({
        prompt: aiPrompt,
        modelId: modelToUse.id,
        tone: aiTone,
        length: aiLength,
      })
      
      setBody(result.content)
      setActiveTab("compose")
      
      toast({
        title: "Email generated",
        description: `Generated using ${modelToUse.name} model.`,
      })
    } catch (error) {
      console.error("Error generating email with AI:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate email with AI. Please check your model configuration.",
        variant: "destructive",
      })
    } finally {
      setGeneratingEmail(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Compose Email</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Email</CardTitle>
          <CardDescription>
            {replyToId ? "Reply to an email" : forwardId ? "Forward an email" : "Compose a new email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Select 
                value={selectedAccountId} 
                onValueChange={setSelectedAccountId}
                disabled={loadingAccounts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an email account" />
                </SelectTrigger>
                <SelectContent>
                  {emailAccounts.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No email accounts found
                    </SelectItem>
                  ) : (
                    emailAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                {leads
                  .filter(lead => to.includes(lead.email))
                  .map(lead => (
                    <Badge key={lead.email} variant="secondary" className="flex items-center gap-1">
                      {lead.name || lead.email}
                      <button
                        type="button"
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onClick={() => setTo(to.filter(email => email !== lead.email))}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {lead.name || lead.email}</span>
                      </button>
                    </Badge>
                  ))}
                <Popover open={recipientInputOpen} onOpenChange={setRecipientInputOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={recipientInputOpen}
                      className="h-8 justify-between"
                    >
                      Add recipient...
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search leads..." />
                      <CommandEmpty>No leads found.</CommandEmpty>
                      <CommandGroup>
                        {leads
                          .filter(lead => !to.includes(lead.email))
                          .map(lead => (
                            <CommandItem
                              key={lead.email}
                              onSelect={() => {
                                setTo([...to, lead.email])
                                setRecipientInputOpen(false)
                              }}
                            >
                              {lead.name || 'Unnamed Lead'} ({lead.email})
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cc">CC</Label>
                <Input 
                  id="cc" 
                  placeholder="cc@example.com" 
                  value={cc} 
                  onChange={(e) => setCc(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bcc">BCC</Label>
                <Input 
                  id="bcc" 
                  placeholder="bcc@example.com" 
                  value={bcc} 
                  onChange={(e) => setBcc(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="Email subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                disabled={loadingOriginalEmail}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="compose">Compose Email</TabsTrigger>
                <TabsTrigger value="ai">Generate with AI</TabsTrigger>
              </TabsList>
              
              <TabsContent value="compose" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea 
                    id="body" 
                    placeholder="Write your email here..." 
                    className="min-h-[200px]" 
                    value={body} 
                    onChange={(e) => setBody(e.target.value)}
                    disabled={loadingOriginalEmail}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button type="button" variant="outline" size="sm">
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attach Files
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">What would you like the AI to write?</Label>
                  <Textarea 
                    id="ai-prompt" 
                    placeholder="E.g., Write a follow-up email to a client who hasn't responded in two weeks about our project proposal." 
                    className="min-h-[100px]" 
                    value={aiPrompt} 
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={aiTone} onValueChange={setAiTone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="length">Length</Label>
                    <Select value={aiLength} onValueChange={setAiLength}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="include-context" />
                  <Label htmlFor="include-context">Include original email context (for replies/forwards)</Label>
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleGenerateWithAI}
                  disabled={generatingEmail || !aiPrompt}
                  className="w-full"
                >
                  {generatingEmail ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Email
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendButtonClick} 
            disabled={loading || !selectedAccountId || to.length === 0 || !subject}
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

