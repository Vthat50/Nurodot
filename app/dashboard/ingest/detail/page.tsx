"use client"

import { useRouter } from "next/navigation"
import { useStudy } from "@/contexts/study-context"
import { usePatients } from "@/contexts/patient-context"
import { useCampaign } from "@/contexts/campaign-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { exportPatientsToCSV } from "@/lib/utils"
import {
  ArrowLeft,
  Users,
  Target,
  TrendingUp,
  Calendar,
  FileText,
  Upload,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PhoneCall,
  UserPlus,
  Download
} from "lucide-react"

export default function StudyDetailPage() {
  const router = useRouter()
  const { currentStudy } = useStudy()
  const { patients, getPatientsByStudy } = usePatients()
  const { campaigns } = useCampaign()

  if (!currentStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Study Selected</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please select a study first.
            </p>
            <Button onClick={() => router.push('/ingest')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Studies
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const studyPatients = getPatientsByStudy(currentStudy.id)
  const studyCampaigns = campaigns.filter(c => c.studyId === currentStudy.id)

  // Calculate pipeline metrics using new tag/status system
  const totalImported = studyPatients.length
  const preScreened = studyPatients.filter(p =>
    p.tag === 'Match' || p.tag === 'Potential Match' || p.tag === 'Eligible' || p.tag === 'Ineligible'
  ).length
  const qualified = studyPatients.filter(p => p.tag === 'Eligible' || p.tag === 'Match').length
  const contacted = studyPatients.filter(p =>
    p.status === 'AI Call Initiated' || p.status === 'On-site visit scheduled' ||
    p.status === 'Declined Participation' || p.status === 'Failed Screening'
  ).length
  const enrolled = studyPatients.filter(p => p.status === 'Enrolled').length

  const enrollmentProgress = currentStudy.enrollmentTarget > 0
    ? (currentStudy.currentEnrollment / currentStudy.enrollmentTarget) * 100
    : 0

  const conversionRate = preScreened > 0 ? ((qualified / preScreened) * 100).toFixed(1) : '0'
  const enrollmentRate = qualified > 0 ? ((enrolled / qualified) * 100).toFixed(1) : '0'

  // Export handler
  const handleExportPatients = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${currentStudy.id}_patients_${timestamp}.csv`
    exportPatientsToCSV(studyPatients, filename)
  }

  // Recent activity (mock data)
  const recentActivity = [
    { type: 'enrollment', text: 'Patient enrolled', time: '2 hours ago', icon: CheckCircle, color: 'text-green-600' },
    { type: 'campaign', text: 'New campaign created', time: 'Yesterday', icon: Target, color: 'text-blue-600' },
    { type: 'import', text: `${studyPatients.length} patients imported`, time: '3 days ago', icon: Users, color: 'text-purple-600' },
  ]

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
                onClick={() => router.push('/ingest')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Studies
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{currentStudy.title}</h1>
                <p className="text-sm text-slate-600">{currentStudy.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPatients}
                disabled={studyPatients.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Patients
              </Button>
              <Badge variant="secondary" className="text-sm">
                {currentStudy.phase}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients ({totalImported})</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns ({studyCampaigns.length})</TabsTrigger>
            <TabsTrigger value="criteria">Criteria</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enrollment Progress */}
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Enrollment Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Current / Target</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {currentStudy.currentEnrollment} / {currentStudy.enrollmentTarget}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-1">Completion</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {enrollmentProgress.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={enrollmentProgress} className="h-3" />
                  <p className="text-sm text-slate-600">
                    {currentStudy.enrollmentTarget - currentStudy.currentEnrollment} more patients needed to reach target
                  </p>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, idx) => {
                      const Icon = activity.icon
                      return (
                        <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-slate-50">
                          <Icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{activity.text}</p>
                            <p className="text-xs text-slate-500">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recruitment Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recruitment Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{totalImported}</p>
                      <p className="text-sm text-gray-600">Leads Ingested</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{contacted}</p>
                      <p className="text-sm text-gray-600">Patients Called</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {totalImported > 0 ? Math.round((contacted / totalImported) * 100) : 0}% conversion
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-yellow-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {studyPatients.filter(p => p.callHistory && p.callHistory.length > 0).length}
                      </p>
                      <p className="text-sm text-gray-600">Calls Completed</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {contacted > 0 ? Math.round((studyPatients.filter(p => p.callHistory && p.callHistory.length > 0).length / contacted) * 100) : 0}% conversion
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {studyPatients.filter(p => p.status === 'On-site visit scheduled' || p.visitScheduledDate).length}
                      </p>
                      <p className="text-sm text-gray-600">Visits Scheduled</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {studyPatients.filter(p => p.callHistory && p.callHistory.length > 0).length > 0 ? Math.round((studyPatients.filter(p => p.status === 'On-site visit scheduled' || p.visitScheduledDate).length / studyPatients.filter(p => p.callHistory && p.callHistory.length > 0).length) * 100) : 0}% conversion
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-emerald-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">{enrolled}</p>
                      <p className="text-sm text-gray-600">Enrolled</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {studyPatients.filter(p => p.status === 'On-site visit scheduled' || p.visitScheduledDate).length > 0 ? Math.round((enrolled / studyPatients.filter(p => p.status === 'On-site visit scheduled' || p.visitScheduledDate).length) * 100) : 0}% conversion
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recruitment Blockers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Recruitment Blockers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Analyze exclusion criteria from patient data
                    const exclusionReasons: { [key: string]: number } = {}
                    studyPatients.forEach(p => {
                      if (p.criteriaMatches) {
                        p.criteriaMatches.forEach(cm => {
                          if (cm.type === 'exclusion' && !cm.matched) {
                            const reason = cm.criterionText
                            exclusionReasons[reason] = (exclusionReasons[reason] || 0) + 1
                          }
                        })
                      }
                    })

                    // Calculate leads data inconsistency - criteria not met in EHR but confirmed on call
                    let mmseInconsistency = 0
                    let studyPartnerInconsistency = 0
                    studyPatients.forEach(p => {
                      if (p.criteriaMatches) {
                        p.criteriaMatches.forEach(cm => {
                          // MMSE score mismatch example from Margaret Thompson
                          if (cm.criterionText.includes('MMSE') && !cm.matched && cm.source === 'EHR') {
                            mmseInconsistency++
                          }
                          // Study partner confirmed on call but not in EHR
                          if (cm.criterionText.toLowerCase().includes('study partner') && cm.source === 'AI Call') {
                            studyPartnerInconsistency++
                          }
                        })
                      }
                    })

                    // Calculate call drop-off reasons from call history and transcripts
                    let noAnswer = 0
                    let voicemail = 0
                    let declinedTimeCommitment = 0
                    let declinedOther = 0
                    let completed = 0
                    studyPatients.forEach(p => {
                      if (p.callHistory && p.callHistory.length > 0) {
                        const lastCall = p.callHistory[p.callHistory.length - 1]
                        if (lastCall.outcome === 'no_answer') noAnswer++
                        else if (lastCall.outcome === 'voicemail') voicemail++
                        else if (lastCall.outcome === 'declined') {
                          // Check transcript for time commitment mention
                          const hasTimeCommitmentMention = lastCall.messages?.some(m =>
                            m.speaker === 'patient' && (
                              m.text.toLowerCase().includes('time commitment') ||
                              m.text.toLowerCase().includes('travel') ||
                              m.text.toLowerCase().includes('commit to that')
                            )
                          )
                          if (hasTimeCommitmentMention) {
                            declinedTimeCommitment++
                          } else {
                            declinedOther++
                          }
                        }
                        else if (lastCall.outcome === 'completed') completed++
                      }
                    })

                    const topExclusions = Object.entries(exclusionReasons)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 2)

                    return (
                      <div className="space-y-4">
                        {/* Top Exclusion Criteria */}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Top Exclusion Criteria</h4>
                          <div className="space-y-1.5">
                            {topExclusions.map(([reason, count]) => (
                              <div key={reason} className="flex justify-between text-xs">
                                <span className="text-slate-700 truncate pr-2">{reason}</span>
                                <span className="font-medium text-red-600 flex-shrink-0">{count} patient{count > 1 ? 's' : ''}</span>
                              </div>
                            ))}
                            {topExclusions.length === 0 && (
                              <p className="text-xs text-slate-500 italic">No exclusion criteria violations found</p>
                            )}
                          </div>
                        </div>

                        {/* Leads Data Inconsistency */}
                        <div className="pt-3 border-t">
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Leads Data Inconsistency</h4>
                          <div className="space-y-1.5">
                            {mmseInconsistency > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-700">MMSE score mismatch (EHR vs screening)</span>
                                <span className="font-medium text-amber-600">{mmseInconsistency} patient{mmseInconsistency > 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {studyPartnerInconsistency > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-700">Study partner confirmed on call</span>
                                <span className="font-medium text-amber-600">{studyPartnerInconsistency} patient{studyPartnerInconsistency > 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {mmseInconsistency === 0 && studyPartnerInconsistency === 0 && (
                              <p className="text-xs text-slate-500 italic">No data inconsistencies detected</p>
                            )}
                          </div>
                        </div>

                        {/* Call Drop-off Reasons */}
                        <div className="pt-3 border-t">
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Call Drop-off Reasons</h4>
                          <div className="space-y-1.5">
                            {noAnswer > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-700">No answer</span>
                                <span className="font-medium text-slate-600">{noAnswer} patient{noAnswer > 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {voicemail > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-700">Voicemail left</span>
                                <span className="font-medium text-slate-600">{voicemail} patient{voicemail > 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {declinedTimeCommitment > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-700">Declined - Time commitment concerns</span>
                                <span className="font-medium text-slate-600">{declinedTimeCommitment} patient{declinedTimeCommitment > 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {declinedOther > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-700">Declined - Other reasons</span>
                                <span className="font-medium text-slate-600">{declinedOther} patient{declinedOther > 1 ? 's' : ''}</span>
                              </div>
                            )}
                            {noAnswer === 0 && voicemail === 0 && declinedTimeCommitment === 0 && declinedOther === 0 && (
                              <p className="text-xs text-slate-500 italic">No call drop-offs detected</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Demographics Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const eligibleOrScheduled = studyPatients.filter(p =>
                      p.tag === 'Eligible' || p.tag === 'Match' || p.tag === 'Potential Match' ||
                      p.status === 'On-site visit scheduled' || p.status === 'Enrolled'
                    )
                    const total = eligibleOrScheduled.length

                    const ageCounts = {
                      '18-35': eligibleOrScheduled.filter(p => p.age >= 18 && p.age <= 35).length,
                      '36-50': eligibleOrScheduled.filter(p => p.age >= 36 && p.age <= 50).length,
                      '51-65': eligibleOrScheduled.filter(p => p.age >= 51 && p.age <= 65).length,
                      '65+': eligibleOrScheduled.filter(p => p.age > 65).length,
                    }

                    const genderCounts = {
                      'Female': eligibleOrScheduled.filter(p => p.gender?.toLowerCase() === 'female').length,
                      'Male': eligibleOrScheduled.filter(p => p.gender?.toLowerCase() === 'male').length,
                    }

                    // Calculate percentages
                    const agePercentages = Object.fromEntries(
                      Object.entries(ageCounts).map(([key, count]) => [key, total > 0 ? (count / total) * 100 : 0])
                    )

                    const genderPercentages = Object.fromEntries(
                      Object.entries(genderCounts).map(([key, count]) => [key, total > 0 ? (count / total) * 100 : 0])
                    )

                    // Calculate stroke-dasharray values for pie chart (circumference = 2πr = 251.2 for r=40)
                    const circumference = 251.2
                    let ageOffset = 0
                    const ageSegments = Object.entries(agePercentages).map(([key, pct], idx) => {
                      const dashLength = (pct / 100) * circumference
                      const segment = { key, pct, dashLength, offset: ageOffset }
                      ageOffset -= dashLength
                      return segment
                    })

                    let genderOffset = 0
                    const genderSegments = Object.entries(genderPercentages).map(([key, pct]) => {
                      const dashLength = (pct / 100) * circumference
                      const segment = { key, pct, dashLength, offset: genderOffset }
                      genderOffset -= dashLength
                      return segment
                    })

                    const ageColors = ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']
                    const genderColors = ['#8b5cf6', '#c4b5fd']

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Age Distribution Pie Chart */}
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-3">Age Groups</p>
                          <div className="flex items-center justify-center mb-3">
                            <div className="relative w-32 h-32">
                              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                {ageSegments.map((seg, idx) => (
                                  <circle
                                    key={seg.key}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke={ageColors[idx]}
                                    strokeWidth="20"
                                    strokeDasharray={`${seg.dashLength} ${circumference}`}
                                    strokeDashoffset={seg.offset}
                                  />
                                ))}
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <p className="text-xl font-bold text-slate-900">{total}</p>
                                  <p className="text-xs text-slate-600">Total</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {Object.entries(ageCounts).map(([ageGroup, count], idx) => (
                              <div key={ageGroup} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ageColors[idx] }}></div>
                                <span className="text-xs text-slate-600">{ageGroup} ({Math.round(agePercentages[ageGroup])}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Gender Distribution Pie Chart */}
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-3">Gender</p>
                          <div className="flex items-center justify-center mb-3">
                            <div className="relative w-32 h-32">
                              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                {genderSegments.map((seg, idx) => (
                                  <circle
                                    key={seg.key}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke={genderColors[idx]}
                                    strokeWidth="20"
                                    strokeDasharray={`${seg.dashLength} ${circumference}`}
                                    strokeDashoffset={seg.offset}
                                  />
                                ))}
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <p className="text-xl font-bold text-slate-900">{total}</p>
                                  <p className="text-xs text-slate-600">Total</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {Object.entries(genderCounts).map(([gender, count], idx) => (
                              <div key={gender} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: genderColors[idx] }}></div>
                                <span className="text-xs text-slate-600">{gender} ({Math.round(genderPercentages[gender])}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Patients in Study</CardTitle>
                  <Button onClick={() => router.push('/ingest/detail/patients')}>
                    <Users className="h-4 w-4 mr-2" />
                    View All Patients
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {studyPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No Patients Yet
                    </h3>
                    <p className="text-sm text-slate-600 mb-6">
                      Import patients to start screening for this study.
                    </p>
                    <Button onClick={() => router.push('/ingest/patients')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Patients
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studyPatients.slice(0, 10).map((patient) => (
                      <div
                        key={patient.id}
                        className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/ingest/patients/${patient.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-900">{patient.name}</h4>
                              <Badge variant="outline" className={
                                patient.tag === 'Eligible' ? 'bg-green-100 text-green-700' :
                                patient.tag === 'Match' ? 'bg-blue-100 text-blue-700' :
                                patient.tag === 'Potential Match' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }>
                                {patient.tag}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              {patient.age} years old • {patient.gender}
                            </p>
                          </div>
                          <Badge className={
                            patient.status === 'Enrolled' ? 'bg-green-600' :
                            patient.status === 'On-site visit scheduled' ? 'bg-blue-600' :
                            patient.status === 'AI Call Initiated' ? 'bg-purple-600' :
                            patient.status === 'Declined Participation' ? 'bg-orange-600' :
                            patient.status === 'Failed Screening' ? 'bg-red-600' :
                            'bg-slate-600'
                          }>
                            {patient.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {studyPatients.length > 10 && (
                      <Button variant="outline" className="w-full" onClick={() => router.push('/ingest/detail/patients')}>
                        View All {studyPatients.length} Patients
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Campaigns</CardTitle>
                  <Button onClick={() => router.push('/campaigns')}>
                    <Target className="h-4 w-4 mr-2" />
                    View All Campaigns
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {studyCampaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No Campaigns Yet
                    </h3>
                    <p className="text-sm text-slate-600 mb-6">
                      Create a campaign to start reaching out to qualified patients.
                    </p>
                    <Button onClick={() => router.push('/ingest/patients')}>
                      Create Campaign
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studyCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/campaigns/${campaign.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                          <Badge variant="secondary">{campaign.totalPatients} patients</Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <p className="text-slate-600">Contacted</p>
                            <p className="font-semibold text-blue-900">{campaign.contacted}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Interested</p>
                            <p className="font-semibold text-purple-900">{campaign.interested}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Scheduled</p>
                            <p className="font-semibold text-amber-900">{campaign.scheduled}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Enrolled</p>
                            <p className="font-semibold text-green-900">{campaign.enrolled}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Criteria Tab */}
          <TabsContent value="criteria">
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                {!currentStudy.criteria ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No Criteria Extracted
                    </h3>
                    <p className="text-sm text-slate-600 mb-6">
                      Upload a protocol to extract eligibility criteria.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Inclusion Criteria */}
                    <div>
                      <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Inclusion Criteria ({currentStudy.criteria.inclusion.length})
                      </h3>
                      <div className="space-y-2">
                        {currentStudy.criteria.inclusion.map((criterion) => (
                          <div key={criterion.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-slate-900">{criterion.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exclusion Criteria */}
                    <div>
                      <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Exclusion Criteria ({currentStudy.criteria.exclusion.length})
                      </h3>
                      <div className="space-y-2">
                        {currentStudy.criteria.exclusion.map((criterion) => (
                          <div key={criterion.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-slate-900">{criterion.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Screening Questions */}
                    {currentStudy.criteria.questions.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Screening Questions ({currentStudy.criteria.questions.length})
                        </h3>
                        <div className="space-y-2">
                          {currentStudy.criteria.questions.map((question, idx) => (
                            <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-slate-900">{question}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="border-purple-200 bg-purple-50/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Documents & Versions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <p className="font-semibold text-slate-900">Study Protocol</p>
                      </div>
                      <p className="text-xs text-slate-600">CLARITY-AD-Protocol-v1.2.pdf</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      v1.2 Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                    <span>3 versions</span>
                    <span>Last updated 2 days ago</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push('/protocol')}
                  >
                    View Version History
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push('/protocol')}>
                    <Upload className="h-3 w-3 mr-2" />
                    Upload New Version
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-3 w-3 mr-2" />
                    View Current
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}