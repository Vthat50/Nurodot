"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useStudy } from "@/contexts/study-context"
import { usePatients } from "@/contexts/patient-context"
import {
  BarChart3,
  PhoneCall,
  PhoneIncoming,
  Clock,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
  ArrowLeft
} from "lucide-react"

export default function AnalyticsPage() {
  const router = useRouter()
  const { currentStudy } = useStudy()
  const { getPatientsByStudy } = usePatients()

  if (!currentStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Study Selected</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please select a study to view analytics.
            </p>
            <Button onClick={() => router.push('/ingest')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Studies
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const studyPatients = getPatientsByStudy(currentStudy.id)

  // Calculate study-specific metrics
  const totalLeads = studyPatients.length
  const totalCalled = studyPatients.filter(p =>
    p.status !== 'Pending Review'
  ).length
  const totalAnswered = studyPatients.filter(p =>
    p.callHistory && p.callHistory.length > 0
  ).length
  const totalPrescreened = studyPatients.filter(p =>
    p.tag === 'Eligible' || p.tag === 'Match' || p.tag === 'Potential Match' || p.tag === 'Ineligible'
  ).length
  const totalVisitScheduled = studyPatients.filter(p =>
    p.status === 'On-site visit scheduled' || p.visitScheduledDate
  ).length

  // Calculate conversion rates
  const callRate = totalLeads > 0 ? Math.round((totalCalled / totalLeads) * 100) : 0
  const answerRate = totalCalled > 0 ? Math.round((totalAnswered / totalCalled) * 100) : 0
  const prescreenRate = totalLeads > 0 ? Math.round((totalPrescreened / totalLeads) * 100) : 0
  const visitRate = totalLeads > 0 ? Math.round((totalVisitScheduled / totalLeads) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
              <p className="text-sm text-slate-600">Recruitment performance for {currentStudy.title}</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {currentStudy.phase}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Leads</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{totalLeads}</p>
                  <p className="text-xs text-slate-600 mt-1">patients in study</p>
                </div>
                <Users className="h-12 w-12 text-slate-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Calls Made</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{totalCalled}</p>
                  <p className="text-xs text-slate-600 mt-1">{callRate}% of leads</p>
                </div>
                <PhoneCall className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pre-screened</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{totalPrescreened}</p>
                  <p className="text-xs text-slate-600 mt-1">{prescreenRate}% of leads</p>
                </div>
                <Target className="h-12 w-12 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Visits Scheduled</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{totalVisitScheduled}</p>
                  <p className="text-xs text-slate-600 mt-1">{visitRate}% of leads</p>
                </div>
                <Clock className="h-12 w-12 text-green-500 opacity-20" />
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
        </div>

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
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
