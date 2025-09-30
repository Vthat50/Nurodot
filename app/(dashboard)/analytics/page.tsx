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

  // Patients who have been called (have call history)
  const totalCalled = studyPatients.filter(p =>
    p.callHistory && p.callHistory.length > 0
  ).length

  // Patients who answered calls (have call history with completed outcome)
  const totalAnswered = studyPatients.filter(p =>
    p.callHistory && p.callHistory.some(call => call.outcome === 'completed')
  ).length

  // All patients are prescreened (they have tags assigned)
  const totalPrescreened = studyPatients.filter(p =>
    p.tag === 'Eligible' || p.tag === 'Match' || p.tag === 'Potential Match' || p.tag === 'Ineligible'
  ).length

  // Patients with scheduled visits
  const totalVisitScheduled = studyPatients.filter(p =>
    p.status === 'On-site visit scheduled' || p.visitScheduledDate
  ).length

  // Calculate conversion rates
  const callRate = totalLeads > 0 ? Math.round((totalCalled / totalLeads) * 100) : 0
  const answerRate = totalCalled > 0 ? Math.round((totalAnswered / totalCalled) * 100) : 0
  const prescreenRate = totalLeads > 0 ? Math.round((totalPrescreened / totalLeads) * 100) : 0
  const visitRate = totalLeads > 0 ? Math.round((totalVisitScheduled / totalLeads) * 100) : 0

  // Calculate demographic distributions
  const ageGroups = {
    '50-60': studyPatients.filter(p => p.age >= 50 && p.age < 60).length,
    '60-70': studyPatients.filter(p => p.age >= 60 && p.age < 70).length,
    '70-80': studyPatients.filter(p => p.age >= 70 && p.age < 80).length,
    '80+': studyPatients.filter(p => p.age >= 80).length,
  }
  const ageTotal = totalLeads
  const agePercentages = {
    '50-60': ageTotal > 0 ? Math.round((ageGroups['50-60'] / ageTotal) * 100) : 0,
    '60-70': ageTotal > 0 ? Math.round((ageGroups['60-70'] / ageTotal) * 100) : 0,
    '70-80': ageTotal > 0 ? Math.round((ageGroups['70-80'] / ageTotal) * 100) : 0,
    '80+': ageTotal > 0 ? Math.round((ageGroups['80+'] / ageTotal) * 100) : 0,
  }

  const genderCounts = {
    female: studyPatients.filter(p => p.gender?.toLowerCase() === 'female').length,
    male: studyPatients.filter(p => p.gender?.toLowerCase() === 'male').length,
  }
  const genderPercentages = {
    female: ageTotal > 0 ? Math.round((genderCounts.female / ageTotal) * 100) : 0,
    male: ageTotal > 0 ? Math.round((genderCounts.male / ageTotal) * 100) : 0,
  }

  // Calculate call outcomes
  const callOutcomes = {
    qualified: studyPatients.filter(p => p.tag === 'Match' || p.tag === 'Eligible').length,
    notQualified: studyPatients.filter(p => p.tag === 'Ineligible').length,
    noAnswer: studyPatients.filter(p => p.status === 'No Answer').length,
    voicemail: studyPatients.filter(p => p.status === 'Voicemail Left').length,
    declined: studyPatients.filter(p => p.status === 'Declined').length,
  }
  const callOutcomeTotal = totalCalled > 0 ? totalCalled : 1
  const callOutcomePercentages = {
    qualified: Math.round((callOutcomes.qualified / callOutcomeTotal) * 100),
    notQualified: Math.round((callOutcomes.notQualified / callOutcomeTotal) * 100),
    noAnswer: Math.round((callOutcomes.noAnswer / callOutcomeTotal) * 100),
    voicemail: Math.round((callOutcomes.voicemail / callOutcomeTotal) * 100),
    declined: Math.round((callOutcomes.declined / callOutcomeTotal) * 100),
  }

  // Calculate call performance by time of day
  const callsByHour: { [hour: number]: { total: number, answered: number } } = {}

  // Initialize hours (6 AM to 10 PM)
  for (let hour = 6; hour <= 22; hour++) {
    callsByHour[hour] = { total: 0, answered: 0 }
  }

  // Count calls by hour
  studyPatients.forEach(patient => {
    patient.callHistory?.forEach(call => {
      const hour = parseInt(call.callTime.split(':')[0])
      if (callsByHour[hour] !== undefined) {
        callsByHour[hour].total++
        if (call.outcome === 'completed') {
          callsByHour[hour].answered++
        }
      }
    })
  })

  // Calculate answer rates by hour
  const hourlyAnswerRates = Object.keys(callsByHour).map(hour => {
    const hourNum = parseInt(hour)
    const data = callsByHour[hourNum]
    return {
      hour: hourNum,
      rate: data.total > 0 ? Math.round((data.answered / data.total) * 100) : 0
    }
  })

  // Find best and worst times (only among hours with actual calls)
  const hoursWithCalls = hourlyAnswerRates.filter(h => callsByHour[h.hour].total > 0)
  const bestTime = hoursWithCalls.length > 0
    ? hoursWithCalls.reduce((max, curr) => curr.rate > max.rate ? curr : max, hoursWithCalls[0])
    : null
  const worstTime = hoursWithCalls.length > 0
    ? hoursWithCalls.reduce((min, curr) => curr.rate < min.rate ? curr : min, hoursWithCalls[0])
    : null

  // Calculate financial metrics
  const costPerCall = 10 // Base cost per call attempt
  const totalCampaignCost = totalCalled * costPerCall
  const costPerAnswered = totalAnswered > 0 ? Math.round((totalCampaignCost / totalAnswered) * 100) / 100 : 0
  const qualifiedPatients = studyPatients.filter(p => p.tag === 'Eligible' || p.tag === 'Match').length
  const costPerQualified = qualifiedPatients > 0 ? Math.round((totalCampaignCost / qualifiedPatients) * 100) / 100 : 0
  const enrolledPatients = studyPatients.filter(p => p.status === 'Enrolled' || p.visitScheduledDate).length
  const costPerEnrolled = enrolledPatients > 0 ? Math.round((totalCampaignCost / enrolledPatients) * 100) / 100 : 0
  const targetCostPerEnrolled = 120
  const percentBelowTarget = costPerEnrolled > 0 ? Math.round(((targetCostPerEnrolled - costPerEnrolled) / targetCostPerEnrolled) * 100) : 0

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
                  <span className="text-sm font-bold">{callOutcomes.qualified} ({callOutcomePercentages.qualified}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${callOutcomePercentages.qualified}%`}}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Completed & Not Qualified</span>
                  </div>
                  <span className="text-sm font-bold">{callOutcomes.notQualified} ({callOutcomePercentages.notQualified}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${callOutcomePercentages.notQualified}%`}}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-400"></div>
                    <span className="text-sm font-medium">No Answer</span>
                  </div>
                  <span className="text-sm font-bold">{callOutcomes.noAnswer} ({callOutcomePercentages.noAnswer}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-slate-400 h-2 rounded-full" style={{width: `${callOutcomePercentages.noAnswer}%`}}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium">Voicemail Left</span>
                  </div>
                  <span className="text-sm font-bold">{callOutcomes.voicemail} ({callOutcomePercentages.voicemail}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{width: `${callOutcomePercentages.voicemail}%`}}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium">Declined Participation</span>
                  </div>
                  <span className="text-sm font-bold">{callOutcomes.declined} ({callOutcomePercentages.declined}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{width: `${callOutcomePercentages.declined}%`}}></div>
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
                        {/* Calculate stroke dasharray for each segment */}
                        {/* 50-60 */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20"
                          strokeDasharray={`${agePercentages['50-60'] * 2.512} 251.2`} strokeDashoffset="0" />
                        {/* 60-70 */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#60a5fa" strokeWidth="20"
                          strokeDasharray={`${agePercentages['60-70'] * 2.512} 251.2`} strokeDashoffset={`-${agePercentages['50-60'] * 2.512}`} />
                        {/* 70-80 */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#93c5fd" strokeWidth="20"
                          strokeDasharray={`${agePercentages['70-80'] * 2.512} 251.2`} strokeDashoffset={`-${(agePercentages['50-60'] + agePercentages['60-70']) * 2.512}`} />
                        {/* 80+ */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#dbeafe" strokeWidth="20"
                          strokeDasharray={`${agePercentages['80+'] * 2.512} 251.2`} strokeDashoffset={`-${(agePercentages['50-60'] + agePercentages['60-70'] + agePercentages['70-80']) * 2.512}`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900">{ageTotal}</p>
                          <p className="text-xs text-slate-600">Total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span className="text-xs text-slate-600">50-60 ({agePercentages['50-60']}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span className="text-xs text-slate-600">60-70 ({agePercentages['60-70']}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                      <span className="text-xs text-slate-600">70-80 ({agePercentages['70-80']}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-100"></div>
                      <span className="text-xs text-slate-600">80+ ({agePercentages['80+']}%)</span>
                    </div>
                  </div>
                </div>

                {/* Gender Distribution Pie Chart */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold text-slate-700 mb-4">Gender Distribution</p>
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-48 h-48">
                      <svg viewBox="0 0 100 100" className="transform -rotate-90">
                        {/* Female */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20"
                          strokeDasharray={`${genderPercentages.female * 2.512} 251.2`} strokeDashoffset="0" />
                        {/* Male */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#c4b5fd" strokeWidth="20"
                          strokeDasharray={`${genderPercentages.male * 2.512} 251.2`} strokeDashoffset={`-${genderPercentages.female * 2.512}`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900">{ageTotal}</p>
                          <p className="text-xs text-slate-600">Total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                      <span className="text-xs text-slate-600">Female ({genderPercentages.female}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                      <span className="text-xs text-slate-600">Male ({genderPercentages.male}%)</span>
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
                      {hourlyAnswerRates.map((hourData) => (
                        <div
                          key={hourData.hour}
                          className="flex-1 bg-blue-600 rounded-t"
                          style={{height: `${hourData.rate}%`}}
                          title={`${hourData.hour > 12 ? hourData.hour - 12 : hourData.hour}${hourData.hour >= 12 ? 'pm' : 'am'}: ${hourData.rate}%`}
                        ></div>
                      ))}
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
                      <p className="text-lg font-bold text-blue-900">
                        {bestTime ? `${bestTime.hour > 12 ? bestTime.hour - 12 : bestTime.hour} ${bestTime.hour >= 12 ? 'PM' : 'AM'}` : 'N/A'}
                      </p>
                      <p className="text-xs text-slate-600">{bestTime ? `${bestTime.rate}% answer rate` : 'No data'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">Worst Time to Call</p>
                      <p className="text-lg font-bold text-slate-900">
                        {worstTime ? `${worstTime.hour > 12 ? worstTime.hour - 12 : worstTime.hour} ${worstTime.hour >= 12 ? 'PM' : 'AM'}` : 'N/A'}
                      </p>
                      <p className="text-xs text-slate-600">{worstTime ? `${worstTime.rate}% answer rate` : 'No data'}</p>
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
                  <p className="text-2xl font-bold text-slate-900">${totalCampaignCost.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">Cost per Call</p>
                  <p className="text-2xl font-bold text-slate-900">${costPerCall}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 mb-1">Cost per Answered</p>
                  <p className="text-2xl font-bold text-blue-900">${costPerAnswered.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-700 mb-1">Cost per Qualified</p>
                  <p className="text-2xl font-bold text-purple-900">${costPerQualified.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-2">Cost per Enrolled Patient</p>
                <p className="text-3xl font-bold text-green-900">
                  {enrolledPatients > 0 ? `$${costPerEnrolled.toLocaleString()}` : 'N/A'}
                </p>
                {enrolledPatients > 0 && percentBelowTarget > 0 && (
                  <p className="text-xs text-green-700 mt-1">{percentBelowTarget}% below target of $120</p>
                )}
                {enrolledPatients > 0 && percentBelowTarget < 0 && (
                  <p className="text-xs text-red-700 mt-1">{Math.abs(percentBelowTarget)}% above target of $120</p>
                )}
                {enrolledPatients === 0 && (
                  <p className="text-xs text-slate-600 mt-1">No enrolled patients yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
