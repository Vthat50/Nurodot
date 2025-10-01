"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useStudy } from "@/contexts/study-context"
import { usePatients } from "@/contexts/patient-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Bell,
  ArrowRight,
  Upload,
  Download,
  ChevronRight,
  Home,
  Beaker,
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  Eye,
  DollarSign,
  PhoneCall,
  PhoneIncoming,
  Activity
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { studies, currentStudy, setCurrentStudy } = useStudy()
  const { patients, getPatientsByStudy } = usePatients()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tagFilter, setTagFilter] = useState<string>("all")
  const [selectedStudyForAnalysis, setSelectedStudyForAnalysis] = useState(currentStudy?.id || "all")

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    const matchesTag = tagFilter === "all" || patient.tag === tagFilter
    return matchesSearch && matchesStatus && matchesTag
  })

  // Calculate metrics per study
  const studyMetrics = studies.map(study => {
    const studyPatients = getPatientsByStudy(study.id)
    const leadsIngested = studyPatients.length
    const patientsCalled = studyPatients.filter(p => p.status !== 'Pending Review').length
    const patientsScheduled = studyPatients.filter(p =>
      p.status === 'On-site visit scheduled' || p.visitScheduledDate
    ).length
    const patientsIncluded = studyPatients.filter(p => p.status === 'Enrolled').length
    const pendingReview = studyPatients.filter(p => p.status === 'Pending Review').length

    // Funnel stages
    const leads = leadsIngested
    const called = patientsCalled
    const answered = studyPatients.filter(p => p.callHistory && p.callHistory.length > 0).length
    const prescreened = studyPatients.filter(p =>
      p.tag === 'Eligible' || p.tag === 'Match' || p.tag === 'Potential Match' || p.tag === 'Ineligible'
    ).length
    const visitScheduled = patientsScheduled

    return {
      study,
      leadsIngested,
      patientsCalled,
      patientsScheduled,
      patientsIncluded,
      pendingReview,
      funnel: { leads, called, answered, prescreened, visitScheduled }
    }
  })

  // Calculate aggregated demographics
  const eligibleOrScheduledPatients = patients.filter(p =>
    p.tag === 'Eligible' || p.tag === 'Match' || p.tag === 'Potential Match' ||
    p.status === 'On-site visit scheduled' || p.status === 'Enrolled'
  )

  const ageGroups = {
    '18-35': eligibleOrScheduledPatients.filter(p => p.age >= 18 && p.age <= 35).length,
    '36-50': eligibleOrScheduledPatients.filter(p => p.age >= 36 && p.age <= 50).length,
    '51-65': eligibleOrScheduledPatients.filter(p => p.age >= 51 && p.age <= 65).length,
    '65+': eligibleOrScheduledPatients.filter(p => p.age > 65).length,
  }

  const genderDist = {
    'Male': eligibleOrScheduledPatients.filter(p => p.gender?.toLowerCase() === 'male').length,
    'Female': eligibleOrScheduledPatients.filter(p => p.gender?.toLowerCase() === 'female').length,
  }

  // Call performance metrics
  const allCallHistories = patients.flatMap(p => p.callHistory || [])
  const totalCalls = allCallHistories.length
  const answeredCalls = allCallHistories.filter(c => c.outcome === 'answered' || c.duration).length
  const completionRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0
  const answerRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0
  const callsWithDuration = allCallHistories.filter(c => c.duration)
  const avgCallDuration = callsWithDuration.length > 0
    ? callsWithDuration.reduce((sum, c) => sum + (c.duration || 0), 0) / callsWithDuration.length
    : 0
  const avgDuration = callsWithDuration.length > 0
    ? (callsWithDuration.reduce((sum, c) => sum + (c.duration || 0), 0) / callsWithDuration.length / 60).toFixed(1)
    : 0

  // Format average duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Eligible patients (from completed calls)
  const eligiblePatients = patients.filter(p => p.tag === 'Eligible' || p.tag === 'Match').length
  const eligibleRate = answeredCalls > 0
    ? Math.round((eligiblePatients / answeredCalls) * 100)
    : 0

  // Conversion rate (visits scheduled from eligible patients)
  const visitScheduledPatients = patients.filter(p => p.status === 'On-site visit scheduled' || p.visitScheduledDate).length
  const conversionRate = eligiblePatients > 0
    ? Math.round((visitScheduledPatients / eligiblePatients) * 100)
    : 0

  // Financial & ROI metrics
  const costPerCall = 10 // Base cost per call attempt
  const totalCampaignCost = totalCalls * costPerCall
  const costPerAnswered = answeredCalls > 0 ? (totalCampaignCost / answeredCalls).toFixed(2) : 0
  const qualifiedPatients = patients.filter(p => p.tag === 'Eligible' || p.tag === 'Match').length
  const costPerQualified = qualifiedPatients > 0 ? (totalCampaignCost / qualifiedPatients).toFixed(2) : 0
  const enrolledPatients = patients.filter(p => p.status === 'Enrolled' || p.visitScheduledDate).length
  const costPerEnrolled = enrolledPatients > 0 ? (totalCampaignCost / enrolledPatients).toFixed(2) : 0
  const targetCostPerEnrolled = 120
  const percentBelowTarget = costPerEnrolled > 0 ? Math.round(((targetCostPerEnrolled - parseFloat(costPerEnrolled.toString())) / targetCostPerEnrolled) * 100) : 0
  const avgValuePerEnrolled = 2500
  const projectedValue = enrolledPatients * avgValuePerEnrolled
  const projectedROI = projectedValue - totalCampaignCost
  const roiStatus = projectedROI > 0 ? 'Positive' : projectedROI < 0 ? 'Negative' : 'Break-even'

  // Get current study for analysis
  const getCurrentStudyData = () => {
    if (selectedStudyForAnalysis === "all") {
      const totalLeads = studyMetrics.reduce((sum, m) => sum + m.leadsIngested, 0)
      const totalCalled = studyMetrics.reduce((sum, m) => sum + m.patientsCalled, 0)
      const totalAnswered = studyMetrics.reduce((sum, m) => sum + m.funnel.answered, 0)
      const totalPrescreened = studyMetrics.reduce((sum, m) => sum + m.funnel.prescreened, 0)
      const totalScheduled = studyMetrics.reduce((sum, m) => sum + m.patientsScheduled, 0)

      return {
        leadsIngested: totalLeads,
        patientsCalled: totalCalled,
        patientsAnswered: totalAnswered,
        patientsPrescreened: totalPrescreened,
        visitScheduled: totalScheduled
      }
    }

    const metric = studyMetrics.find(m => m.study.id === selectedStudyForAnalysis) || studyMetrics[0]
    return {
      leadsIngested: metric?.leadsIngested || 0,
      patientsCalled: metric?.patientsCalled || 0,
      patientsAnswered: metric?.funnel.answered || 0,
      patientsPrescreened: metric?.funnel.prescreened || 0,
      visitScheduled: metric?.patientsScheduled || 0
    }
  }

  // Generate workflow alerts
  const workflowAlerts = []
  studyMetrics.forEach(({ study, pendingReview }) => {
    if (pendingReview > 0) {
      workflowAlerts.push({
        type: 'warning',
        message: `${pendingReview} patients pending review in ${study.title}`,
        action: () => {
          setCurrentStudy(study)
          router.push('/ingest/detail/patients')
        }
      })
    }
  })

  if (patients.filter(p => p.tag === 'Ineligible').length > 20) {
    workflowAlerts.push({
      type: 'critical',
      message: 'High exclusion rate detected - review inclusion criteria',
      action: () => router.push('/ingest')
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enrolled': return 'bg-green-100 text-green-800'
      case 'On-site visit scheduled': return 'bg-blue-100 text-blue-800'
      case 'AI Call Initiated': return 'bg-purple-100 text-purple-800'
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800'
      case 'Declined Participation': return 'bg-orange-100 text-orange-800'
      case 'Failed Screening': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Eligible': return 'bg-green-100 text-green-800 border-green-200'
      case 'Match': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Potential Match': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Ineligible': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-4">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900 font-medium">CRC Dashboard</span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRC Dashboard</h1>
          <p className="text-gray-600">Comprehensive oversight and task prioritization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/ingest')}>
            <FileText className="h-4 w-4 mr-2" />
            Manage Studies
          </Button>
          <Button variant="outline" onClick={() => router.push('/ingest/patients')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Leads
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push('/campaigns')}>
            <Target className="h-4 w-4 mr-2" />
            Start Campaign
          </Button>
        </div>
      </div>

      {/* Continue Where You Left Off */}
      {currentStudy && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-blue-900 mb-2">Continue where you left off</h2>
                <p className="text-blue-700 mb-4">{currentStudy.title} • Last worked on 2 hours ago</p>

                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-blue-800">Documents ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-blue-800">{getPatientsByStudy(currentStudy.id).length} leads imported</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-blue-800">
                      {getPatientsByStudy(currentStudy.id).filter(p => p.status === 'Pending Review').length} patients pending review
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/ingest/detail/patients')}>
                    Review Pending Patients
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push('/ingest/detail')}>
                    View Study Details
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {getPatientsByStudy(currentStudy.id).filter(p => p.status === 'Enrolled').length}
                </div>
                <div className="text-sm text-blue-700">patients enrolled</div>
                <Progress
                  value={Math.round((getPatientsByStudy(currentStudy.id).filter(p => p.status === 'Enrolled').length / getPatientsByStudy(currentStudy.id).length) * 100)}
                  className="w-24 mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Weekly Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Campaign Performance Metrics */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Campaign Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <PhoneCall className="h-5 w-5 text-blue-500 opacity-50" />
                  </div>
                  <p className="text-xs text-slate-600 mb-1">Total Calls Made</p>
                  <p className="text-3xl font-bold text-slate-900">{totalCalls}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12%</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <PhoneIncoming className="h-5 w-5 text-green-500 opacity-50" />
                  </div>
                  <p className="text-xs text-slate-600 mb-1">Calls Completed</p>
                  <p className="text-3xl font-bold text-slate-900">{answeredCalls}</p>
                  <p className="text-xs text-slate-600 mt-1">{completionRate}% of calls made • <span className="text-green-600">↑ 3%</span></p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="h-5 w-5 text-purple-500 opacity-50" />
                  </div>
                  <p className="text-xs text-slate-600 mb-1">Eligible Patients</p>
                  <p className="text-3xl font-bold text-slate-900">{eligiblePatients}</p>
                  <p className="text-xs text-slate-600 mt-1">{eligibleRate}% of completed</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-5 w-5 text-amber-500 opacity-50" />
                  </div>
                  <p className="text-xs text-slate-600 mb-1">Converted (Scheduled)</p>
                  <p className="text-3xl font-bold text-slate-900">{visitScheduledPatients}</p>
                  <p className="text-xs text-slate-600 mt-1">{conversionRate}% of eligible • <span className="text-green-600">↑ 5%</span></p>
                </div>
              </div>
            </div>

            {/* Cost Metrics */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Cost Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Total Campaign Cost</p>
                  <p className="text-2xl font-bold text-slate-900">${totalCampaignCost.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Cost per Call</p>
                  <p className="text-2xl font-bold text-slate-900">${costPerCall}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Cost per Qualified</p>
                  <p className="text-2xl font-bold text-slate-900">${costPerQualified}</p>
                  <p className="text-xs text-green-600 mt-1">↓ 8%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Cost per Enrolled</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {enrolledPatients > 0 ? `$${costPerEnrolled}` : 'N/A'}
                  </p>
                  <p className="text-xs text-green-600 mt-1">{enrolledPatients > 0 ? '↓ 15%' : '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Alerts */}
      {workflowAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Next Steps & Alerts ({workflowAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflowAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                    alert.type === 'critical' ? 'border-red-200 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                  onClick={alert.action}
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-5 w-5 ${
                      alert.type === 'critical' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <span className="flex-1 text-sm">{alert.message}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Selector & Recruitment Funnel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recruitment Funnel
            </CardTitle>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Select Study:</label>
              <Select
                value={selectedStudyForAnalysis}
                onValueChange={(value) => {
                  setSelectedStudyForAnalysis(value)
                  if (value !== "all") {
                    const study = studies.find(s => s.id === value)
                    if (study) setCurrentStudy(study)
                  }
                }}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a study" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Studies Combined</SelectItem>
                  {studies.map(study => (
                    <SelectItem key={study.id} value={study.id}>
                      {study.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStudyForAnalysis !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const study = studies.find(s => s.id === selectedStudyForAnalysis)
                    if (study) {
                      setCurrentStudy(study)
                      router.push('/ingest/detail')
                    }
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {studies.length === 0 ? (
            <div className="text-center py-12">
              <Beaker className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Studies Yet</h3>
              <p className="text-sm text-gray-600 mb-4">Upload a protocol to get started</p>
              <Button onClick={() => router.push('/ingest')}>
                <FileText className="h-4 w-4 mr-2" />
                Upload Protocol
              </Button>
            </div>
          ) : (
            (() => {
              // Get selected study data or aggregate all studies
              let currentData
              if (selectedStudyForAnalysis === "all") {
                const totalLeads = studyMetrics.reduce((sum, m) => sum + m.leadsIngested, 0)
                const totalCalled = studyMetrics.reduce((sum, m) => sum + m.patientsCalled, 0)
                const totalAnswered = studyMetrics.reduce((sum, m) => sum + m.funnel.answered, 0)
                const totalPrescreened = studyMetrics.reduce((sum, m) => sum + m.funnel.prescreened, 0)
                const totalScheduled = studyMetrics.reduce((sum, m) => sum + m.patientsScheduled, 0)

                currentData = {
                  leadsIngested: totalLeads,
                  patientsCalled: totalCalled,
                  patientsAnswered: totalAnswered,
                  patientsPrescreened: totalPrescreened,
                  visitScheduled: totalScheduled
                }
              } else {
                const metric = studyMetrics.find(m => m.study.id === selectedStudyForAnalysis)
                if (metric) {
                  currentData = {
                    leadsIngested: metric.leadsIngested,
                    patientsCalled: metric.patientsCalled,
                    patientsAnswered: metric.funnel.answered,
                    patientsPrescreened: metric.funnel.prescreened,
                    visitScheduled: metric.patientsScheduled
                  }
                } else {
                  currentData = {
                    leadsIngested: 0,
                    patientsCalled: 0,
                    patientsAnswered: 0,
                    patientsPrescreened: 0,
                    visitScheduled: 0
                  }
                }
              }

              return (
                <div className="space-y-6">
                  {/* Horizontal Funnel Chart */}
                  <div className="grid grid-cols-5 gap-2">
                    <div className="text-center">
                      <div className="bg-slate-100 p-4 rounded-l-lg border border-slate-300">
                        <div className="text-2xl font-bold text-slate-800">{currentData.leadsIngested}</div>
                        <div className="text-xs text-slate-700 mt-1">Leads</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-gray-100 p-4 border border-slate-300">
                        <div className="text-2xl font-bold text-gray-800">{currentData.patientsCalled}</div>
                        <div className="text-xs text-gray-700 mt-1">Called</div>
                        <div className="text-xs mt-2 text-gray-600 font-medium">
                          {currentData.leadsIngested > 0 ? Math.round((currentData.patientsCalled / currentData.leadsIngested) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-zinc-100 p-4 border border-slate-300">
                        <div className="text-2xl font-bold text-zinc-800">{currentData.patientsAnswered}</div>
                        <div className="text-xs text-zinc-700 mt-1">Answered</div>
                        <div className="text-xs mt-2 text-zinc-600 font-medium">
                          {currentData.patientsCalled > 0 ? Math.round((currentData.patientsAnswered / currentData.patientsCalled) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-stone-100 p-4 border border-slate-300">
                        <div className="text-2xl font-bold text-stone-800">{currentData.patientsPrescreened}</div>
                        <div className="text-xs text-stone-700 mt-1">Prescreened</div>
                        <div className="text-xs mt-2 text-stone-600 font-medium">
                          {currentData.patientsAnswered > 0 ? Math.round((currentData.patientsPrescreened / currentData.patientsAnswered) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-emerald-100 p-4 rounded-r-lg border border-slate-300">
                        <div className="text-2xl font-bold text-emerald-800">{currentData.visitScheduled}</div>
                        <div className="text-xs text-emerald-700 mt-1">Visit Scheduled</div>
                        <div className="text-xs mt-2 text-emerald-600 font-medium">
                          {currentData.patientsPrescreened > 0 ? Math.round((currentData.visitScheduled / currentData.patientsPrescreened) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-blue-700 font-bold text-2xl">
                        {currentData.patientsCalled > 0 ? Math.round((currentData.patientsAnswered / currentData.patientsCalled) * 100) : 0}%
                      </div>
                      <div className="text-blue-600 text-sm mt-1">Call Answer Rate</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-green-700 font-bold text-2xl">
                        {currentData.patientsAnswered > 0 ? Math.round((currentData.patientsPrescreened / currentData.patientsAnswered) * 100) : 0}%
                      </div>
                      <div className="text-green-600 text-sm mt-1">Prescreening Pass Rate</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-purple-700 font-bold text-2xl">
                        {currentData.patientsPrescreened > 0 ? Math.round((currentData.visitScheduled / currentData.patientsPrescreened) * 100) : 0}%
                      </div>
                      <div className="text-purple-600 text-sm mt-1">Visit Scheduling Rate</div>
                    </div>
                  </div>
                </div>
              )
            })()
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search patients by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                <SelectItem value="Match">Match</SelectItem>
                <SelectItem value="Potential Match">Potential Match</SelectItem>
                <SelectItem value="Eligible">Eligible</SelectItem>
                <SelectItem value="Ineligible">Ineligible</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending Review">Pending Review</SelectItem>
                <SelectItem value="AI Call Initiated">AI Call Initiated</SelectItem>
                <SelectItem value="On-site visit scheduled">Visit Scheduled</SelectItem>
                <SelectItem value="Declined Participation">Declined</SelectItem>
                <SelectItem value="Failed Screening">Failed Screening</SelectItem>
                <SelectItem value="Enrolled">Enrolled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
