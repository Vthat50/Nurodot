"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { usePatients, type Patient, type GeneratedDocument } from "@/contexts/patient-context"
import { useStudy } from "@/contexts/study-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  Mail,
  User,
  Clock,
  AlertCircle,
  Edit,
  Play,
  MessageSquare,
  FileText,
  Activity,
  Download,
  FileCheck,
  FilePlus,
  ChevronDown,
  Upload
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function PatientProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { patients, updatePatient } = usePatients()
  const { currentStudy } = useStudy()
  const patientId = params?.patientId as string

  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false)
  const [overrideTag, setOverrideTag] = useState("")
  const [overrideStatus, setOverrideStatus] = useState("")
  const [overrideReason, setOverrideReason] = useState("")
  const [isGenerating, setIsGenerating] = useState<GeneratedDocument['type'] | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDocType, setUploadDocType] = useState<GeneratedDocument['type']>('Other')

  const patient = patients.find(p => p.id === patientId)

  // Document generation function
  const generateDocument = (docType: GeneratedDocument['type']) => {
    if (!patient) return
    setIsGenerating(docType)

    // Simulate document generation with a delay
    setTimeout(() => {
      const docTypePrefix = docType.replace(/\s+/g, '_')
      const newDoc: GeneratedDocument = {
        id: `doc-${docTypePrefix.toLowerCase()}-${Date.now()}`,
        type: docType,
        filename: `${docTypePrefix}_${patient.id}_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        generatedDate: new Date().toISOString(),
        generatedBy: 'Dr. Sarah Chen', // Mock user
        status: 'draft',
        url: `/mock/documents/${docTypePrefix.toLowerCase()}-${patient.id}-${Date.now()}.pdf`,
        isManualUpload: false
      }

      const currentDocs = patient.generatedDocuments || []
      updatePatient(patient.id, {
        generatedDocuments: [...currentDocs, newDoc]
      })

      setIsGenerating(null)
    }, 1500)
  }

  const handleManualUpload = () => {
    if (!patient || !uploadFile) return

    const newDoc: GeneratedDocument = {
      id: `doc-manual-${Date.now()}`,
      type: uploadDocType,
      filename: uploadFile.name,
      generatedDate: new Date().toISOString(),
      generatedBy: 'Dr. Sarah Chen', // Mock user
      status: 'draft',
      url: `/mock/documents/uploaded-${Date.now()}.pdf`,
      isManualUpload: true
    }

    const currentDocs = patient.generatedDocuments || []
    updatePatient(patient.id, {
      generatedDocuments: [...currentDocs, newDoc]
    })

    setUploadDialogOpen(false)
    setUploadFile(null)
    setUploadDocType('Other')
  }

  const handleDownload = (doc: GeneratedDocument) => {
    // In a real app, this would trigger actual download
    alert(`Downloading: ${doc.filename}\n\nIn production, this would download the actual PDF file.`)
  }

  const updateDocumentStatus = (docId: string, newStatus: GeneratedDocument['status']) => {
    if (!patient) return

    const updatedDocs = (patient.generatedDocuments || []).map(doc =>
      doc.id === docId ? { ...doc, status: newStatus } : doc
    )

    updatePatient(patient.id, {
      generatedDocuments: updatedDocs
    })
  }

  // Function to highlight mental health keywords in transcript
  const highlightKeywords = (text: string) => {
    const keywords = ['anxiety', 'anxious', 'sad', 'sadness', 'depression', 'depressed', 'worry', 'worried', 'stress', 'stressed']
    const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi')

    const parts = text.split(regex)

    return parts.map((part, index) => {
      const isKeyword = keywords.some(kw => kw.toLowerCase() === part.toLowerCase())
      if (isKeyword) {
        return (
          <span key={index} className="bg-yellow-200 text-yellow-900 font-semibold px-1 rounded">
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Patient Not Found</h3>
            <Button onClick={() => router.push('/dashboard/ingest/detail/patients')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleOverride = () => {
    if (!overrideTag || !overrideStatus || !overrideReason.trim()) {
      alert("Please fill in all fields")
      return
    }

    updatePatient(patient.id, {
      tag: overrideTag as Patient['tag'],
      status: overrideStatus as Patient['status'],
      eligibilityOverride: {
        originalTag: patient.tag,
        originalStatus: patient.status,
        newTag: overrideTag,
        newStatus: overrideStatus,
        reason: overrideReason,
        overriddenBy: "Dr. Smith", // Mock coordinator name
        overriddenAt: new Date().toISOString()
      }
    })

    setIsOverrideDialogOpen(false)
    setOverrideReason("")
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Eligible': return 'bg-green-100 text-green-700 border-green-300'
      case 'Match': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'Potential Match': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'Ineligible': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-slate-100 text-slate-700 border-slate-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enrolled': return 'bg-green-600 text-white'
      case 'On-site visit scheduled': return 'bg-blue-600 text-white'
      case 'AI Call Initiated': return 'bg-purple-600 text-white'
      case 'Declined Participation': return 'bg-orange-600 text-white'
      case 'Failed Screening': return 'bg-red-600 text-white'
      case 'Pending Review': return 'bg-slate-600 text-white'
      default: return 'bg-slate-600 text-white'
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
                onClick={() => router.push('/dashboard/ingest/detail/patients')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                <p className="text-sm text-slate-600">{patient.age} years old • {patient.gender}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getTagColor(patient.tag)}>
                {patient.tag}
              </Badge>
              <Badge className={getStatusColor(patient.status)}>
                {patient.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Consent & Visit Scheduling Section */}
        {patient.verbalConsentTimestamp && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle className="h-5 w-5" />
                Consent & Visit Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-slate-900">Verbal Consent</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Recorded: {new Date(patient.verbalConsentTimestamp).toLocaleString()}
                  </p>
                  {patient.consentAudioUrl && (
                    <Button size="sm" variant="outline" className="w-full">
                      <Play className="h-3 w-3 mr-2" />
                      Play Audio Clip
                    </Button>
                  )}
                </div>

                {patient.visitScheduledDate && (
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">On-site Visit</h3>
                    </div>
                    <p className="text-lg font-bold text-blue-900 mb-1">
                      {patient.visitScheduledDate} at {patient.visitScheduledTime}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant={patient.visitConfirmationStatus === 'confirmed' ? 'default' : 'secondary'}>
                        {patient.visitConfirmationStatus === 'confirmed' ? 'Confirmed' :
                         patient.visitConfirmationStatus === 'reminder_sent' ? 'Reminder Sent' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Eligibility Criteria Assessment */}
        {patient.criteriaMatches && patient.criteriaMatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Eligibility Criteria Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Inclusion Criteria */}
              <div>
                <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Inclusion Criteria
                </h3>
                <div className="space-y-2">
                  {patient.criteriaMatches.filter(c => c.type === 'inclusion').map((criterion) => (
                    <div
                      key={criterion.criterionId}
                      className={`p-3 rounded-lg border ${
                        criterion.matched
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {criterion.matched ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{criterion.criterionText}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            <strong>Patient Value:</strong> {criterion.patientValue || 'Not assessed'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            <strong>Source:</strong> {criterion.source}
                          </p>
                          {criterion.notes && (
                            <p className="text-xs text-slate-600 mt-1 italic">{criterion.notes}</p>
                          )}
                        </div>
                        <Badge variant={criterion.matched ? 'default' : 'destructive'} className="text-xs">
                          {criterion.matched ? 'Pass' : 'Fail'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusion Criteria */}
              {patient.criteriaMatches.filter(c => c.type === 'exclusion').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Exclusion Criteria
                  </h3>
                  <div className="space-y-2">
                    {patient.criteriaMatches.filter(c => c.type === 'exclusion').map((criterion) => (
                      <div
                        key={criterion.criterionId}
                        className={`p-3 rounded-lg border ${
                          criterion.matched
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {criterion.matched ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{criterion.criterionText}</p>
                            <p className="text-xs text-slate-600 mt-1">
                              <strong>Patient Value:</strong> {criterion.patientValue || 'Not assessed'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              <strong>Source:</strong> {criterion.source}
                            </p>
                            {criterion.notes && (
                              <p className="text-xs text-slate-600 mt-1 italic">{criterion.notes}</p>
                            )}
                          </div>
                          <Badge variant={criterion.matched ? 'default' : 'destructive'} className="text-xs">
                            {criterion.matched ? 'Pass' : 'Fail'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Documents & Forms Card */}
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-purple-600" />
              Documents & Forms
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Generate patient-specific forms based on collected data and study protocol
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Document Actions */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={isGenerating !== null}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Generating {isGenerating}...
                      </>
                    ) : (
                      <>
                        <FilePlus className="h-4 w-4 mr-2" />
                        Generate Document
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Select Document Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => generateDocument('ICF')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Informed Consent Form (ICF)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generateDocument('eCRF')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Electronic Case Report Form (eCRF)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generateDocument('Screening Log')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Screening Log
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generateDocument('Medical History')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Medical History Form
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generateDocument('Adverse Event')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Adverse Event (AE) Form
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generateDocument('SAE Report')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Serious Adverse Event (SAE) Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generateDocument('Concomitant Medications')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Concomitant Medications Log
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => generateDocument('Protocol Deviation')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Protocol Deviation Log
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Manual Upload
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Manual Upload Dialog */}
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Manually upload a document for this patient
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Document Type</label>
                    <Select value={uploadDocType} onValueChange={(value) => setUploadDocType(value as GeneratedDocument['type'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ICF">Informed Consent Form (ICF)</SelectItem>
                        <SelectItem value="eCRF">Electronic Case Report Form (eCRF)</SelectItem>
                        <SelectItem value="Screening Log">Screening Log</SelectItem>
                        <SelectItem value="Medical History">Medical History Form</SelectItem>
                        <SelectItem value="Adverse Event">Adverse Event (AE) Form</SelectItem>
                        <SelectItem value="SAE Report">Serious Adverse Event (SAE) Report</SelectItem>
                        <SelectItem value="Concomitant Medications">Concomitant Medications Log</SelectItem>
                        <SelectItem value="Protocol Deviation">Protocol Deviation Log</SelectItem>
                        <SelectItem value="Other">Other Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select File</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-purple-50 file:text-purple-700
                        hover:file:bg-purple-100"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleManualUpload} disabled={!uploadFile}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Generated Documents List */}
            {patient.generatedDocuments && patient.generatedDocuments.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900">Generated Documents</h4>
                <div className="space-y-2">
                  {patient.generatedDocuments.map((doc) => {
                    // Get color based on document type
                    const getDocColor = (type: GeneratedDocument['type']) => {
                      switch (type) {
                        case 'ICF': return { text: 'text-purple-600', bg: 'bg-purple-100 text-purple-700 border-purple-300' }
                        case 'eCRF': return { text: 'text-blue-600', bg: 'bg-blue-100 text-blue-700 border-blue-300' }
                        case 'Screening Log': return { text: 'text-green-600', bg: 'bg-green-100 text-green-700 border-green-300' }
                        case 'Medical History': return { text: 'text-amber-600', bg: 'bg-amber-100 text-amber-700 border-amber-300' }
                        case 'Adverse Event': return { text: 'text-orange-600', bg: 'bg-orange-100 text-orange-700 border-orange-300' }
                        case 'SAE Report': return { text: 'text-red-600', bg: 'bg-red-100 text-red-700 border-red-300' }
                        case 'Concomitant Medications': return { text: 'text-teal-600', bg: 'bg-teal-100 text-teal-700 border-teal-300' }
                        case 'Protocol Deviation': return { text: 'text-pink-600', bg: 'bg-pink-100 text-pink-700 border-pink-300' }
                        default: return { text: 'text-slate-600', bg: 'bg-slate-100 text-slate-700 border-slate-300' }
                      }
                    }

                    const colors = getDocColor(doc.type)

                    return (
                      <div
                        key={doc.id}
                        className="p-4 bg-white rounded-lg border border-purple-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {doc.isManualUpload ? (
                              <Upload className={`h-5 w-5 mt-0.5 ${colors.text}`} />
                            ) : (
                              <FileText className={`h-5 w-5 mt-0.5 ${colors.text}`} />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm text-slate-900">{doc.filename}</p>
                                <Badge variant="outline" className={`${colors.bg} text-xs`}>
                                  {doc.type}
                                </Badge>
                                {doc.isManualUpload && (
                                  <Badge variant="secondary" className="text-xs">
                                    Manual Upload
                                  </Badge>
                                )}
                              </div>
                            <div className="text-xs text-slate-600 space-y-0.5">
                              <p>Generated: {new Date(doc.generatedDate).toLocaleString()}</p>
                              <p>By: {doc.generatedBy}</p>
                            </div>
                            <div className="mt-2">
                              <Select
                                value={doc.status}
                                onValueChange={(value) => updateDocumentStatus(doc.id, value as GeneratedDocument['status'])}
                              >
                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="signed">Signed</SelectItem>
                                  <SelectItem value="submitted">Submitted</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc)}
                          className="ml-2"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )
                })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600">No documents generated yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Click the buttons above to generate patient-specific forms
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-slate-600" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-slate-600" />
                <span className="truncate">{patient.email}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Clinical Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {patient.conditions.slice(0, 2).map((condition, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-600">{patient.medications.length} medications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Study</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-medium text-sm">{currentStudy?.title || patient.studyId}</p>
              <p className="text-xs text-slate-600 font-mono">{patient.id}</p>
            </CardContent>
          </Card>
        </div>

        {/* Large AI Call Transcript Viewer */}
        {patient.callHistory && patient.callHistory.length > 0 ? (
          patient.callHistory.map((call) => (
            <Card key={call.id} className="border-2">
              <CardHeader className="bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                      AI Call Transcript
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{call.callDate} at {call.callTime} • Duration: {call.duration}</p>
                  </div>
                  <Badge variant={call.outcome === 'completed' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                    {call.outcome}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Full Transcript - Large View */}
                <div className="space-y-4 min-h-[600px] max-h-[800px] overflow-y-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg">
                  {call.messages.map((message, idx) => {
                    // Determine if this message triggers any tags
                    const showAgeVerified = message.text.includes('March 15th, 1957') && message.speaker === 'patient'
                    const showDiagnosisConfirmed = message.text.includes('diagnosed about two years ago') && message.speaker === 'patient'
                    const showStudyPartner = message.text.includes('daughter Sarah would definitely be willing') && message.speaker === 'patient'
                    const showVerbalConsent = message.text.includes('Yes, I consent to participate') && message.speaker === 'patient'
                    const showVisitScheduled = message.text.includes('October 5th works great') && message.speaker === 'patient'

                    return (
                      <div key={idx} className={`flex gap-4 ${message.speaker === 'ai' ? '' : 'flex-row-reverse'}`}>
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                          message.speaker === 'ai' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {message.speaker === 'ai' ? (
                            <MessageSquare className="h-5 w-5 text-white" />
                          ) : (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className={`flex-1 max-w-[75%]`}>
                          <div className={`${message.speaker === 'patient' ? 'ml-auto' : ''} inline-block p-4 rounded-lg shadow-sm ${
                            message.speaker === 'ai'
                              ? 'bg-white border border-slate-200'
                              : 'bg-green-100 border border-green-200'
                          }`}>
                            <p className="text-sm sm:text-base text-slate-900 leading-relaxed">{highlightKeywords(message.text)}</p>
                            <p className="text-xs text-slate-500 mt-2">{message.timestamp}</p>

                            {/* Tags attached to message */}
                            {(showAgeVerified || showDiagnosisConfirmed || showStudyPartner || showVerbalConsent || showVisitScheduled) && (
                              <div className={`flex flex-wrap gap-2 mt-3 pt-3 border-t ${
                                message.speaker === 'ai' ? 'border-slate-200' : 'border-green-300'
                              }`}>
                                {showAgeVerified && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                    ✓ Age Verified
                                  </Badge>
                                )}
                                {showDiagnosisConfirmed && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                    ✓ Diagnosis Confirmed
                                  </Badge>
                                )}
                                {showStudyPartner && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                    ✓ Study Partner: Confirmed
                                  </Badge>
                                )}
                                {showVerbalConsent && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                    ✓ Verbal Consent Recorded
                                  </Badge>
                                )}
                                {showVisitScheduled && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                    ✓ Visit Scheduled
                                  </Badge>
                                )}
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
          ))
        ) : (
          <Card>
            <CardContent className="p-16 text-center">
              <Phone className="h-20 w-20 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No Call History
              </h3>
              <p className="text-sm text-slate-600">
                This patient has not been contacted yet
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}