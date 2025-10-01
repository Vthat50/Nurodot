"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  Plus,
  X,
  Calendar as CalendarIcon,
  User
} from "lucide-react"
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, addMinutes } from "date-fns"

interface ScheduledCall {
  id: string
  patientId: string
  patientName: string
  phone: string
  date: Date
  startTime: string
  endTime: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_answer'
  notes?: string
  color: string
}

interface AICallSchedulerProps {
  patients: Array<{
    id: string
    name: string
    phone: string
    status?: string
  }>
  onScheduleCall?: (call: ScheduledCall) => void
  existingCalls?: ScheduledCall[]
}

const CALL_COLORS = [
  '#1e88e5', // Blue
  '#43a047', // Green
  '#fb8c00', // Orange
  '#e53935', // Red
  '#8e24aa', // Purple
  '#00897b', // Teal
  '#d81b60', // Pink
  '#6d4c41', // Brown
]

export function AICallScheduler({ patients, onScheduleCall, existingCalls = [] }: AICallSchedulerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'week' | 'day'>('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>(existingCalls)
  const [showNewCallDialog, setShowNewCallDialog] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; time: string } | null>(null)
  const [selectedCall, setSelectedCall] = useState<ScheduledCall | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [showBulkCallDialog, setShowBulkCallDialog] = useState(false)
  const [selectedPatients, setSelectedPatients] = useState<string[]>([])

  // New call form state
  const [newCall, setNewCall] = useState({
    patientId: '',
    date: '',
    startTime: '09:00',
    duration: '30',
    notes: ''
  })

  // Bulk call form state
  const [bulkCall, setBulkCall] = useState({
    date: '',
    startTime: '09:00',
    interval: '5', // minutes between calls
    duration: '30',
    notes: ''
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Mini calendar generation
  const miniCalendarDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  const miniCalendarStartDay = startOfWeek(startOfMonth(currentDate))
  const miniCalendarEndDay = endOfWeek(endOfMonth(currentDate))
  const allMiniCalendarDays = eachDayOfInterval({
    start: miniCalendarStartDay,
    end: miniCalendarEndDay
  })

  // Week view generation
  const weekStart = startOfWeek(selectedDate)
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i))

  // Time slots (30-minute intervals from 8 AM to 8 PM)
  const timeSlots = []
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setCurrentDate(date)
  }

  const handleTimeSlotClick = (date: Date, time: string) => {
    setSelectedTimeSlot({ date, time })
    setNewCall({
      patientId: '',
      date: format(date, 'yyyy-MM-dd'),
      startTime: time,
      duration: '30',
      notes: ''
    })
    setShowNewCallDialog(true)
  }

  const handleScheduleCall = () => {
    if (!newCall.patientId) return

    const patient = patients.find(p => p.id === newCall.patientId)
    if (!patient) return

    const startDate = parseISO(`${newCall.date}T${newCall.startTime}`)
    const endTime = format(addMinutes(startDate, parseInt(newCall.duration)), 'HH:mm')

    const scheduledCall: ScheduledCall = {
      id: `call_${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      phone: patient.phone,
      date: startDate,
      startTime: newCall.startTime,
      endTime: endTime,
      status: 'scheduled',
      notes: newCall.notes,
      color: CALL_COLORS[scheduledCalls.length % CALL_COLORS.length]
    }

    setScheduledCalls([...scheduledCalls, scheduledCall])
    onScheduleCall?.(scheduledCall)
    setShowNewCallDialog(false)
    setNewCall({
      patientId: '',
      date: '',
      startTime: '09:00',
      duration: '30',
      notes: ''
    })
  }

  const handleScheduleBulkCalls = () => {
    if (selectedPatients.length === 0) return

    const startDate = parseISO(`${bulkCall.date}T${bulkCall.startTime}`)
    const newCalls: ScheduledCall[] = []

    selectedPatients.forEach((patientId, index) => {
      const patient = patients.find(p => p.id === patientId)
      if (!patient) return

      // Calculate start time for this call (add interval * index minutes)
      const callStartTime = addMinutes(startDate, parseInt(bulkCall.interval) * index)
      const callEndTime = addMinutes(callStartTime, parseInt(bulkCall.duration))

      newCalls.push({
        id: `call_${Date.now()}_${index}`,
        patientId: patient.id,
        patientName: patient.name,
        phone: patient.phone,
        date: callStartTime,
        startTime: format(callStartTime, 'HH:mm'),
        endTime: format(callEndTime, 'HH:mm'),
        status: 'scheduled',
        notes: bulkCall.notes,
        color: CALL_COLORS[index % CALL_COLORS.length]
      })
    })

    setScheduledCalls([...scheduledCalls, ...newCalls])
    newCalls.forEach(call => onScheduleCall?.(call))

    setShowBulkCallDialog(false)
    setSelectedPatients([])
    setBulkCall({
      date: '',
      startTime: '09:00',
      interval: '5',
      duration: '30',
      notes: ''
    })
  }

  const getCallsForDateAndTime = (date: Date, time: string) => {
    return scheduledCalls.filter(call =>
      isSameDay(call.date, date) && call.startTime === time
    )
  }

  const getCallsForDate = (date: Date) => {
    return scheduledCalls.filter(call => isSameDay(call.date, date))
  }

  if (!isMounted) {
    return <div className="animate-pulse bg-slate-100 rounded-lg h-96"></div>
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Phone className="h-5 w-5 text-blue-600" />
            AI Call Scheduler
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {scheduledCalls.length} scheduled
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNewCall({
                  patientId: '',
                  date: format(selectedDate, 'yyyy-MM-dd'),
                  startTime: '09:00',
                  duration: '30',
                  notes: ''
                })
                setShowNewCallDialog(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Single Call
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setBulkCall({
                  date: format(selectedDate, 'yyyy-MM-dd'),
                  startTime: '09:00',
                  interval: '5',
                  duration: '30',
                  notes: ''
                })
                setSelectedPatients([])
                setShowBulkCallDialog(true)
              }}
            >
              <Phone className="h-4 w-4 mr-1" />
              Bulk Schedule
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="max-w-sm mx-auto">
          {/* Mini Calendar */}
          <div className="bg-white rounded-lg p-4 border">
            {/* Mini Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setCurrentDate(subDays(currentDate, 30))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setCurrentDate(addDays(currentDate, 30))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mini Calendar Grid */}
            <div className="mb-6">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs font-medium text-slate-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {allMiniCalendarDays.map((day, i) => {
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isSelected = isSameDay(day, selectedDate)
                  const isCurrentDay = isToday(day)
                  const callsOnDay = getCallsForDate(day)

                  return (
                    <button
                      key={i}
                      onClick={() => handleDateClick(day)}
                      className={`
                        relative aspect-square rounded-full text-xs font-normal transition-all
                        ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                        ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                        ${isCurrentDay && !isSelected ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                        ${!isSelected && !isCurrentDay ? 'hover:bg-slate-100' : ''}
                      `}
                    >
                      {format(day, 'd')}
                      {callsOnDay.length > 0 && !isSelected && (
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {callsOnDay.slice(0, 3).map((call, idx) => (
                            <div
                              key={idx}
                              className="w-1 h-1 rounded-full"
                              style={{ backgroundColor: call.color }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Scheduled Calls List */}
            {scheduledCalls.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Scheduled Calls ({scheduledCalls.length})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {scheduledCalls
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((call) => (
                      <div
                        key={call.id}
                        className="p-3 rounded-lg border hover:border-blue-300 transition-colors cursor-pointer"
                        style={{ borderLeftWidth: '4px', borderLeftColor: call.color }}
                        onClick={() => setSelectedCall(call)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate">
                              {call.patientName}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {format(call.date, 'MMM d, yyyy')} • {call.startTime} - {call.endTime}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{call.phone}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs shrink-0"
                            style={{ borderColor: call.color, color: call.color }}
                          >
                            {call.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* New Call Dialog */}
      <Dialog open={showNewCallDialog} onOpenChange={setShowNewCallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule AI Call</DialogTitle>
            <DialogDescription>
              Schedule a single AI voice call
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Patient</Label>
              <Select value={newCall.patientId} onValueChange={(value) => setNewCall({ ...newCall, patientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newCall.date}
                  onChange={(e) => setNewCall({ ...newCall, date: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newCall.startTime}
                  onChange={(e) => setNewCall({ ...newCall, startTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewCallDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleCall} disabled={!newCall.patientId || !newCall.date}>
              Schedule Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Details Dialog */}
      {selectedCall && (
        <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Call Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Patient</Label>
                <p className="font-medium text-lg">{selectedCall.patientName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedCall.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className="mt-1" style={{ backgroundColor: selectedCall.color }}>
                    {selectedCall.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{format(selectedCall.date, 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p className="font-medium">
                    {selectedCall.startTime} - {selectedCall.endTime}
                  </p>
                </div>
              </div>

              {selectedCall.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1">{selectedCall.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setScheduledCalls(scheduledCalls.filter(c => c.id !== selectedCall.id))
                  setSelectedCall(null)
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel Call
              </Button>
              <Button onClick={() => setSelectedCall(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Call Dialog */}
      <Dialog open={showBulkCallDialog} onOpenChange={setShowBulkCallDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Schedule AI Calls</DialogTitle>
            <DialogDescription>
              Schedule multiple AI voice calls in sequence. Calls will be scheduled with the specified interval between each call.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Patient Selection */}
            <div>
              <Label className="mb-2 block">Select Patients ({selectedPatients.length} selected)</Label>
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedPatients.includes(patient.id) ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                    onClick={() => {
                      if (selectedPatients.includes(patient.id)) {
                        setSelectedPatients(selectedPatients.filter(id => id !== patient.id))
                      } else {
                        setSelectedPatients([...selectedPatients, patient.id])
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPatients.includes(patient.id)}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{patient.name}</p>
                      <p className="text-xs text-slate-600">{patient.phone}</p>
                    </div>
                    {patient.status && (
                      <Badge variant="outline" className="text-xs">
                        {patient.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPatients(patients.map(p => p.id))}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPatients([])}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Call Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={bulkCall.date}
                  onChange={(e) => setBulkCall({ ...bulkCall, date: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={bulkCall.startTime}
                  onChange={(e) => setBulkCall({ ...bulkCall, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Call Duration (minutes)</Label>
                <Select value={bulkCall.duration} onValueChange={(value) => setBulkCall({ ...bulkCall, duration: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Interval Between Calls (minutes)</Label>
                <Select value={bulkCall.interval} onValueChange={(value) => setBulkCall({ ...bulkCall, interval: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No gap (back-to-back)</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Call Schedule Preview */}
            {selectedPatients.length > 0 && bulkCall.date && bulkCall.startTime && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Schedule Preview</h4>
                <div className="space-y-1 text-sm text-blue-700 max-h-40 overflow-y-auto">
                  {selectedPatients.map((patientId, index) => {
                    const patient = patients.find(p => p.id === patientId)
                    if (!patient) return null

                    const startDate = parseISO(`${bulkCall.date}T${bulkCall.startTime}`)
                    const callStartTime = addMinutes(startDate, parseInt(bulkCall.interval) * index)
                    const callEndTime = addMinutes(callStartTime, parseInt(bulkCall.duration))

                    return (
                      <div key={patientId} className="flex items-center justify-between py-1">
                        <span className="font-medium">{patient.name}</span>
                        <span className="text-xs">
                          {format(callStartTime, 'h:mm a')} - {format(callEndTime, 'h:mm a')}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Total duration: {selectedPatients.length * (parseInt(bulkCall.duration) + parseInt(bulkCall.interval))} minutes
                </p>
              </div>
            )}

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={bulkCall.notes}
                onChange={(e) => setBulkCall({ ...bulkCall, notes: e.target.value })}
                placeholder="Add any special instructions for all calls..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBulkCallDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleScheduleBulkCalls}
              disabled={selectedPatients.length === 0 || !bulkCall.date}
            >
              Schedule {selectedPatients.length} Call{selectedPatients.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
