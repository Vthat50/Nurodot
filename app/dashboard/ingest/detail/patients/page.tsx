"use client"

import { useRouter } from "next/navigation"
import { useStudy } from "@/contexts/study-context"
import { usePatients } from "@/contexts/patient-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { exportPatientsToCSV } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Download
} from "lucide-react"
import { useState } from "react"

export default function StudyPatientsPage() {
  const router = useRouter()
  const { currentStudy } = useStudy()
  const { getPatientsByStudy } = usePatients()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tagFilter, setTagFilter] = useState<string>("all")

  if (!currentStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Study Selected</h3>
            <Button onClick={() => router.push('/dashboard/ingest')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Studies
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const studyPatients = getPatientsByStudy(currentStudy.id)

  // Filter patients
  const filteredPatients = studyPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    const matchesTag = tagFilter === "all" || patient.tag === tagFilter
    return matchesSearch && matchesStatus && matchesTag
  })

  // Calculate summary stats
  const totalPatients = studyPatients.length
  const eligibleCount = studyPatients.filter(p => p.tag === 'Eligible').length
  const scheduledCount = studyPatients.filter(p => p.status === 'On-site visit scheduled').length
  const pendingReviewCount = studyPatients.filter(p => p.status === 'Pending Review').length

  // Export handler
  const handleExportFilteredPatients = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${currentStudy.id}_filtered_patients_${timestamp}.csv`
    exportPatientsToCSV(filteredPatients, filename)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On-site visit scheduled':
        return Calendar
      case 'AI Call Initiated':
        return Phone
      case 'Pending Review':
        return Clock
      case 'Enrolled':
        return CheckCircle
      case 'Failed Screening':
        return XCircle
      case 'Declined Participation':
        return AlertCircle
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enrolled':
        return 'bg-green-600 text-white'
      case 'On-site visit scheduled':
        return 'bg-blue-600 text-white'
      case 'AI Call Initiated':
        return 'bg-purple-600 text-white'
      case 'Declined Participation':
        return 'bg-orange-600 text-white'
      case 'Failed Screening':
        return 'bg-red-600 text-white'
      case 'Pending Review':
        return 'bg-slate-600 text-white'
      default:
        return 'bg-slate-600 text-white'
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Eligible':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'Match':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Potential Match':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'Ineligible':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300'
    }
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
                onClick={() => router.push('/dashboard/ingest/detail')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Study
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">All Patients</h1>
                <p className="text-sm text-slate-600">{currentStudy.title}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportFilteredPatients}
              disabled={filteredPatients.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Filtered ({filteredPatients.length})
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-slate-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{totalPatients}</p>
              <p className="text-xs text-slate-600">Total Patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{eligibleCount}</p>
              <p className="text-xs text-slate-600">Eligible</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{scheduledCount}</p>
              <p className="text-xs text-slate-600">Visits Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-900">{pendingReviewCount}</p>
              <p className="text-xs text-slate-600">Pending Review</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="Eligible">Eligible</SelectItem>
                  <SelectItem value="Match">Match</SelectItem>
                  <SelectItem value="Potential Match">Potential Match</SelectItem>
                  <SelectItem value="Ineligible">Ineligible</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
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

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Patients ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Patients Found
                </h3>
                <p className="text-sm text-slate-600">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((patient) => {
                  const StatusIcon = getStatusIcon(patient.status)
                  return (
                    <div
                      key={patient.id}
                      className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-all hover:shadow-md"
                      onClick={() => router.push(`/dashboard/ingest/detail/patients/${patient.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-slate-900 text-lg">{patient.name}</h4>
                            <Badge variant="outline" className={getTagColor(patient.tag)}>
                              {patient.tag}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{patient.age} years old • {patient.gender}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{patient.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{patient.email}</span>
                            </div>
                            {patient.visitScheduledDate && (
                              <div className="flex items-center gap-2 text-blue-700 font-medium">
                                <Calendar className="h-4 w-4" />
                                <span>Visit: {patient.visitScheduledDate}</span>
                              </div>
                            )}
                          </div>

                          {patient.conditions && patient.conditions.length > 0 && (
                            <div className="flex gap-2 flex-wrap mb-2">
                              {patient.conditions.slice(0, 2).map((condition, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {condition}
                                </Badge>
                              ))}
                              {patient.conditions.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{patient.conditions.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {patient.verbalConsentTimestamp && (
                            <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded inline-flex w-fit">
                              <CheckCircle className="h-3 w-3" />
                              <span>Consent recorded {new Date(patient.verbalConsentTimestamp).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(patient.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {patient.status}
                          </Badge>

                          {patient.callHistory && patient.callHistory.length > 0 && (
                            <div className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                              {patient.callHistory.length} call{patient.callHistory.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}