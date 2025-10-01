"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useStudy } from "@/contexts/study-context"
import { usePatients } from "@/contexts/patient-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Phone,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
  ArrowRight,
  Upload,
  ChevronRight,
  Home,
  Beaker,
  Target,
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

  // Cost per call constant
  const costPerCall = 10

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

    // Calculate total calls for this study
    const studyCallHistories = studyPatients.flatMap(p => p.callHistory || [])
    const totalStudyCalls = studyCallHistories.length
    const totalCallCost = totalStudyCalls * costPerCall

    // Calculate days until enrollment deadline
    const daysUntilDeadline = study.enrollmentDeadline
      ? Math.ceil((study.enrollmentDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null

    return {
      study,
      leadsIngested,
      patientsCalled,
      patientsScheduled,
      patientsIncluded,
      pendingReview,
      totalCallCost,
      daysUntilDeadline,
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

      {/* Studies Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Studies ({studies.length})
          </CardTitle>
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
            <div className="space-y-4">
              {studyMetrics.map(({ study, leadsIngested, patientsCalled, patientsScheduled, patientsIncluded, pendingReview, totalCallCost, daysUntilDeadline }) => (
                <div key={study.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{study.title}</h3>
                        <Badge className={study.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {study.status}
                        </Badge>
                        <Badge variant="outline">{study.phase}</Badge>
                        {pendingReview > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 animate-pulse">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {pendingReview} Pending Review
                          </Badge>
                        )}
                        {daysUntilDeadline !== null && (
                          <Badge variant="outline" className={`${daysUntilDeadline < 30 ? 'bg-red-50 text-red-700 border-red-200' : daysUntilDeadline < 90 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {daysUntilDeadline > 0 ? `${daysUntilDeadline} days until deadline` : 'Deadline passed'}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {totalCallCost.toLocaleString()}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{study.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>PI: {study.principalInvestigator}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentStudy(study)
                          router.push('/ingest/detail')
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Study Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center bg-slate-50 p-3 rounded border">
                      <div className="text-lg font-bold text-slate-700">{leadsIngested}</div>
                      <div className="text-xs text-gray-600">Leads Ingested</div>
                    </div>
                    <div className="text-center bg-gray-50 p-3 rounded border">
                      <div className="text-lg font-bold text-gray-700">{patientsCalled}</div>
                      <div className="text-xs text-gray-600">Patients Called</div>
                    </div>
                    <div className="text-center bg-zinc-50 p-3 rounded border">
                      <div className="text-lg font-bold text-zinc-700">{patientsScheduled}</div>
                      <div className="text-xs text-gray-600">Visits Scheduled</div>
                    </div>
                    <div className="text-center bg-stone-50 p-3 rounded border">
                      <div className="text-lg font-bold text-stone-700">{patientsIncluded}</div>
                      <div className="text-xs text-gray-600">Enrolled</div>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Enrollment Progress</span>
                      <span>{study.currentEnrollment} / {study.enrollmentTarget} ({Math.round((study.currentEnrollment / study.enrollmentTarget) * 100)}%)</span>
                    </div>
                    <Progress value={(study.currentEnrollment / study.enrollmentTarget) * 100} className="h-2 bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
