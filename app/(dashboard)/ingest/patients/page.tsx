"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useStudy } from "@/contexts/study-context"
import { useCampaign, type CampaignPatient } from "@/contexts/campaign-context"
import { usePatients } from "@/contexts/patient-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EpicFHIRConnector } from "@/components/ingest/EpicFHIRConnector"
import { CSVUploader } from "@/components/ingest/CSVUploader"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Beaker,
  Users,
  Filter,
  AlertCircle,
  UserPlus,
  Target,
  PhoneCall
} from "lucide-react"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  diagnoses: string[]
  mmse_score?: number
  medications: string[]
  last_visit: string
}

interface ScreeningResult {
  patient: Patient
  matches: boolean
  failedCriteria: string[]
}

export default function PatientsPage() {
  const router = useRouter()
  const { currentStudy } = useStudy()
  const { createCampaign, campaigns } = useCampaign()
  const { patients, addPatients, updatePatient, getPatientsByStudy } = usePatients()
  const [importedPatients, setImportedPatients] = useState<Patient[]>([])
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>([])
  const [isScreening, setIsScreening] = useState(false)
  const [campaignName, setCampaignName] = useState("")
  const [selectedPatients, setSelectedPatients] = useState<string[]>([])
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [selectedForAICalls, setSelectedForAICalls] = useState<string[]>([])
  const [isInitiatingCalls, setIsInitiatingCalls] = useState(false)

  // Load patients from context on mount and rebuild screening results if patients were already screened
  React.useEffect(() => {
    if (currentStudy) {
      const studyPatients = getPatientsByStudy(currentStudy.id)
      setImportedPatients(studyPatients)

      // Check if any patients have been screened already
      const screenedPatients = studyPatients.filter(p =>
        p.legacyStatus === 'screened' || p.legacyStatus === 'qualified' || p.legacyStatus === 'not_qualified'
      )

      if (screenedPatients.length > 0) {
        // Rebuild screening results from patient status
        const results: ScreeningResult[] = studyPatients.map(patient => {
          const failedCriteria: string[] = []
          const matches = patient.tag === 'Eligible' || patient.legacyStatus === 'qualified'

          // Reconstruct failed criteria for disqualified patients
          if (!matches && (patient.tag === 'Ineligible' || patient.legacyStatus === 'not_qualified')) {
            if (patient.age < 50 || patient.age > 85) {
              failedCriteria.push("Age 50-85 years inclusive")
            }
            // Add other failed criteria based on patient data
          }

          return {
            patient: {
              id: patient.id,
              name: patient.name,
              age: patient.age,
              gender: patient.gender,
              diagnoses: patient.conditions,
              medications: patient.medications,
              last_visit: '2025-09-15' // Mock data
            },
            matches,
            failedCriteria
          }
        })
        setScreeningResults(results)
      }
    }
  }, [currentStudy, patients, getPatientsByStudy])

  if (!currentStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Study Selected</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please create or select a study first.
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

  const handleDataExtracted = (newPatients: any[]) => {
    if (!currentStudy) return

    // Convert to proper Patient format and add to context
    const formattedPatients = newPatients.map(p => ({
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone || '(555) 000-0000',
      email: p.email || p.name.toLowerCase().replace(' ', '.') + '@email.com',
      conditions: p.diagnoses || [],
      diagnoses: p.diagnoses || [],
      medications: p.medications || [],
      mmse_score: p.mmse_score,
      source: 'EHR' as const,
      tag: 'Potential Match' as const,
      status: 'Pending Review' as const,
      legacyStatus: 'imported' as const,
      studyId: currentStudy.id
    }))

    addPatients(formattedPatients)
    setImportedPatients(prev => [...prev, ...newPatients])
  }

  const handleScreenPatients = async () => {
    if (!currentStudy.criteria || importedPatients.length === 0) return

    setIsScreening(true)

    // Simulate screening delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Comprehensive screening logic
    const results: ScreeningResult[] = importedPatients.map(patient => {
      const failedCriteria: string[] = []
      const criteriaMatches: any[] = []

      // INCLUSION CRITERIA

      // 1. Check age (50-85)
      const ageMatch = patient.age >= 50 && patient.age <= 85
      criteriaMatches.push({
        criterionId: 1,
        criterionText: 'Age 50-85 years inclusive',
        type: 'inclusion',
        matched: ageMatch,
        patientValue: `${patient.age} years`,
        source: 'EHR'
      })
      if (!ageMatch) {
        failedCriteria.push("Age 50-85 years inclusive")
      }

      // 2. Check MMSE score (18-26)
      const mmseMatch = patient.mmse_score ? (patient.mmse_score >= 18 && patient.mmse_score <= 26) : false
      criteriaMatches.push({
        criterionId: 2,
        criterionText: 'MMSE score 18-26 (mild to moderate cognitive impairment)',
        type: 'inclusion',
        matched: mmseMatch,
        patientValue: patient.mmse_score ? `MMSE: ${patient.mmse_score}` : 'MMSE score not available',
        source: 'EHR'
      })
      if (!mmseMatch) {
        failedCriteria.push("MMSE score 18-26 (mild to moderate cognitive impairment)")
      }

      // 3. Check for cognitive impairment diagnosis
      const hasCognitiveImpairment = patient.diagnoses?.some(d =>
        d.toLowerCase().includes('cognitive impairment') ||
        d.toLowerCase().includes('alzheimer') ||
        d.toLowerCase().includes('dementia')
      ) ?? false
      criteriaMatches.push({
        criterionId: 3,
        criterionText: 'Diagnosis of mild cognitive impairment or early Alzheimer\'s disease',
        type: 'inclusion',
        matched: hasCognitiveImpairment,
        patientValue: hasCognitiveImpairment ? 'Confirmed diagnosis' : 'No diagnosis found',
        source: 'EHR'
      })
      if (!hasCognitiveImpairment) {
        failedCriteria.push("Diagnosis of mild cognitive impairment or early Alzheimer's disease")
      }

      // EXCLUSION CRITERIA

      // 4. Check for seizure disorder (exclusion)
      const hasSeizures = patient.diagnoses?.some(d =>
        d.toLowerCase().includes('seizure') ||
        d.toLowerCase().includes('epilepsy')
      ) ?? false
      criteriaMatches.push({
        criterionId: 4,
        criterionText: 'No history of seizures or epilepsy',
        type: 'exclusion',
        matched: !hasSeizures,
        patientValue: hasSeizures ? 'History of seizures present' : 'No seizure history',
        source: 'EHR'
      })
      if (hasSeizures) {
        failedCriteria.push("No history of seizures or epilepsy")
      }

      // 5. Check for severe psychiatric conditions (exclusion)
      const hasPsychiatric = patient.diagnoses?.some(d =>
        d.toLowerCase().includes('schizophrenia') ||
        d.toLowerCase().includes('bipolar') ||
        d.toLowerCase().includes('psychosis')
      ) ?? false
      criteriaMatches.push({
        criterionId: 5,
        criterionText: 'No active severe psychiatric disorder (schizophrenia, bipolar, psychosis)',
        type: 'exclusion',
        matched: !hasPsychiatric,
        patientValue: hasPsychiatric ? 'Psychiatric condition present' : 'No severe psychiatric conditions',
        source: 'EHR'
      })
      if (hasPsychiatric) {
        failedCriteria.push("No active severe psychiatric disorder")
      }

      // 6. Check for cancer (exclusion)
      const hasCancer = patient.diagnoses?.some(d =>
        d.toLowerCase().includes('cancer') ||
        d.toLowerCase().includes('carcinoma') ||
        d.toLowerCase().includes('malignancy')
      ) ?? false
      criteriaMatches.push({
        criterionId: 6,
        criterionText: 'No active malignancy within the past 5 years',
        type: 'exclusion',
        matched: !hasCancer,
        patientValue: hasCancer ? 'Cancer diagnosis present' : 'No active malignancy',
        source: 'EHR'
      })
      if (hasCancer) {
        failedCriteria.push("No active malignancy within the past 5 years")
      }

      // 7. Check for stroke/TIA (exclusion)
      const hasStroke = patient.diagnoses?.some(d =>
        d.toLowerCase().includes('stroke') ||
        d.toLowerCase().includes('tia') ||
        d.toLowerCase().includes('cerebrovascular')
      ) ?? false
      criteriaMatches.push({
        criterionId: 7,
        criterionText: 'No history of stroke or TIA in the past 2 years',
        type: 'exclusion',
        matched: !hasStroke,
        patientValue: hasStroke ? 'Stroke/TIA history present' : 'No stroke/TIA history',
        source: 'EHR'
      })
      if (hasStroke) {
        failedCriteria.push("No history of stroke or TIA in the past 2 years")
      }

      // 8. Check for severe kidney disease (exclusion)
      const hasKidneyDisease = patient.diagnoses?.some(d =>
        d.toLowerCase().includes('renal failure') ||
        d.toLowerCase().includes('esrd') ||
        d.toLowerCase().includes('kidney disease')
      ) ?? false
      criteriaMatches.push({
        criterionId: 8,
        criterionText: 'No severe renal impairment or kidney failure',
        type: 'exclusion',
        matched: !hasKidneyDisease,
        patientValue: hasKidneyDisease ? 'Kidney disease present' : 'No severe renal impairment',
        source: 'EHR'
      })
      if (hasKidneyDisease) {
        failedCriteria.push("No severe renal impairment or kidney failure")
      }

      // 9. Check for severe liver disease (exclusion)
      const hasLiverDisease = patient.diagnoses?.some(d =>
        d.toLowerCase().includes('cirrhosis') ||
        d.toLowerCase().includes('hepatic failure') ||
        d.toLowerCase().includes('liver failure')
      ) ?? false
      criteriaMatches.push({
        criterionId: 9,
        criterionText: 'No severe hepatic impairment or liver disease',
        type: 'exclusion',
        matched: !hasLiverDisease,
        patientValue: hasLiverDisease ? 'Liver disease present' : 'No severe hepatic impairment',
        source: 'EHR'
      })
      if (hasLiverDisease) {
        failedCriteria.push("No severe hepatic impairment or liver disease")
      }

      const matches = failedCriteria.length === 0
      const passedCount = criteriaMatches.filter(c => c.matched).length
      const totalCriteria = criteriaMatches.length

      // Check if any critical/mandatory criteria failed
      // Critical failures: age outside range, MMSE outside range, or has cancer
      const hasCriticalFailure = !ageMatch || !mmseMatch || hasCancer

      // Determine tag based on criteria matching
      let tag: 'Match' | 'Potential Match' | 'Ineligible'
      let status: string

      if (matches) {
        // Passes ALL criteria = "Match" (Eligible)
        tag = 'Match'
        status = 'Pending Review'
      } else if (hasCriticalFailure) {
        // Failed a critical criterion = "Ineligible" (Disqualified)
        tag = 'Ineligible'
        status = 'Failed Screening'
      } else if (passedCount >= (totalCriteria * 0.75)) {
        // Passes 75%+ of non-critical criteria = "Potential Match"
        tag = 'Potential Match'
        status = 'Pending Review'
      } else {
        // Fails too many criteria = "Ineligible"
        tag = 'Ineligible'
        status = 'Failed Screening'
      }

      // Update patient status in context to persist screening results
      updatePatient(patient.id, {
        tag: tag,
        status: status as any,
        legacyStatus: matches ? 'qualified' : 'not_qualified',
        criteriaMatches
      })

      return {
        patient,
        matches,
        failedCriteria
      }
    })

    setScreeningResults(results)
    setIsScreening(false)
  }

  const qualifiedCount = screeningResults.filter(r => {
    const contextPatient = patients.find(p => p.id === r.patient.id)
    return r.matches || contextPatient?.tag === 'Match' || contextPatient?.tag === 'Potential Match'
  }).length
  const disqualifiedCount = screeningResults.filter(r => {
    const contextPatient = patients.find(p => p.id === r.patient.id)
    return !r.matches && contextPatient?.tag !== 'Match' && contextPatient?.tag !== 'Potential Match'
  }).length

  const handleCreateCampaign = () => {
    if (!currentStudy || !campaignName.trim() || selectedPatients.length === 0) return

    setIsCreatingCampaign(true)

    const campaignPatients: CampaignPatient[] = selectedPatients.map(patientId => {
      const result = screeningResults.find(r => r.patient.id === patientId)
      if (!result) return null

      return {
        id: result.patient.id,
        name: result.patient.name,
        age: result.patient.age,
        gender: result.patient.gender,
        phone: '(555) 123-4567', // Mock data
        email: result.patient.name.toLowerCase().replace(' ', '.') + '@email.com',
        status: 'not_contacted' as const
      }
    }).filter(Boolean) as CampaignPatient[]

    const newCampaign = {
      id: `campaign-${Date.now()}`,
      studyId: currentStudy.id,
      studyName: currentStudy.title,
      name: campaignName,
      createdDate: new Date().toISOString().split('T')[0],
      patients: campaignPatients,
      totalPatients: campaignPatients.length,
      contacted: 0,
      interested: 0,
      scheduled: 0,
      enrolled: 0
    }

    createCampaign(newCampaign)

    setTimeout(() => {
      setIsCreatingCampaign(false)
      router.push(`/campaigns/${newCampaign.id}`)
    }, 500)
  }

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    )
  }

  const toggleAICallSelection = (patientId: string) => {
    setSelectedForAICalls(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    )
  }

  const toggleSelectAllForAICalls = () => {
    // Select/deselect only Match and Potential Match patients
    const eligiblePatientIds = screeningResults
      .filter(r => r.matches || (patients.find(p => p.id === r.patient.id)?.tag === 'Potential Match'))
      .map(r => r.patient.id)

    if (selectedForAICalls.length === eligiblePatientIds.length) {
      setSelectedForAICalls([])
    } else {
      setSelectedForAICalls(eligiblePatientIds)
    }
  }

  const handleBulkAICalls = async () => {
    if (selectedForAICalls.length === 0) return

    setIsInitiatingCalls(true)

    try {
      // Update all selected patients' status to "AI Call Initiated"
      for (const patientId of selectedForAICalls) {
        const contextPatient = patients.find(p => p.id === patientId)
        if (contextPatient) {
          updatePatient(patientId, {
            status: 'AI Call Initiated'
          })
        }

        // TODO: Make actual API call to initiate AI call
        // await fetch('/api/initiate-call', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     patientId,
        //     phone: contextPatient?.phone,
        //     studyId: currentStudy?.id
        //   })
        // })
      }

      alert(`AI calls initiated for ${selectedForAICalls.length} patient(s)`)
      setSelectedForAICalls([])
    } catch (error) {
      alert('Failed to initiate AI calls')
    } finally {
      setIsInitiatingCalls(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Study Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-blue-600" />
              {currentStudy.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">{currentStudy.description}</p>
            <div className="flex gap-2">
              <Badge variant="secondary">{currentStudy.phase}</Badge>
              {currentStudy.criteria && (
                <>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {currentStudy.criteria.inclusion.length} Inclusion Criteria
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {currentStudy.criteria.exclusion.length} Exclusion Criteria
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Import Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Epic Integration */}
          <EpicFHIRConnector onDataExtracted={handleDataExtracted} />

          {/* CSV Upload */}
          <CSVUploader onDataExtracted={handleDataExtracted} />
        </div>

        {/* Imported Patients */}
        {importedPatients.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Imported Patients ({importedPatients.length})
                </CardTitle>
                <Button
                  onClick={handleScreenPatients}
                  disabled={isScreening || screeningResults.length > 0}
                >
                  {isScreening ? (
                    <>
                      <Filter className="h-4 w-4 mr-2 animate-pulse" />
                      Screening...
                    </>
                  ) : (
                    <>
                      <Filter className="h-4 w-4 mr-2" />
                      Screen Against Criteria
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {importedPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{patient.name}</h4>
                        <p className="text-sm text-slate-600">
                          {patient.age} years old, {patient.gender}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {patient.diagnoses && patient.diagnoses.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {patient.diagnoses[0]}
                            </Badge>
                          )}
                          {patient.mmse_score && (
                            <Badge variant="outline" className="text-xs">
                              MMSE: {patient.mmse_score}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Screening Results */}
        {screeningResults.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Pre-Screening Results
                </CardTitle>
                {qualifiedCount > 0 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Target className="h-4 w-4 mr-2" />
                        Create Screening Campaign
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Screening Campaign</DialogTitle>
                        <DialogDescription>
                          Select qualified patients and create a campaign to manage outreach
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Campaign Name</label>
                          <Input
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            placeholder={`${currentStudy.title} - Screening Campaign`}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Selected Patients ({selectedPatients.length})
                          </label>
                          <p className="text-xs text-slate-600 mb-2">
                            Select patients below to add to this campaign
                          </p>
                        </div>
                        <Button
                          onClick={handleCreateCampaign}
                          disabled={isCreatingCampaign || !campaignName.trim() || selectedPatients.length === 0}
                          className="w-full"
                        >
                          {isCreatingCampaign ? 'Creating Campaign...' : `Create Campaign with ${selectedPatients.length} Patient(s)`}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertDescription>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">{qualifiedCount} Qualified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold">{disqualifiedCount} Disqualified</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {screeningResults.map((result) => {
                  const contextPatient = patients.find(p => p.id === result.patient.id)
                  const isEligibleForAICall = result.matches || contextPatient?.tag === 'Potential Match'

                  return (
                  <div
                    key={result.patient.id}
                    className={`border rounded-lg p-4 transition-all ${
                      result.matches
                        ? 'bg-green-50 border-green-200'
                        : contextPatient?.tag === 'Potential Match'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    } ${selectedPatients.includes(result.patient.id) ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox for campaign selection (only for qualified patients) */}
                      {result.matches && (
                        <input
                          type="checkbox"
                          checked={selectedPatients.includes(result.patient.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            togglePatientSelection(result.patient.id)
                          }}
                          className="mt-1 h-4 w-4"
                          title="Add to campaign"
                        />
                      )}
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/ingest/patients/${result.patient.id}`)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {result.matches ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : contextPatient?.tag === 'Potential Match' ? (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <h4 className="font-semibold text-slate-900">
                            {result.patient.name}
                          </h4>
                          {contextPatient?.tag && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                contextPatient.tag === 'Match' ? 'bg-green-100 text-green-800 border-green-300' :
                                contextPatient.tag === 'Potential Match' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                'bg-red-100 text-red-800 border-red-300'
                              }`}
                            >
                              {contextPatient.tag}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          {result.patient.age} years old, {result.patient.gender}
                        </p>
                        {!result.matches && result.failedCriteria.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-red-700 mb-1">
                              Failed Criteria:
                            </p>
                            <ul className="text-xs text-red-600 space-y-1">
                              {result.failedCriteria.map((criteria, idx) => (
                                <li key={idx}>• {criteria}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}