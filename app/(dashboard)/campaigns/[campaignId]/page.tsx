"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useCampaign, type CampaignPatient, type Campaign } from "@/contexts/campaign-context"
import { usePatients } from "@/contexts/patient-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Bot,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessagesSquare,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Smile,
  Frown,
  Meh,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  Activity,
  Brain,
  Plus,
  X,
  Settings,
  Smartphone,
  RefreshCw
} from "lucide-react"
import { format, addDays, setHours, setMinutes, isSameDay, isAfter, isBefore } from "date-fns"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AICallIntegration } from "@/components/ai-call-calendar-integration"

const statusConfig = {
  not_contacted: { label: 'Not Contacted', color: 'bg-slate-100 text-slate-700', icon: Clock },
  contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-700', icon: Phone },
  interested: { label: 'Interested', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
  not_interested: { label: 'Not Interested', color: 'bg-red-100 text-red-700', icon: XCircle },
  scheduled: { label: 'Scheduled', color: 'bg-amber-100 text-amber-700', icon: Calendar },
  screened: { label: 'Screened', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  enrolled: { label: 'Enrolled', color: 'bg-green-600 text-white', icon: CheckCircle },
}

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { getCampaignById, updatePatientStatus, updateScreeningCriteria } = useCampaign()
  const { patients, updatePatient } = usePatients()
  const campaignId = params?.campaignId as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<CampaignPatient | null>(null)
  const [contactNotes, setContactNotes] = useState("")
  const [newStatus, setNewStatus] = useState<CampaignPatient['status']>('contacted')
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedCallTranscript, setSelectedCallTranscript] = useState<any | null>(null)
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false)
  const [overrideTag, setOverrideTag] = useState<string>("")
  const [overrideStatus, setOverrideStatus] = useState<string>("")
  const [overrideReason, setOverrideReason] = useState("")
  const [showAICallIntegration, setShowAICallIntegration] = useState(false)

  // Calendar-specific state
  interface TimeSlot {
    id: string
    date: Date
    startTime: string
    endTime: string
    available: boolean
    patientId?: string
    patientName?: string
    studyId?: string
    status: 'available' | 'booked' | 'pending' | 'completed'
  }

  interface CalendarSettings {
    defaultSlotDuration: number
    bufferTime: number
    workingHours: { start: string; end: string }
    workingDays: string[]
    maxSlotsPerDay: number
    autoConfirm: boolean
  }

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [showAddSlotDialog, setShowAddSlotDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPatientForBooking, setSelectedPatientForBooking] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date())
  const [aiBookingsCount, setAiBookingsCount] = useState(0)

  const [settings, setSettings] = useState<CalendarSettings>({
    defaultSlotDuration: 30,
    bufferTime: 15,
    workingHours: { start: "09:00", end: "17:00" },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    maxSlotsPerDay: 10,
    autoConfirm: true
  })

  const [newSlot, setNewSlot] = useState({
    date: new Date(),
    startTime: "09:00",
    endTime: "09:30",
    recurring: false,
    recurringDays: 0
  })

  // Load campaign by ID on mount
  useEffect(() => {
    if (campaignId) {
      const foundCampaign = getCampaignById(campaignId)
      setCampaign(foundCampaign || null)
    }
  }, [campaignId, getCampaignById])

  // Calendar utility functions
  const generateMockSlots = () => {
    const slots: TimeSlot[] = []
    const date = selectedDate
    const [startHour, startMin] = settings.workingHours.start.split(':').map(Number)
    const [endHour, endMin] = settings.workingHours.end.split(':').map(Number)
    let currentTime = setMinutes(setHours(date, startHour), startMin)
    const endTime = setMinutes(setHours(date, endHour), endMin)

    while (isBefore(currentTime, endTime)) {
      const slotEndTime = new Date(currentTime.getTime() + settings.defaultSlotDuration * 60000)
      const isBooked = Math.random() > 0.7

      slots.push({
        id: `slot_${currentTime.getTime()}`,
        date: date,
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(slotEndTime, 'HH:mm'),
        available: !isBooked,
        status: isBooked ? 'booked' : 'available',
        ...(isBooked && {
          patientId: `patient_${Math.floor(Math.random() * 100)}`,
          patientName: campaign?.patients[Math.floor(Math.random() * (campaign?.patients.length || 1))]?.name || `Patient ${Math.floor(Math.random() * 100)}`,
          studyId: campaign?.studyName || 'Study'
        })
      })

      currentTime = new Date(slotEndTime.getTime() + settings.bufferTime * 60000)
    }

    setTimeSlots(slots)
  }

  const addTimeSlot = () => {
    const { date, startTime, endTime, recurring, recurringDays } = newSlot
    const slots: TimeSlot[] = []
    const days = recurring ? recurringDays : 1

    for (let i = 0; i < days; i++) {
      const slotDate = addDays(date, i)
      const dayName = format(slotDate, 'EEEE').toLowerCase()
      if (!settings.workingDays.includes(dayName)) continue

      slots.push({
        id: `slot_${Date.now()}_${i}`,
        date: slotDate,
        startTime,
        endTime,
        available: true,
        status: 'available'
      })
    }

    setTimeSlots([...timeSlots, ...slots])
    setShowAddSlotDialog(false)
  }

  const removeSlot = (slotId: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== slotId))
  }

  const generateBulkSlots = () => {
    const slots: TimeSlot[] = []
    const daysToGenerate = 30

    for (let d = 0; d < daysToGenerate; d++) {
      const date = addDays(new Date(), d)
      const dayName = format(date, 'EEEE').toLowerCase()
      if (!settings.workingDays.includes(dayName)) continue

      const [startHour, startMin] = settings.workingHours.start.split(':').map(Number)
      const [endHour, endMin] = settings.workingHours.end.split(':').map(Number)
      let currentTime = setMinutes(setHours(date, startHour), startMin)
      const endTime = setMinutes(setHours(date, endHour), endMin)
      let slotsForDay = 0

      while (isBefore(currentTime, endTime) && slotsForDay < settings.maxSlotsPerDay) {
        const slotEndTime = new Date(currentTime.getTime() + settings.defaultSlotDuration * 60000)

        slots.push({
          id: `slot_${date.getTime()}_${slotsForDay}`,
          date: date,
          startTime: format(currentTime, 'HH:mm'),
          endTime: format(slotEndTime, 'HH:mm'),
          available: true,
          status: 'available'
        })

        currentTime = new Date(slotEndTime.getTime() + settings.bufferTime * 60000)
        slotsForDay++
      }
    }

    setTimeSlots(slots)
  }

  const getAvailableSlotCount = () => {
    return timeSlots.filter(slot => isSameDay(slot.date, selectedDate) && slot.available).length
  }

  const getBookedSlotCount = () => {
    return timeSlots.filter(slot => isSameDay(slot.date, selectedDate) && !slot.available).length
  }

  const bookPatientToSlot = (patientId: string, slotId: string) => {
    const patient = campaign?.patients.find(p => p.id === patientId)
    if (!patient) return

    const updatedSlots = timeSlots.map(slot =>
      slot.id === slotId ? {
        ...slot,
        available: false,
        status: 'booked' as const,
        patientId: patient.id,
        patientName: patient.name,
        studyId: campaign?.studyName
      } : slot
    )

    setTimeSlots(updatedSlots)
    setLastSyncTime(new Date())
  }

  const filteredSlots = timeSlots.filter(slot => isSameDay(slot.date, selectedDate)).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const confirmedPatients = campaign?.patients.filter(p => p.status === 'interested' || p.status === 'scheduled').map(p => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    study: campaign.studyName,
    eligibilityScore: 85,
    callDate: p.lastContactDate || new Date().toISOString().split('T')[0],
    status: "confirmed" as const,
    preferredTimes: ["morning", "afternoon"]
  })) || []

  // Load slots when date changes
  useEffect(() => {
    if (timeSlots.length === 0 && campaign) {
      generateMockSlots()
    }
  }, [selectedDate, campaign])

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Campaign Not Found</h3>
            <Button onClick={() => router.push('/campaigns')}>
              Back to Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleUpdateStatus = () => {
    if (!selectedPatient) return

    setIsUpdating(true)
    updatePatientStatus(campaignId, selectedPatient.id, newStatus, contactNotes)

    // Reload campaign to reflect updates
    setTimeout(() => {
      const updatedCampaign = getCampaignById(campaignId)
      setCampaign(updatedCampaign || null)
      setIsUpdating(false)
      setSelectedPatient(null)
      setContactNotes("")
      setNewStatus('contacted')
    }, 500)
  }

  const handleInitiateAICall = async (patient: CampaignPatient) => {
    try {
      console.log('Initiating AI call for patient:', patient);

      // Call your backend API to initiate AI call
      const response = await fetch('/api/call-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          phone: patient.phone,
          campaignId: campaignId,
          studyId: campaign?.studyId
        })
      })

      const data = await response.json();
      console.log('API response:', data);

      if (response.ok) {
        alert(`✅ AI call initiated successfully to ${patient.name} at ${patient.phone}\n\nCall ID: ${data.callId || 'N/A'}`)
        // Update patient status to "AI Call Initiated"
        updatePatientStatus(campaignId, patient.id, 'contacted', 'AI call initiated via Eleven Labs')

        // Also update in patient context
        const contextPatient = patients.find(p => p.id === patient.id)
        if (contextPatient) {
          updatePatient(patient.id, {
            status: 'AI Call Initiated'
          })
        }
      } else {
        console.error('Failed to initiate call:', data);
        alert(`❌ Failed to initiate AI call\n\nError: ${data.error || 'Unknown error'}\n\nDetails: ${JSON.stringify(data.details || {}, null, 2)}`)
      }
    } catch (error) {
      console.error('Error initiating AI call:', error);
      alert(`❌ Failed to initiate AI call\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleManualOverride = () => {
    if (!selectedCallTranscript || !selectedCallTranscript.patientId) return

    setIsUpdating(true)

    // Update in patient context
    updatePatient(selectedCallTranscript.patientId, {
      tag: overrideTag as any,
      status: overrideStatus as any,
      eligibilityOverride: {
        originalTag: selectedCallTranscript.originalTag || '',
        originalStatus: selectedCallTranscript.originalStatus || '',
        newTag: overrideTag,
        newStatus: overrideStatus,
        reason: overrideReason,
        overriddenBy: 'CRC',
        overriddenAt: new Date().toISOString()
      }
    })

    setTimeout(() => {
      setIsUpdating(false)
      setOverrideDialogOpen(false)
      setSelectedCallTranscript(null)
      setOverrideReason("")

      // Reload campaign
      const updatedCampaign = getCampaignById(campaignId)
      setCampaign(updatedCampaign || null)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/campaigns')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
                <p className="text-sm text-slate-600">{campaign.studyName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-6">
        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="grid w-full md:w-[600px] grid-cols-4">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6 mt-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{campaign.totalPatients}</p>
              <p className="text-xs text-slate-600">Total Patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{campaign.contacted}</p>
              <p className="text-xs text-slate-600">Contacted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{campaign.interested}</p>
              <p className="text-xs text-slate-600">Interested</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{campaign.scheduled}</p>
              <p className="text-xs text-slate-600">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{campaign.enrolled}</p>
              <p className="text-xs text-slate-600">Enrolled</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Campaign Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaign.patients.map((patient) => {
                const StatusIcon = statusConfig[patient.status].icon
                return (
                  <div
                    key={patient.id}
                    className="border rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{patient.name}</h4>
                          <Badge className={statusConfig[patient.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[patient.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {patient.age} years old • {patient.gender}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </span>
                        </div>
                        {patient.lastContactDate && (
                          <p className="text-xs text-slate-500 mt-2">
                            Last contact: {patient.lastContactDate}
                            {patient.lastContactMethod && ` via ${patient.lastContactMethod}`}
                          </p>
                        )}
                        {patient.notes && (
                          <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                            <p className="text-xs text-slate-700">
                              <strong>Notes:</strong> {patient.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setContactNotes(patient.notes || "")
                              setNewStatus(patient.status)
                            }}
                          >
                            <MessagesSquare className="h-3 w-3 mr-1" />
                            Update Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Patient Status</DialogTitle>
                            <DialogDescription>
                              {patient.name} - Update contact status and add notes
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Status</label>
                              <Select
                                value={newStatus}
                                onValueChange={(value) => setNewStatus(value as CampaignPatient['status'])}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not_contacted">Not Contacted</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="interested">Interested</SelectItem>
                                  <SelectItem value="not_interested">Not Interested</SelectItem>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="screened">Screened</SelectItem>
                                  <SelectItem value="enrolled">Enrolled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Notes</label>
                              <Textarea
                                value={contactNotes}
                                onChange={(e) => setContactNotes(e.target.value)}
                                placeholder="Add notes about this contact..."
                                rows={4}
                              />
                            </div>
                            <Button
                              onClick={handleUpdateStatus}
                              disabled={isUpdating}
                              className="w-full"
                            >
                              {isUpdating ? 'Updating...' : 'Save Changes'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInitiateAICall(patient)}
                      >
                        <Bot className="h-3 w-3 mr-1" />
                        AI Call
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInitiateAICall(patient)}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call Patient
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `mailto:${patient.email}`}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/ingest/patients/${patient.id}`)}
                      >
                        <User className="h-3 w-3 mr-1" />
                        Profile
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Calls Tab - Configure Campaign */}
          <TabsContent value="calls" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="h-5 w-5 text-purple-600" />
                    Screening Questions
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                      const newQuestion = prompt('Add new screening question:')
                      if (newQuestion && campaign.screeningCriteria) {
                        const newId = Math.max(...campaign.screeningCriteria.screeningQuestions.map(q => q.id), 0) + 1
                        const updatedCriteria = {
                          ...campaign.screeningCriteria,
                          screeningQuestions: [
                            ...campaign.screeningCriteria.screeningQuestions,
                            { id: newId, question: newQuestion }
                          ]
                        }
                        updateScreeningCriteria(campaignId, updatedCriteria)
                      }
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                    <Button onClick={() => {
                      const allPatients = campaign.patients.filter(p => p.phone && p.phone !== '(555) 123-4567')
                      if (allPatients.length === 0) {
                        alert('No patients with valid phone numbers to call')
                        return
                      }
                      if (confirm(`Send AI calls to ${allPatients.length} patients?`)) {
                        Promise.all(allPatients.map(patient => handleInitiateAICall(patient)))
                          .then(() => alert(`✅ Initiated ${allPatients.length} AI calls successfully`))
                          .catch(err => alert(`❌ Error initiating bulk calls: ${err.message}`))
                      }
                    }}>
                      <Phone className="h-4 w-4 mr-2" />
                      Send Bulk Call
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaign.screeningCriteria && campaign.screeningCriteria.screeningQuestions.length > 0 ? (
                  <div className="space-y-3">
                    {campaign.screeningCriteria.screeningQuestions.map((item: any, index: number) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-purple-50 border-purple-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">
                              <span className="font-semibold text-purple-700">Q{index + 1}:</span> {item.question}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="ghost" onClick={() => {
                              const newQuestion = prompt('Edit question:', item.question)
                              if (newQuestion !== null && campaign.screeningCriteria) {
                                const updatedCriteria = {
                                  ...campaign.screeningCriteria,
                                  screeningQuestions: campaign.screeningCriteria.screeningQuestions.map(q =>
                                    q.id === item.id ? { ...q, question: newQuestion } : q
                                  )
                                }
                                updateScreeningCriteria(campaignId, updatedCriteria)
                              }
                            }}>
                              Edit
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              if (confirm('Delete this question?') && campaign.screeningCriteria) {
                                const updatedCriteria = {
                                  ...campaign.screeningCriteria,
                                  screeningQuestions: campaign.screeningCriteria.screeningQuestions.filter(q => q.id !== item.id)
                                }
                                updateScreeningCriteria(campaignId, updatedCriteria)
                              }
                            }}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    <MessagesSquare className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p>No screening questions yet. Click "Add Question" to create one.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6 mt-6">
            {/* Real-time Status Bar */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-800">Real-time Sync Active</span>
                    </div>
                    <div className="text-sm text-blue-600">
                      Last updated: {lastSyncTime.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">AI bookings today: {aiBookingsCount}</span>
                    </div>
                    <Badge variant="outline" className="bg-white text-blue-700">
                      {getAvailableSlotCount()} slots available
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confirmed Patients Awaiting Scheduling */}
            {confirmedPatients.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Confirmed Patients Ready for Scheduling ({confirmedPatients.length})
                  </CardTitle>
                  <p className="text-sm text-green-700">
                    These patients have confirmed their interest. Click on a patient, then click an available time slot below to book them.
                  </p>
                </CardHeader>
                <CardContent>
                  {selectedPatientForBooking && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                          Patient selected: {confirmedPatients.find(p => p.id === selectedPatientForBooking)?.name}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPatientForBooking(null)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          Cancel Selection
                        </Button>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Click on an available time slot below to complete the booking.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {confirmedPatients.map((patient) => (
                      <div key={patient.id} className={`p-4 rounded-lg border ${
                        selectedPatientForBooking === patient.id
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500 ring-offset-2'
                          : 'bg-white border-green-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-green-900">{patient.name}</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {patient.eligibilityScore}% match
                          </Badge>
                        </div>
                        <div className="text-sm text-green-700 space-y-1">
                          <div>Study: {patient.study}</div>
                          <div>Call: {patient.callDate}</div>
                          <div>Prefers: {patient.preferredTimes.join(", ")}</div>
                        </div>
                        <Button
                          size="sm"
                          className={`w-full mt-3 ${
                            selectedPatientForBooking === patient.id
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          onClick={() => {
                            if (selectedPatientForBooking === patient.id) {
                              setSelectedPatientForBooking(null)
                            } else {
                              setSelectedPatientForBooking(patient.id)
                            }
                          }}
                        >
                          {selectedPatientForBooking === patient.id ? 'Cancel Selection' : 'Select Time Slot →'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar View */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Available Slots</span>
                      <Badge variant="outline" className="bg-green-50">
                        {getAvailableSlotCount()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Booked Slots</span>
                      <Badge variant="outline" className="bg-red-50">
                        {getBookedSlotCount()}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => setShowAddSlotDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={generateBulkSlots}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Generate Bulk Slots
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAICallIntegration(true)}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      AI Auto-Schedule
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowSettingsDialog(true)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Time Slots for {format(selectedDate, 'MMMM d, yyyy')}
                    </CardTitle>
                    <Badge variant="outline">
                      {format(selectedDate, 'EEEE')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading slots...
                    </div>
                  ) : filteredSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No time slots for this date</p>
                      <Button
                        className="mt-4"
                        onClick={() => setShowAddSlotDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Slot
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {filteredSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-4 rounded-lg border ${
                            slot.available
                              ? 'bg-green-50 border-green-200 hover:bg-green-100'
                              : 'bg-gray-50 border-gray-200'
                          } transition-colors cursor-pointer`}
                          data-available={slot.available}
                          onClick={() => {
                            if (slot.available && selectedPatientForBooking) {
                              const patient = confirmedPatients.find(p => p.id === selectedPatientForBooking)
                              bookPatientToSlot(selectedPatientForBooking, slot.id)
                              setSelectedPatientForBooking(null)
                              if (patient) {
                                alert(`✅ Successfully booked ${patient.name} for ${slot.startTime} - ${slot.endTime}`)
                              }
                            } else {
                              setSelectedSlot(slot)
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {slot.available ? (
                                <Badge variant="outline" className={`${
                                  selectedPatientForBooking ? 'bg-blue-50 text-blue-700 animate-pulse' : 'bg-green-50 text-green-700'
                                }`}>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {selectedPatientForBooking ? 'Click to Book' : 'Available'}
                                </Badge>
                              ) : (
                                <>
                                  <Badge variant="outline" className="bg-red-50 text-red-700">
                                    <Users className="h-3 w-3 mr-1" />
                                    {slot.patientName}
                                  </Badge>
                                  <Badge variant="outline">
                                    {slot.studyId}
                                  </Badge>
                                </>
                              )}

                              {slot.available && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeSlot(slot.id)
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Add Slot Dialog */}
            <Dialog open={showAddSlotDialog} onOpenChange={setShowAddSlotDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Time Slot</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={format(newSlot.date, 'yyyy-MM-dd')}
                      onChange={(e) => setNewSlot({
                        ...newSlot,
                        date: new Date(e.target.value)
                      })}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({
                          ...newSlot,
                          startTime: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({
                          ...newSlot,
                          endTime: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newSlot.recurring}
                      onChange={(e) => setNewSlot({
                        ...newSlot,
                        recurring: e.target.checked
                      })}
                      className="rounded"
                    />
                    <Label>Recurring slot</Label>
                  </div>

                  {newSlot.recurring && (
                    <div>
                      <Label>Number of days</Label>
                      <Input
                        type="number"
                        value={newSlot.recurringDays}
                        onChange={(e) => setNewSlot({
                          ...newSlot,
                          recurringDays: parseInt(e.target.value)
                        })}
                        min="1"
                        max="30"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowAddSlotDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addTimeSlot}>
                    Add Slot
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Settings Dialog */}
            <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Calendar Settings</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default Slot Duration (minutes)</Label>
                      <Input
                        type="number"
                        value={settings.defaultSlotDuration}
                        onChange={(e) => setSettings({
                          ...settings,
                          defaultSlotDuration: parseInt(e.target.value)
                        })}
                      />
                    </div>

                    <div>
                      <Label>Buffer Time Between Slots (minutes)</Label>
                      <Input
                        type="number"
                        value={settings.bufferTime}
                        onChange={(e) => setSettings({
                          ...settings,
                          bufferTime: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Working Hours Start</Label>
                      <Input
                        type="time"
                        value={settings.workingHours.start}
                        onChange={(e) => setSettings({
                          ...settings,
                          workingHours: {
                            ...settings.workingHours,
                            start: e.target.value
                          }
                        })}
                      />
                    </div>

                    <div>
                      <Label>Working Hours End</Label>
                      <Input
                        type="time"
                        value={settings.workingHours.end}
                        onChange={(e) => setSettings({
                          ...settings,
                          workingHours: {
                            ...settings.workingHours,
                            end: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Max Slots Per Day</Label>
                    <Input
                      type="number"
                      value={settings.maxSlotsPerDay}
                      onChange={(e) => setSettings({
                        ...settings,
                        maxSlotsPerDay: parseInt(e.target.value)
                      })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.autoConfirm}
                      onChange={(e) => setSettings({
                        ...settings,
                        autoConfirm: e.target.checked
                      })}
                      className="rounded"
                    />
                    <Label>Auto-confirm appointments</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowSettingsDialog(false)}>
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Slot Details Dialog */}
            {selectedSlot && (
              <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Slot Details</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Time</Label>
                      <p className="font-medium">
                        {selectedSlot.startTime} - {selectedSlot.endTime}
                      </p>
                    </div>

                    {selectedSlot.patientName && (
                      <>
                        <div>
                          <Label className="text-muted-foreground">Patient</Label>
                          <p className="font-medium">{selectedSlot.patientName}</p>
                        </div>

                        <div>
                          <Label className="text-muted-foreground">Study</Label>
                          <p className="font-medium">{selectedSlot.studyId}</p>
                        </div>
                      </>
                    )}

                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge className="mt-1">
                        {selectedSlot.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Calls Made</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">847</p>
                      <p className="text-xs text-green-600 mt-1">↑ 12% from last week</p>
                    </div>
                    <PhoneCall className="h-12 w-12 text-blue-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Call Completion Rate</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">65%</p>
                      <p className="text-xs text-green-600 mt-1">↑ 3% from last week</p>
                    </div>
                    <PhoneIncoming className="h-12 w-12 text-green-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Avg Handle Time</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">18:32</p>
                      <p className="text-xs text-slate-600 mt-1">minutes</p>
                    </div>
                    <Clock className="h-12 w-12 text-purple-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">28%</p>
                      <p className="text-xs text-green-600 mt-1">↑ 5% from last week</p>
                    </div>
                    <Target className="h-12 w-12 text-amber-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Call Outcomes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Call Outcome Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">Completed & Qualified</span>
                      </div>
                      <span className="text-sm font-bold">238 (28%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '28%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium">Completed & Not Qualified</span>
                      </div>
                      <span className="text-sm font-bold">312 (37%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '37%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-slate-400"></div>
                        <span className="text-sm font-medium">No Answer</span>
                      </div>
                      <span className="text-sm font-bold">185 (22%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-slate-400 h-2 rounded-full" style={{width: '22%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                        <span className="text-sm font-medium">Voicemail Left</span>
                      </div>
                      <span className="text-sm font-bold">78 (9%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{width: '9%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium">Declined Participation</span>
                      </div>
                      <span className="text-sm font-bold">34 (4%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '4%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demographic Distribution & Call Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demographic Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Demographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Age Distribution Pie Chart */}
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-4">Age Groups</p>
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative w-48 h-48">
                          <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            {/* 50-60: 28% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20"
                              strokeDasharray="70.4 251.2" strokeDashoffset="0" />
                            {/* 60-70: 42% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#60a5fa" strokeWidth="20"
                              strokeDasharray="105.6 251.2" strokeDashoffset="-70.4" />
                            {/* 70-80: 25% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#93c5fd" strokeWidth="20"
                              strokeDasharray="62.8 251.2" strokeDashoffset="-176" />
                            {/* 80+: 5% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#dbeafe" strokeWidth="20"
                              strokeDasharray="12.56 251.2" strokeDashoffset="-238.8" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-slate-900">847</p>
                              <p className="text-xs text-slate-600">Total</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                          <span className="text-xs text-slate-600">50-60 (28%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                          <span className="text-xs text-slate-600">60-70 (42%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                          <span className="text-xs text-slate-600">70-80 (25%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-100"></div>
                          <span className="text-xs text-slate-600">80+ (5%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Gender Distribution Pie Chart */}
                    <div className="pt-4 border-t">
                      <p className="text-sm font-semibold text-slate-700 mb-4">Gender Distribution</p>
                      <div className="flex items-center justify-center mb-4">
                        <div className="relative w-48 h-48">
                          <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            {/* Female: 58% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20"
                              strokeDasharray="145.6 251.2" strokeDashoffset="0" />
                            {/* Male: 42% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#c4b5fd" strokeWidth="20"
                              strokeDasharray="105.6 251.2" strokeDashoffset="-145.6" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-slate-900">847</p>
                              <p className="text-xs text-slate-600">Total</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                          <span className="text-xs text-slate-600">Female (58%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                          <span className="text-xs text-slate-600">Male (42%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Call Performance by Time of Day */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Call Performance by Time of Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64 relative">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-slate-600">
                        <span>100%</span>
                        <span>75%</span>
                        <span>50%</span>
                        <span>25%</span>
                        <span>0%</span>
                      </div>

                      {/* Graph area */}
                      <div className="ml-10 h-full pb-8 relative">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                          <div className="border-t border-slate-200"></div>
                          <div className="border-t border-slate-200"></div>
                          <div className="border-t border-slate-200"></div>
                          <div className="border-t border-slate-200"></div>
                          <div className="border-t border-slate-200"></div>
                        </div>

                        {/* Bars */}
                        <div className="absolute inset-0 flex items-end justify-between gap-0.5 pb-8">
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '32%'}} title="6am: 32%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '28%'}} title="7am: 28%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '35%'}} title="8am: 35%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '45%'}} title="9am: 45%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '58%'}} title="10am: 58%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '52%'}} title="11am: 52%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '38%'}} title="12pm: 38%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '42%'}} title="1pm: 42%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '55%'}} title="2pm: 55%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '65%'}} title="3pm: 65%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '62%'}} title="4pm: 62%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '48%'}} title="5pm: 48%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '40%'}} title="6pm: 40%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '35%'}} title="7pm: 35%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '28%'}} title="8pm: 28%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '22%'}} title="9pm: 22%"></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{height: '18%'}} title="10pm: 18%"></div>
                        </div>

                        {/* X-axis labels */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-600">
                          <span>6a</span>
                          <span>8a</span>
                          <span>10a</span>
                          <span>12p</span>
                          <span>2p</span>
                          <span>4p</span>
                          <span>6p</span>
                          <span>8p</span>
                          <span>10p</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-slate-600 mb-1">Best Time to Call</p>
                          <p className="text-lg font-bold text-blue-900">2-4 PM</p>
                          <p className="text-xs text-slate-600">65% answer rate</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Worst Time to Call</p>
                          <p className="text-lg font-bold text-slate-900">10 PM</p>
                          <p className="text-xs text-slate-600">18% answer rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Talk Time & Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Talk Time & Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Talk Time Distribution</p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-600">AI Talk Time</span>
                          <span className="text-sm font-bold">58%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '58%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-600">Patient Talk Time</span>
                          <span className="text-sm font-bold">42%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '42%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">Interruption Rate</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">3.2%</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">Silence Duration</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">8.5s</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">Speech Rate</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">145 wpm</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">Questions Asked</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">4.2 avg</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Engagement Indicators</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Patient actively asking questions</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Minimal silence/hesitation</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Balanced talk time ratio</span>
                        <CheckCircle className="h-4 w-4 text-amber-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Metrics & Criteria Verification */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Financial & ROI Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Total Campaign Cost</p>
                        <p className="text-2xl font-bold text-slate-900">$8,470</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Cost per Call</p>
                        <p className="text-2xl font-bold text-slate-900">$10</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700 mb-1">Cost per Answered</p>
                        <p className="text-2xl font-bold text-blue-900">$15.40</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-xs text-purple-700 mb-1">Cost per Qualified</p>
                        <p className="text-2xl font-bold text-purple-900">$56.85</p>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-900 mb-2">Cost per Enrolled Patient</p>
                      <p className="text-3xl font-bold text-green-900">$89.16</p>
                      <p className="text-xs text-green-700 mt-1">33% below target of $120</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">Projected ROI</span>
                        <Badge className="bg-green-600 text-white">Positive</Badge>
                      </div>
                      <div className="text-xs text-slate-600">
                        Based on $2,500 avg value per enrolled patient
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Criteria Verification Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Criteria Verification Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Age Verification</span>
                        <span className="text-sm font-bold">98%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '98%'}}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Diagnosis Confirmation</span>
                        <span className="text-sm font-bold">95%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Study Partner Confirmation</span>
                        <span className="text-sm font-bold">87%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '87%'}}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Consent Recording</span>
                        <span className="text-sm font-bold">92%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Visit Scheduling</span>
                        <span className="text-sm font-bold">85%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm font-semibold text-slate-700 mb-3">Average Questions Needed</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="text-lg font-bold text-slate-900">2.3</p>
                          <p className="text-xs text-slate-600">Age</p>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="text-lg font-bold text-slate-900">3.1</p>
                          <p className="text-xs text-slate-600">Diagnosis</p>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                          <p className="text-lg font-bold text-slate-900">2.8</p>
                          <p className="text-xs text-slate-600">Partner</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* AI Call Calendar Integration Dialog */}
      <AICallIntegration
        isOpen={showAICallIntegration}
        onClose={() => setShowAICallIntegration(false)}
        eligiblePatients={campaign.patients
          .filter(p => p.status === 'interested' || p.status === 'contacted')
          .map(p => ({
            id: p.id,
            name: p.name,
            phone: p.phone,
            eligibilityScore: 85,
            study: campaign.studyName,
            callDate: p.lastContactDate || new Date().toISOString().split('T')[0],
            aiAssessment: 'Qualified',
            urgency: 'normal' as const,
            preferences: {
              preferredDays: ['Monday', 'Wednesday', 'Friday'],
              preferredTimes: ['Morning', 'Afternoon'],
              specialRequirements: 'Needs study partner present'
            }
          }))}
        onSchedulePatients={(patientIds, settings) => {
          // Update patient statuses to scheduled
          patientIds.forEach(patientId => {
            updatePatientStatus(campaignId, patientId, 'scheduled', 'Scheduled via AI auto-scheduling')
          })
          // Reload campaign
          const updatedCampaign = getCampaignById(campaignId)
          setCampaign(updatedCampaign || null)
          setShowAICallIntegration(false)
        }}
      />
    </div>
  )
}