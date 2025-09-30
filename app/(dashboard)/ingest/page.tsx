"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStudy } from "@/contexts/study-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PDFViewerWithExtraction } from "@/components/ingest/PDFViewerWithExtraction"
import {
  ArrowLeft,
  FileText,
  FileUp,
  Beaker,
  Sparkles,
  Edit2,
  Save,
  X,
  Plus
} from "lucide-react"

export default function IngestPage() {
  const router = useRouter()
  const { studies, currentStudy, setCurrentStudy, createStudy, updateStudyInfo, updateStudyCriteria } = useStudy()

  // Upload & Extraction State
  const [protocolFile, setProtocolFile] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)

  // Study Info Editing State
  const [isEditingStudyInfo, setIsEditingStudyInfo] = useState(false)
  const [editedStudyInfo, setEditedStudyInfo] = useState<any>(null)

  const handleProtocolUpload = async (file: File) => {
    setProtocolFile(file)
    setIsExtracting(true)
    setExtractedData(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/extract-protocol', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Extraction failed')
      }

      const data = await response.json()
      setExtractedData(data)
      setEditedStudyInfo(data.studyInfo) // Initialize with extracted data
      setIsEditingStudyInfo(true) // Show edit form immediately
    } catch (error) {
      console.error('Error extracting protocol:', error)
      alert('Failed to extract protocol. Please try again.')
      setProtocolFile(null)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSaveStudy = () => {
    if (!editedStudyInfo || !protocolFile || !extractedData) return

    // Create new study from extracted and edited info
    const newStudy = {
      id: editedStudyInfo.title.replace(/\s+/g, '-').toUpperCase(),
      title: editedStudyInfo.title,
      description: editedStudyInfo.description,
      phase: editedStudyInfo.phase,
      enrollmentTarget: 150, // Default
      currentEnrollment: 0,
      protocolFile,
      criteria: {
        inclusion: extractedData.inclusion,
        exclusion: extractedData.exclusion,
        questions: extractedData.questions
      }
    }

    createStudy(newStudy)

    // Redirect to patient import page for the new study
    router.push('/ingest/patients')
  }

  const handleCancelEdit = () => {
    setIsEditingStudyInfo(false)
    setProtocolFile(null)
    setExtractedData(null)
    setEditedStudyInfo(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Show extraction flow if in progress */}
        {isExtracting && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Extracting Study Information with AI...
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Analyzing {protocolFile?.name}
                  </p>
                  <Progress value={65} className="mb-2" />
                  <p className="text-xs text-slate-500">
                    Reading protocol, identifying study info, extracting I/E criteria...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PDF Viewer and Criteria Review First */}
        {isEditingStudyInfo && extractedData && editedStudyInfo && protocolFile && (
          <>
            {/* PDF Viewer with Extracted Criteria */}
            <PDFViewerWithExtraction
              pdfFile={protocolFile}
              extractedData={extractedData}
            />

            {/* Study Info Edit Form Below */}
            <Card className="mt-6 border-blue-300 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Review & Edit Study Information
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  Review the extracted criteria above, then edit the study information below before creating the study.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studyTitle">Study Title</Label>
                    <Input
                      id="studyTitle"
                      value={editedStudyInfo.title}
                      onChange={(e) => setEditedStudyInfo({ ...editedStudyInfo, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studyPhase">Phase</Label>
                    <Input
                      id="studyPhase"
                      value={editedStudyInfo.phase}
                      onChange={(e) => setEditedStudyInfo({ ...editedStudyInfo, phase: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="studyDescription">Description</Label>
                  <Input
                    id="studyDescription"
                    value={editedStudyInfo.description}
                    onChange={(e) => setEditedStudyInfo({ ...editedStudyInfo, description: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studySponsor">Sponsor</Label>
                    <Input
                      id="studySponsor"
                      value={editedStudyInfo.sponsor || ''}
                      onChange={(e) => setEditedStudyInfo({ ...editedStudyInfo, sponsor: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studyNctId">NCT ID</Label>
                    <Input
                      id="studyNctId"
                      value={editedStudyInfo.nctId || ''}
                      onChange={(e) => setEditedStudyInfo({ ...editedStudyInfo, nctId: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-slate-900 mb-2">Extracted Criteria Summary</h4>
                  <div className="flex gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {extractedData.inclusion.length} Inclusion Criteria
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {extractedData.exclusion.length} Exclusion Criteria
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      {extractedData.questions.length} Screening Questions
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveStudy} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Create Study
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Studies List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-blue-600" />
                Your Studies
              </CardTitle>
              {!isEditingStudyInfo && (
                <div>
                  <input
                    id="protocol-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleProtocolUpload(e.target.files[0])}
                  />
                  <Button onClick={() => document.getElementById('protocol-upload')?.click()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Protocol
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {studies.length === 0 ? (
              <div className="text-center py-12">
                <FileUp className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Studies Yet
                </h3>
                <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                  Upload a protocol document to get started. AI will extract the study information and criteria automatically.
                </p>
                <input
                  id="protocol-upload-empty"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleProtocolUpload(e.target.files[0])}
                />
                <Button size="lg" onClick={() => document.getElementById('protocol-upload-empty')?.click()}>
                  <FileUp className="h-5 w-5 mr-2" />
                  Upload Your First Protocol
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {studies.map((study) => (
                  <div
                    key={study.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300 ${
                      currentStudy?.id === study.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                    }`}
                    onClick={() => setCurrentStudy(study)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Beaker className={`h-5 w-5 mt-0.5 ${
                          currentStudy?.id === study.id ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{study.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{study.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {study.phase}
                            </Badge>
                            {study.criteria && (
                              <>
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  {study.criteria.inclusion.length} Inclusion
                                </Badge>
                                <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                  {study.criteria.exclusion.length} Exclusion
                                </Badge>
                              </>
                            )}
                          </div>

                          {/* Version History - Collapsible */}
                          {currentStudy?.id === study.id && (
                            <details className="mt-4">
                              <summary className="cursor-pointer text-sm font-medium text-purple-700 hover:text-purple-900 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Protocol Version History (3 versions)
                              </summary>
                              <div className="mt-3 space-y-2 pl-6 border-l-2 border-purple-200">
                                {/* Current Version */}
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                          v1.2 Current
                                        </Badge>
                                        <span className="text-xs text-slate-600">2 days ago</span>
                                      </div>
                                      <p className="text-sm font-medium text-slate-900">{study.title}-Protocol-v1.2.pdf</p>
                                      <p className="text-xs text-slate-600 mt-1">Updated inclusion criteria for age range</p>
                                      <p className="text-xs text-slate-500">Uploaded by Dr. Sarah Chen</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="text-xs">
                                      View
                                    </Button>
                                  </div>
                                </div>

                                {/* Previous Version */}
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary" className="text-xs">v1.1</Badge>
                                        <span className="text-xs text-slate-600">1 week ago</span>
                                      </div>
                                      <p className="text-sm font-medium text-slate-900">{study.title}-Protocol-v1.1.pdf</p>
                                      <p className="text-xs text-slate-600 mt-1">Added exclusion criterion for diabetes</p>
                                      <p className="text-xs text-slate-500">Uploaded by Dr. Michael Park</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs">
                                      View
                                    </Button>
                                  </div>
                                </div>

                                {/* Original Version */}
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary" className="text-xs">v1.0</Badge>
                                        <span className="text-xs text-slate-600">3 weeks ago</span>
                                      </div>
                                      <p className="text-sm font-medium text-slate-900">{study.title}-Protocol-v1.0.pdf</p>
                                      <p className="text-xs text-slate-600 mt-1">Initial protocol upload</p>
                                      <p className="text-xs text-slate-500">Uploaded by Dr. Sarah Chen</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs">
                                      View
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentStudy(study)
                          router.push('/ingest/detail')
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}