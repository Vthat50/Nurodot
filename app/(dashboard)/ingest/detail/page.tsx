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
        {/* Enrollment Progress Card */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Enrollment Progress
              </span>
              <span className="text-3xl font-bold text-blue-900">
                {currentStudy.currentEnrollment} / {currentStudy.enrollmentTarget}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={enrollmentProgress} className="h-3 mb-2" />
            <p className="text-sm text-slate-600">
              {enrollmentProgress.toFixed(0)}% complete • {currentStudy.enrollmentTarget - currentStudy.currentEnrollment} more patients needed
            </p>
          </CardContent>
        </Card>

        {/* Patient Pipeline - Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/ingest/detail/patients')}>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{totalImported}</p>
              <p className="text-xs text-slate-600 mt-1">Imported</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-900">{preScreened}</p>
              <p className="text-xs text-slate-600 mt-1">Pre-Screened</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-900">{qualified}</p>
              <p className="text-xs text-slate-600 mt-1">Qualified</p>
              <p className="text-xs text-green-700 font-semibold mt-1">{conversionRate}% conversion</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <PhoneCall className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-900">{contacted}</p>
              <p className="text-xs text-slate-600 mt-1">Contacted</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-900">{enrolled}</p>
              <p className="text-xs text-slate-600 mt-1">Enrolled</p>
              <p className="text-xs text-green-700 font-semibold mt-1">{enrollmentRate}% enrollment</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients ({totalImported})</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns ({studyCampaigns.length})</TabsTrigger>
            <TabsTrigger value="criteria">Criteria</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" onClick={() => router.push('/ingest/patients')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import More Patients
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => router.push('/ingest/detail/patients')}>
                    <Users className="h-4 w-4 mr-2" />
                    View All Patients
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => router.push('/campaigns')}>
                    <Target className="h-4 w-4 mr-2" />
                    Create New Campaign
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View Protocol
                  </Button>
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

            {/* Documents & Versions Card */}
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
        </Tabs>

        {/* Detailed Analytics Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recruitment Funnel - {currentStudy.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const leads = totalImported
              const called = contacted
              const answered = studyPatients.filter(p => p.callHistory && p.callHistory.length > 0).length
              const prescreened = preScreened
              const visitScheduled = studyPatients.filter(p =>
                p.status === 'On-site visit scheduled' || p.visitScheduledDate
              ).length

              return (
                <div className="space-y-4">
                  {/* Horizontal Funnel Chart */}
                  <div className="grid grid-cols-5 gap-2">
                    <div className="text-center">
                      <div className="bg-slate-100 p-3 rounded-l-lg border border-slate-300">
                        <div className="text-xl font-bold text-slate-800">{leads}</div>
                        <div className="text-xs text-slate-700">Leads</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-gray-100 p-3 border border-slate-300">
                        <div className="text-xl font-bold text-gray-800">{called}</div>
                        <div className="text-xs text-gray-700">Called</div>
                        <div className="text-xs mt-1 text-gray-600">
                          {leads > 0 ? Math.round((called / leads) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-zinc-100 p-3 border border-slate-300">
                        <div className="text-xl font-bold text-zinc-800">{answered}</div>
                        <div className="text-xs text-zinc-700">Answered</div>
                        <div className="text-xs mt-1 text-zinc-600">
                          {called > 0 ? Math.round((answered / called) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-stone-100 p-3 border border-slate-300">
                        <div className="text-xl font-bold text-stone-800">{prescreened}</div>
                        <div className="text-xs text-stone-700">Prescreened</div>
                        <div className="text-xs mt-1 text-stone-600">
                          {answered > 0 ? Math.round((prescreened / answered) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="bg-emerald-100 p-3 rounded-r-lg border border-slate-300">
                        <div className="text-xl font-bold text-emerald-800">{visitScheduled}</div>
                        <div className="text-xs text-emerald-700">Visit Scheduled</div>
                        <div className="text-xs mt-1 text-emerald-600">
                          {prescreened > 0 ? Math.round((visitScheduled / prescreened) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recruitment Metrics */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <div className="text-blue-700 font-medium text-lg">
                        {called > 0 ? Math.round((answered / called) * 100) : 0}%
                      </div>
                      <div className="text-blue-600">Call Answer Rate</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <div className="text-green-700 font-medium text-lg">
                        {answered > 0 ? Math.round((prescreened / answered) * 100) : 0}%
                      </div>
                      <div className="text-green-600">Prescreening Pass Rate</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded border border-purple-200">
                      <div className="text-purple-700 font-medium text-lg">
                        {prescreened > 0 ? Math.round((visitScheduled / prescreened) * 100) : 0}%
                      </div>
                      <div className="text-purple-600">Visit Scheduling Rate</div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top Exclusionary Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Top Exclusions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">Age outside range</span>
                    <span className="font-medium text-red-600">
                      {totalImported > 0 ? Math.round((studyPatients.filter(p => p.age < 18 || p.age > 65).length / totalImported) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={totalImported > 0 ? (studyPatients.filter(p => p.age < 18 || p.age > 65).length / totalImported) * 100 : 0}
                    className="h-2 bg-gray-200"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">Medical condition required</span>
                    <span className="font-medium text-red-600">
                      {Math.round(studyPatients.filter(p => p.tag === 'Ineligible').length * 0.6 / totalImported * 100) || 0}%
                    </span>
                  </div>
                  <Progress value={studyPatients.filter(p => p.tag === 'Ineligible').length * 0.6 / totalImported * 100 || 0} className="h-2 bg-gray-200" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">Medication contraindication</span>
                    <span className="font-medium text-red-600">
                      {Math.round(studyPatients.filter(p => p.tag === 'Ineligible').length * 0.3 / totalImported * 100) || 0}%
                    </span>
                  </div>
                  <Progress value={studyPatients.filter(p => p.tag === 'Ineligible').length * 0.3 / totalImported * 100 || 0} className="h-2 bg-gray-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demographics Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const eligibleOrScheduled = studyPatients.filter(p =>
                  p.tag === 'Eligible' || p.tag === 'Match' || p.tag === 'Potential Match' ||
                  p.status === 'On-site visit scheduled' || p.status === 'Enrolled'
                )
                const ageGroups = {
                  '18-35': eligibleOrScheduled.filter(p => p.age >= 18 && p.age <= 35).length,
                  '36-50': eligibleOrScheduled.filter(p => p.age >= 36 && p.age <= 50).length,
                  '51-65': eligibleOrScheduled.filter(p => p.age >= 51 && p.age <= 65).length,
                  '65+': eligibleOrScheduled.filter(p => p.age > 65).length,
                }
                const genderDist = {
                  'Male': eligibleOrScheduled.filter(p => p.gender?.toLowerCase() === 'male').length,
                  'Female': eligibleOrScheduled.filter(p => p.gender?.toLowerCase() === 'female').length,
                }
                return (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3 text-sm">Age Distribution (Eligible/Scheduled)</h4>
                      <div className="space-y-2">
                        {Object.entries(ageGroups).map(([ageGroup, count]) => (
                          <div key={ageGroup} className="flex justify-between text-sm">
                            <span>{ageGroup}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3 text-sm">Gender</h4>
                      <div className="space-y-2">
                        {Object.entries(genderDist).map(([gender, count]) => (
                          <div key={gender} className="flex justify-between text-sm">
                            <span>{gender}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          {/* Call Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5" />
                Call Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const allCallHistories = studyPatients.flatMap(p => p.callHistory || [])
                const totalCalls = allCallHistories.length
                const answeredCalls = allCallHistories.filter(c => c.outcome === 'answered' || c.duration).length
                const answerRate = totalCalls > 0 ? Math.round((answeredCalls / totalCalls) * 100) : 0
                const callsWithDuration = allCallHistories.filter(c => c.duration)
                const avgDuration = callsWithDuration.length > 0
                  ? (callsWithDuration.reduce((sum, c) => sum + (c.duration || 0), 0) / callsWithDuration.length / 60).toFixed(1)
                  : 0
                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Answer Rate</span>
                        <span className="font-medium">{answerRate}%</span>
                      </div>
                      <Progress value={answerRate} className="h-2 bg-gray-200" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Best Call Times</div>
                      <div className="text-lg font-semibold">Weekdays 10-12 AM</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Avg Duration</div>
                        <div className="font-medium">{avgDuration} min</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Total Calls</div>
                        <div className="font-medium">{totalCalls}</div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}