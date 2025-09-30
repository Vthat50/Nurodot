"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  AlertTriangle,
  Settings,
  Target,
  Zap,
  TrendingUp,
  MessageSquare,
  FileText,
  Bell,
  Smartphone
} from "lucide-react"

interface AICallIntegrationProps {
  isOpen: boolean
  onClose: () => void
  eligiblePatients: Array<{
    id: string
    name: string
    phone: string
    eligibilityScore: number
    study: string
    callDate: string
    aiAssessment: string
    urgency: 'low' | 'normal' | 'high'
    preferences?: {
      preferredDays?: string[]
      preferredTimes?: string[]
      specialRequirements?: string
    }
  }>
  onSchedulePatients?: (patients: string[], settings: any) => void
}

export function AICallIntegration({ isOpen, onClose, eligiblePatients, onSchedulePatients }: AICallIntegrationProps) {
  const [selectedPatients, setSelectedPatients] = useState<string[]>([])
  const [schedulingSettings, setSchedulingSettings] = useState({
    autoOptimize: true,
    prioritizeUrgent: true,
    respectPreferences: true,
    sendConfirmations: true,
    bufferTime: 15,
    followUpCalls: true,
    aiPreparation: true
  })
  const [preVisitSettings, setPreVisitSettings] = useState({
    sendReminders: true,
    reminderDays: [3, 1],
    includeStudyInfo: true,
    includeDirections: true,
    requireConfirmation: true,
    aiCallPrep: true
  })
  const [schedulingResults, setSchedulingResults] = useState<any>(null)

  const handlePatientSelection = (patientId: string, checked: boolean) => {
    if (checked) {
      setSelectedPatients(prev => [...prev, patientId])
    } else {
      setSelectedPatients(prev => prev.filter(id => id !== patientId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPatients(eligiblePatients.map(p => p.id))
    } else {
      setSelectedPatients([])
    }
  }

  const handleAutoSchedule = async () => {
    if (selectedPatients.length === 0) {
      alert("Please select patients to schedule")
      return
    }

    // Simulate AI-powered scheduling
    const results = {
      scheduled: selectedPatients.length,
      conflicts: 0,
      optimizations: [
        "Grouped patients by study type for efficiency",
        "Prioritized high-urgency patients for earlier slots",
        "Respected patient time preferences (8/10 patients)",
        "Optimized travel time for multi-site studies"
      ],
      nextActions: [
        "Send confirmation emails to patients",
        "Schedule AI preparation calls 24h before visits",
        "Generate pre-visit documentation packets",
        "Set up automated reminder sequence"
      ]
    }

    setSchedulingResults(results)

    if (onSchedulePatients) {
      onSchedulePatients(selectedPatients, { ...schedulingSettings, ...preVisitSettings })
    }

    alert(`✅ Successfully scheduled ${selectedPatients.length} patients with AI optimization!`)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEligibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Call → Calendar Integration
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="patients">Eligible Patients</TabsTrigger>
            <TabsTrigger value="scheduling">Auto-Scheduling</TabsTrigger>
            <TabsTrigger value="previsit">Pre-Visit Setup</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Patients Ready for Scheduling ({eligiblePatients.length})</span>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedPatients.length === eligiblePatients.length && eligiblePatients.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="text-sm">Select All</Label>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eligiblePatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`border rounded-lg p-4 ${
                        selectedPatients.includes(patient.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedPatients.includes(patient.id)}
                            onCheckedChange={(checked) => handlePatientSelection(patient.id, checked as boolean)}
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{patient.name}</span>
                              <Badge className={getUrgencyColor(patient.urgency)}>
                                {patient.urgency} priority
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>Study: {patient.study} • Phone: {patient.phone}</div>
                              <div>Call Date: {patient.callDate}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${getEligibilityColor(patient.eligibilityScore)}`}>
                            {patient.eligibilityScore}% eligible
                          </div>
                          <div className="text-sm text-gray-600">
                            {patient.aiAssessment}
                          </div>
                        </div>
                      </div>

                      {patient.preferences && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                          <div className="font-medium text-gray-700 mb-1">Patient Preferences:</div>
                          {patient.preferences.preferredDays && (
                            <div>Days: {patient.preferences.preferredDays.join(', ')}</div>
                          )}
                          {patient.preferences.preferredTimes && (
                            <div>Times: {patient.preferences.preferredTimes.join(', ')}</div>
                          )}
                          {patient.preferences.specialRequirements && (
                            <div>Notes: {patient.preferences.specialRequirements}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  AI-Powered Scheduling Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="auto-optimize"
                        checked={schedulingSettings.autoOptimize}
                        onCheckedChange={(checked) =>
                          setSchedulingSettings(prev => ({ ...prev, autoOptimize: checked as boolean }))
                        }
                      />
                      <div>
                        <Label htmlFor="auto-optimize" className="font-medium">Auto-Optimize Schedule</Label>
                        <p className="text-sm text-gray-600">AI optimizes slot allocation for maximum efficiency</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prioritize-urgent"
                        checked={schedulingSettings.prioritizeUrgent}
                        onCheckedChange={(checked) =>
                          setSchedulingSettings(prev => ({ ...prev, prioritizeUrgent: checked as boolean }))
                        }
                      />
                      <div>
                        <Label htmlFor="prioritize-urgent" className="font-medium">Prioritize Urgent Patients</Label>
                        <p className="text-sm text-gray-600">High-priority patients get earlier time slots</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="respect-preferences"
                        checked={schedulingSettings.respectPreferences}
                        onCheckedChange={(checked) =>
                          setSchedulingSettings(prev => ({ ...prev, respectPreferences: checked as boolean }))
                        }
                      />
                      <div>
                        <Label htmlFor="respect-preferences" className="font-medium">Respect Patient Preferences</Label>
                        <p className="text-sm text-gray-600">Consider preferred days and times when possible</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-confirmations"
                        checked={schedulingSettings.sendConfirmations}
                        onCheckedChange={(checked) =>
                          setSchedulingSettings(prev => ({ ...prev, sendConfirmations: checked as boolean }))
                        }
                      />
                      <div>
                        <Label htmlFor="send-confirmations" className="font-medium">Auto-Send Confirmations</Label>
                        <p className="text-sm text-gray-600">Automatically email appointment confirmations</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="followup-calls"
                        checked={schedulingSettings.followUpCalls}
                        onCheckedChange={(checked) =>
                          setSchedulingSettings(prev => ({ ...prev, followUpCalls: checked as boolean }))
                        }
                      />
                      <div>
                        <Label htmlFor="followup-calls" className="font-medium">Schedule Follow-up AI Calls</Label>
                        <p className="text-sm text-gray-600">AI calls 24h before visit for preparation</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ai-preparation"
                        checked={schedulingSettings.aiPreparation}
                        onCheckedChange={(checked) =>
                          setSchedulingSettings(prev => ({ ...prev, aiPreparation: checked as boolean }))
                        }
                      />
                      <div>
                        <Label htmlFor="ai-preparation" className="font-medium">AI Visit Preparation</Label>
                        <p className="text-sm text-gray-600">Generate personalized pre-visit materials</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="buffer-time">Buffer Time (minutes)</Label>
                    <Select
                      value={schedulingSettings.bufferTime.toString()}
                      onValueChange={(value) =>
                        setSchedulingSettings(prev => ({ ...prev, bufferTime: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="previsit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Pre-Visit Communication Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-reminders"
                        checked={preVisitSettings.sendReminders}
                        onCheckedChange={(checked) =>
                          setPreVisitSettings(prev => ({ ...prev, sendReminders: checked as boolean }))
                        }
                      />
                      <div>
                        <Label htmlFor="send-reminders" className="font-medium">Send Appointment Reminders</Label>
                        <p className="text-sm text-gray-600">Automated email and SMS reminders</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-study-info"
                        checked={preVisitSettings.includeStudyInfo}
                        onCheckedChange={(checked) =>
                          setPreVisitSettings(prev => ({ ...prev, includeStudyInfo: checked as boolean }))
                        }
                      />
                      <div>
                        <Label htmlFor="include-study-info" className="font-medium">Include Study Information</Label>
                        <p className="text-sm text-gray-600">Detailed study overview and procedures</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-directions"
                        checked={preVisitSettings.includeDirections}
                        onCheckedChange={(checked) =>
                          setPreVisitSettings(prev => ({ ...prev, includeDirections: checked as boolean }))
                        }
                      />
                      <div>
                        <Label htmlFor="include-directions" className="font-medium">Include Directions & Parking</Label>
                        <p className="text-sm text-gray-600">Site location and parking information</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="require-confirmation"
                        checked={preVisitSettings.requireConfirmation}
                        onCheckedChange={(checked) =>
                          setPreVisitSettings(prev => ({ ...prev, requireConfirmation: checked as boolean }))
                        }
                      />
                      <div>
                        <Label htmlFor="require-confirmation" className="font-medium">Require Confirmation</Label>
                        <p className="text-sm text-gray-600">Patients must confirm 24h before visit</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ai-call-prep"
                        checked={preVisitSettings.aiCallPrep}
                        onCheckedChange={(checked) =>
                          setPreVisitSettings(prev => ({ ...prev, aiCallPrep: checked as boolean }))
                        }
                      />
                      <div>
                        <Label htmlFor="ai-call-prep" className="font-medium">AI Preparation Call</Label>
                        <p className="text-sm text-gray-600">AI call 24h before to prepare and answer questions</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reminder Schedule (days before visit)</Label>
                  <div className="flex gap-2">
                    {[7, 3, 1].map(days => (
                      <div key={days} className="flex items-center space-x-2">
                        <Checkbox
                          checked={preVisitSettings.reminderDays.includes(days)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPreVisitSettings(prev => ({
                                ...prev,
                                reminderDays: [...prev.reminderDays, days].sort((a, b) => b - a)
                              }))
                            } else {
                              setPreVisitSettings(prev => ({
                                ...prev,
                                reminderDays: prev.reminderDays.filter(d => d !== days)
                              }))
                            }
                          }}
                        />
                        <Label className="text-sm">{days} day{days > 1 ? 's' : ''}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {schedulingResults ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Scheduling Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{schedulingResults.scheduled}</div>
                      <div className="text-sm text-green-700">Patients Scheduled</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{schedulingResults.conflicts}</div>
                      <div className="text-sm text-blue-700">Scheduling Conflicts</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">95%</div>
                      <div className="text-sm text-purple-700">Optimization Score</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        AI Optimizations Applied
                      </h4>
                      <div className="space-y-1">
                        {schedulingResults.optimizations.map((optimization: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{optimization}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Next Actions
                      </h4>
                      <div className="space-y-1">
                        {schedulingResults.nextActions.map((action: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">Complete scheduling to view results</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleAutoSchedule}
            disabled={selectedPatients.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Auto-Schedule ({selectedPatients.length} patients)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
