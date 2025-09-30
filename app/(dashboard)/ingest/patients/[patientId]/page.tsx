"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useStudy } from "@/contexts/study-context"
import { usePatients } from "@/contexts/patient-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  User,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Activity,
  Beaker,
  AlertTriangle,
  ClipboardList,
  Pill,
  Microscope,
  Brain,
  Heart,
  UserPlus
} from "lucide-react"

// Mock patient data - in real app this would come from API/database
const mockPatientData: Record<string, any> = {
  'P001': {
    id: 'P001',
    mrn: 'MRN-12345678',
    name: 'John Smith',
    age: 67,
    dob: '1958-03-15',
    gender: 'Male',
    race: 'Caucasian',
    ethnicity: 'Not Hispanic or Latino',
    contact: {
      phone: '(555) 123-4567',
      email: 'john.smith@email.com',
      address: '123 Main St, Boston, MA 02101',
      emergencyContact: 'Jane Smith (Spouse) - (555) 987-6543'
    },
    diagnoses: [
      { code: 'G30.9', name: 'Mild Alzheimer\'s Disease', date: '2023-06-15', status: 'Active' },
      { code: 'E11.9', name: 'Type 2 Diabetes Mellitus', date: '2019-03-20', status: 'Active' },
      { code: 'I10', name: 'Essential Hypertension', date: '2018-11-10', status: 'Active' }
    ],
    medications: [
      { name: 'Donepezil', dose: '10mg', frequency: 'Once daily', startDate: '2023-06-20', status: 'Active' },
      { name: 'Metformin', dose: '1000mg', frequency: 'Twice daily', startDate: '2019-04-01', status: 'Active' },
      { name: 'Lisinopril', dose: '10mg', frequency: 'Once daily', startDate: '2018-12-01', status: 'Active' }
    ],
    cognitiveAssessments: {
      mmse: { score: 22, date: '2025-09-10', range: '18-26 (Mild)' },
      moca: { score: 20, date: '2025-09-10', range: '13-23' },
      adasCog: { score: 28, date: '2025-08-15', range: '15-35' },
      cdr: { score: 0.5, date: '2025-09-10', description: 'Very Mild Dementia' }
    },
    labResults: [
      { test: 'HbA1c', value: '7.2%', date: '2025-09-05', status: 'Normal', range: '<8.5%' },
      { test: 'Creatinine', value: '0.9 mg/dL', date: '2025-09-05', status: 'Normal', range: '0.7-1.3' },
      { test: 'AST', value: '28 U/L', date: '2025-09-05', status: 'Normal', range: '10-40' },
      { test: 'ALT', value: '32 U/L', date: '2025-09-05', status: 'Normal', range: '7-56' }
    ],
    imaging: [
      { type: 'Amyloid PET Scan', result: 'Positive', date: '2025-07-20', notes: 'Elevated amyloid deposition consistent with AD' },
      { type: 'Brain MRI', result: 'Mild hippocampal atrophy', date: '2025-07-18', notes: '2 microhemorrhages detected' }
    ],
    vitalSigns: {
      bloodPressure: '128/82 mmHg',
      heartRate: '72 bpm',
      temperature: '98.6°F',
      weight: '175 lbs',
      height: '5\'10"',
      bmi: '25.1',
      date: '2025-09-15'
    },
    visitHistory: [
      { date: '2025-09-15', type: 'Neurology Follow-up', provider: 'Dr. Sarah Johnson', notes: 'Stable cognitive status' },
      { date: '2025-08-15', type: 'Cognitive Assessment', provider: 'Dr. Michael Chen', notes: 'ADAS-Cog administered' },
      { date: '2025-07-20', type: 'Imaging Studies', provider: 'Radiology Dept', notes: 'PET and MRI completed' }
    ],
    studyPartner: {
      available: true,
      name: 'Jane Smith',
      relationship: 'Spouse',
      contact: '(555) 987-6543',
      commitment: 'Available for all visits'
    },
    eligibility: {
      qualified: true,
      matchedCriteria: [
        'Age 50-85 years inclusive',
        'MMSE score 18-26 (mild to moderate)',
        'Positive amyloid status (PET or CSF)',
        'Reliable study partner'
      ],
      failedCriteria: [],
      notes: 'Patient meets all inclusion criteria. HbA1c well controlled. Only 2 microhemorrhages on MRI (threshold is ≤4).'
    },
    trialHistory: {
      current: [],
      past: [],
      interested: true
    },
    lastVisit: '2025-09-15',
    status: 'Pre-Screened'
  },
  'P002': {
    id: 'P002',
    mrn: 'MRN-87654321',
    name: 'Mary Johnson',
    age: 72,
    dob: '1953-08-22',
    gender: 'Female',
    race: 'African American',
    ethnicity: 'Not Hispanic or Latino',
    contact: {
      phone: '(555) 234-5678',
      email: 'mary.johnson@email.com',
      address: '456 Oak Ave, Cambridge, MA 02138',
      emergencyContact: 'Robert Johnson (Son) - (555) 876-5432'
    },
    diagnoses: [
      { code: 'G30.1', name: 'Moderate Alzheimer\'s Disease', date: '2022-03-10', status: 'Active' },
      { code: 'I10', name: 'Essential Hypertension', date: '2015-05-15', status: 'Active' }
    ],
    medications: [
      { name: 'Memantine', dose: '10mg', frequency: 'Twice daily', startDate: '2022-04-01', status: 'Active' },
      { name: 'Rivastigmine', dose: '6mg', frequency: 'Twice daily', startDate: '2022-04-01', status: 'Active' },
      { name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', startDate: '2015-06-01', status: 'Active' }
    ],
    cognitiveAssessments: {
      mmse: { score: 19, date: '2025-09-12', range: '18-26 (Mild)' },
      moca: { score: 16, date: '2025-09-12', range: '13-23' },
      adasCog: { score: 32, date: '2025-08-20', range: '15-35' },
      cdr: { score: 1.0, description: 'Mild Dementia' }
    },
    labResults: [
      { test: 'Creatinine', value: '0.8 mg/dL', date: '2025-09-08', status: 'Normal', range: '0.6-1.2' },
      { test: 'AST', value: '22 U/L', date: '2025-09-08', status: 'Normal', range: '10-40' },
      { test: 'ALT', value: '25 U/L', date: '2025-09-08', status: 'Normal', range: '7-56' }
    ],
    imaging: [
      { type: 'Amyloid PET Scan', result: 'Positive', date: '2025-07-25', notes: 'Significant amyloid burden' },
      { type: 'Brain MRI', result: 'Moderate atrophy', date: '2025-07-25', notes: 'No microhemorrhages' }
    ],
    vitalSigns: {
      bloodPressure: '132/78 mmHg',
      heartRate: '68 bpm',
      temperature: '98.4°F',
      weight: '142 lbs',
      height: '5\'4"',
      bmi: '24.4',
      date: '2025-09-20'
    },
    visitHistory: [
      { date: '2025-09-20', type: 'Neurology Follow-up', provider: 'Dr. Sarah Johnson', notes: 'Progressive decline noted' },
      { date: '2025-08-20', type: 'Cognitive Assessment', provider: 'Dr. Michael Chen', notes: 'ADAS-Cog score increased' }
    ],
    studyPartner: {
      available: true,
      name: 'Robert Johnson',
      relationship: 'Son',
      contact: '(555) 876-5432',
      commitment: 'Available for all visits'
    },
    eligibility: {
      qualified: true,
      matchedCriteria: [
        'Age 50-85 years inclusive',
        'MMSE score 18-26 (mild to moderate)',
        'Positive amyloid status (PET or CSF)',
        'Reliable study partner'
      ],
      failedCriteria: [],
      notes: 'Patient meets all inclusion criteria. Good overall health. Stable on current AD medications for >6 months.'
    },
    trialHistory: {
      current: [],
      past: [],
      interested: true
    },
    lastVisit: '2025-09-20',
    status: 'Pre-Screened'
  }
}

export default function PatientProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { currentStudy } = useStudy()
  const { patients } = usePatients()
  const patientId = params?.patientId as string

  // Try to find patient in context first, fall back to mock data
  const contextPatient = patients.find(p => p.id === patientId)
  const patient = contextPatient || mockPatientData[patientId]

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Patient Not Found</h3>
            <Button onClick={() => router.push('/ingest/patients')}>
              Back to Patient List
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // For context patients, create a mock-like structure with available data
  const patientData = contextPatient ? {
    id: patient.id,
    mrn: patient.id,
    name: patient.name,
    age: patient.age,
    dob: patient.dob || 'N/A',
    gender: patient.gender,
    race: patient.race || 'Not specified',
    ethnicity: patient.ethnicity || 'Not specified',
    contact: {
      phone: patient.phone,
      email: patient.email,
      address: patient.address || 'N/A',
      emergencyContact: 'N/A'
    },
    diagnoses: patient.conditions?.map((condition, idx) => ({
      code: 'ICD-10',
      name: condition,
      date: 'N/A',
      status: 'Active'
    })) || [],
    medications: patient.medications?.map((medication, idx) => ({
      name: medication,
      dose: 'N/A',
      frequency: 'N/A',
      startDate: 'N/A',
      status: 'Active'
    })) || [],
    cognitiveAssessments: patient.cognitiveAssessments || {
      mmse: { score: 0, date: 'N/A', range: 'N/A' },
      moca: { score: 0, date: 'N/A', range: 'N/A' },
      adasCog: { score: 0, date: 'N/A', range: 'N/A' },
      cdr: { score: 0, date: 'N/A', description: 'N/A' }
    },
    labResults: patient.labResults || [],
    imaging: patient.imaging || [],
    vitalSigns: patient.vitalSigns || {
      bloodPressure: 'N/A',
      heartRate: 'N/A',
      temperature: 'N/A',
      weight: 'N/A',
      height: 'N/A',
      bmi: 'N/A',
      date: 'N/A'
    },
    visitHistory: patient.visitHistory || [],
    studyPartner: patient.studyPartner || {
      available: false,
      name: 'N/A',
      relationship: 'N/A',
      contact: 'N/A',
      commitment: 'N/A'
    },
    eligibility: {
      qualified: patient.tag === 'Eligible' || patient.tag === 'Match',
      matchedCriteria: patient.criteriaMatches
        ? patient.criteriaMatches
            .filter(c => c.matched && c.type === 'inclusion')
            .map(c => c.criterionText)
        : (patient.tag === 'Eligible' || patient.tag === 'Match'
          ? ['Meets eligibility criteria based on initial screening']
          : []),
      failedCriteria: patient.criteriaMatches
        ? patient.criteriaMatches
            .filter(c => !c.matched)
            .map(c => c.criterionText)
        : (patient.tag === 'Ineligible'
          ? ['Does not meet one or more eligibility criteria']
          : []),
      notes: patient.eligibilityNotes || `Patient tag: ${patient.tag}. Status: ${patient.status}`
    },
    trialHistory: {
      current: [],
      past: [],
      interested: true
    },
    lastVisit: patient.lastContactDate || 'N/A',
    status: patient.status
  } : patient

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
                onClick={() => router.push('/ingest/patients')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient List
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{patientData.name}</h1>
                <p className="text-sm text-slate-600">MRN: {patientData.mrn} • {patientData.age} years old • {patientData.gender}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {patientData.eligibility.qualified ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Eligible
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Eligible
                </Badge>
              )}
              <Badge variant="outline">{patientData.status}</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Demographics & Contact */}
          <div className="space-y-6">
            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Date of Birth</p>
                  <p className="font-medium">{patientData.dob}</p>
                </div>
                <div>
                  <p className="text-slate-600">Age</p>
                  <p className="font-medium">{patientData.age} years</p>
                </div>
                <div>
                  <p className="text-slate-600">Gender</p>
                  <p className="font-medium">{patientData.gender}</p>
                </div>
                <div>
                  <p className="text-slate-600">Race</p>
                  <p className="font-medium">{patientData.race}</p>
                </div>
                <div>
                  <p className="text-slate-600">Ethnicity</p>
                  <p className="font-medium">{patientData.ethnicity}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Phone className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-slate-600">Phone</p>
                    <p className="font-medium">{patientData.contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-slate-600">Email</p>
                    <p className="font-medium">{patientData.contact.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-slate-600">Address</p>
                    <p className="font-medium">{patientData.contact.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-slate-600">Emergency Contact</p>
                    <p className="font-medium">{patientData.contact.emergencyContact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Partner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserPlus className="h-4 w-4" />
                  Study Partner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Name</p>
                  <p className="font-medium">{patientData.studyPartner.name}</p>
                </div>
                <div>
                  <p className="text-slate-600">Relationship</p>
                  <p className="font-medium">{patientData.studyPartner.relationship}</p>
                </div>
                <div>
                  <p className="text-slate-600">Contact</p>
                  <p className="font-medium">{patientData.studyPartner.contact}</p>
                </div>
                <div>
                  <p className="text-slate-600">Availability</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {patientData.studyPartner.commitment}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Vital Signs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4" />
                  Vital Signs
                </CardTitle>
                <p className="text-xs text-slate-600">Last recorded: {patientData.vitalSigns.date}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Blood Pressure</span>
                  <span className="font-medium">{patientData.vitalSigns.bloodPressure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Heart Rate</span>
                  <span className="font-medium">{patientData.vitalSigns.heartRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Temperature</span>
                  <span className="font-medium">{patientData.vitalSigns.temperature}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Weight</span>
                  <span className="font-medium">{patientData.vitalSigns.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Height</span>
                  <span className="font-medium">{patientData.vitalSigns.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">BMI</span>
                  <span className="font-medium">{patientData.vitalSigns.bmi}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Clinical Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Eligibility Status */}
            <Card className={patientData.eligibility.qualified ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {patientData.eligibility.qualified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Eligibility Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patientData.eligibility.matchedCriteria.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-green-700 mb-2">✓ Matched Criteria</h4>
                    <ul className="space-y-1 text-sm">
                      {patientData.eligibility.matchedCriteria.map((criteria: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {patientData.eligibility.failedCriteria.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-red-700 mb-2">✗ Failed Criteria</h4>
                    <ul className="space-y-1 text-sm">
                      {patientData.eligibility.failedCriteria.map((criteria: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {patientData.eligibility.notes && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Notes:</strong> {patientData.eligibility.notes}
                    </AlertDescription>
                  </Alert>
                )}
                {patientData.eligibility.qualified && (
                  <Button
                    className="w-full"
                    onClick={() => router.push('/campaigns')}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add to Screening Campaign
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Tabs for detailed information */}
            <Tabs defaultValue="diagnoses" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="cognitive">Cognitive</TabsTrigger>
                <TabsTrigger value="labs">Labs & Imaging</TabsTrigger>
                <TabsTrigger value="visits">Visit History</TabsTrigger>
              </TabsList>

              <TabsContent value="diagnoses" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4" />
                      Active Diagnoses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patientData.diagnoses.map((diagnosis: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 bg-slate-50">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">{diagnosis.name}</p>
                              <p className="text-sm text-slate-600">ICD-10: {diagnosis.code}</p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {diagnosis.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">Diagnosed: {diagnosis.date}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medications" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Pill className="h-4 w-4" />
                      Current Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patientData.medications.map((medication: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 bg-slate-50">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">{medication.name}</p>
                              <p className="text-sm text-slate-600">{medication.dose} - {medication.frequency}</p>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {medication.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600">Started: {medication.startDate}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cognitive" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Brain className="h-4 w-4" />
                      Cognitive Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* MMSE */}
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <h4 className="font-semibold text-slate-900 mb-2">MMSE</h4>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-3xl font-bold text-blue-600">{patientData.cognitiveAssessments.mmse.score}</span>
                          <span className="text-sm text-slate-600">/30</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{patientData.cognitiveAssessments.mmse.range}</p>
                        <p className="text-xs text-slate-500">Assessed: {patientData.cognitiveAssessments.mmse.date}</p>
                      </div>

                      {/* MoCA */}
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <h4 className="font-semibold text-slate-900 mb-2">MoCA</h4>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-3xl font-bold text-blue-600">{patientData.cognitiveAssessments.moca.score}</span>
                          <span className="text-sm text-slate-600">/30</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{patientData.cognitiveAssessments.moca.range}</p>
                        <p className="text-xs text-slate-500">Assessed: {patientData.cognitiveAssessments.moca.date}</p>
                      </div>

                      {/* ADAS-Cog */}
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <h4 className="font-semibold text-slate-900 mb-2">ADAS-Cog 11</h4>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-3xl font-bold text-blue-600">{patientData.cognitiveAssessments.adasCog.score}</span>
                          <span className="text-sm text-slate-600">/70</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{patientData.cognitiveAssessments.adasCog.range}</p>
                        <p className="text-xs text-slate-500">Assessed: {patientData.cognitiveAssessments.adasCog.date}</p>
                      </div>

                      {/* CDR */}
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <h4 className="font-semibold text-slate-900 mb-2">CDR</h4>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-3xl font-bold text-blue-600">{patientData.cognitiveAssessments.cdr.score}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{patientData.cognitiveAssessments.cdr.description}</p>
                        <p className="text-xs text-slate-500">Assessed: {patientData.cognitiveAssessments.cdr.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="labs" className="mt-4">
                <div className="space-y-4">
                  {/* Lab Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Microscope className="h-4 w-4" />
                        Laboratory Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patientData.labResults.map((lab: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between border-b pb-2">
                            <div>
                              <p className="font-medium text-slate-900">{lab.test}</p>
                              <p className="text-xs text-slate-600">Range: {lab.range}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-blue-600">{lab.value}</p>
                              <p className="text-xs text-slate-500">{lab.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Imaging */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Beaker className="h-4 w-4" />
                        Imaging Studies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {patientData.imaging.map((image: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-3 bg-slate-50">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-semibold text-slate-900">{image.type}</p>
                              <Badge variant="outline">{image.date}</Badge>
                            </div>
                            <p className="text-sm text-slate-700 mb-1"><strong>Result:</strong> {image.result}</p>
                            <p className="text-xs text-slate-600">{image.notes}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="visits" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4" />
                      Visit History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patientData.visitHistory.map((visit: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-50 rounded-r">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-semibold text-slate-900">{visit.type}</p>
                            <Badge variant="outline">{visit.date}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">Provider: {visit.provider}</p>
                          <p className="text-xs text-slate-600">{visit.notes}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}