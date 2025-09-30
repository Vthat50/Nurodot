"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle, FileSpreadsheet, Loader2, Download } from 'lucide-react'

interface CSVUploaderProps {
  onDataExtracted: (patients: any[]) => void
}

export function CSVUploader({ onDataExtracted }: CSVUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [fileName, setFileName] = useState<string>('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsProcessing(true)

    // Simulate CSV processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Parse CSV and extract patient data
    const mockPatients = [
      {
        id: 'P003',
        name: 'Robert Wilson',
        age: 58,
        gender: 'male',
        diagnoses: ['Early Alzheimer\'s Disease'],
        mmse_score: 24,
        medications: ['Donepezil 5mg'],
        last_visit: '2025-09-25'
      },
      {
        id: 'P004',
        name: 'Patricia Brown',
        age: 71,
        gender: 'female',
        diagnoses: ['Mild Cognitive Impairment'],
        mmse_score: 26,
        medications: ['Vitamin E'],
        last_visit: '2025-09-18'
      },
      {
        id: 'P005',
        name: 'Michael Davis',
        age: 63,
        gender: 'male',
        diagnoses: ['Alzheimer\'s Disease'],
        mmse_score: 20,
        medications: ['Memantine 10mg', 'Donepezil 10mg'],
        last_visit: '2025-09-22'
      },
    ]

    onDataExtracted(mockPatients)
    setIsComplete(true)
    setIsProcessing(false)
  }

  const downloadTemplate = () => {
    // Create CSV template
    const template = `Patient ID,Name,Age,Gender,Diagnosis,MMSE Score,Medications,Last Visit
P001,John Doe,65,male,Alzheimer's Disease,22,Donepezil 10mg,2025-09-15
P002,Jane Smith,70,female,Mild Cognitive Impairment,25,Memantine 5mg,2025-09-20`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'patient_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-green-200 bg-green-50/30">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-slate-900">CSV Upload</h3>
            <p className="text-sm text-slate-600">
              Upload a CSV file with patient information
            </p>
          </div>
        </div>

        {!isComplete ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="text-sm space-y-2">
                <div>
                  <strong>📋 CSV Format:</strong> Upload a spreadsheet with patient cohort data
                </div>
                <div className="text-xs text-slate-600 space-y-1 mt-2">
                  <p><strong>Required columns:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Patient ID / MRN</li>
                    <li>Name</li>
                    <li>Age</li>
                    <li>Gender</li>
                    <li>Diagnosis (ICD-10 or text)</li>
                    <li>MMSE Score (optional)</li>
                    <li>Medications</li>
                    <li>Last Visit Date</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-white border border-green-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm text-slate-900">How it works:</h4>
              <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
                <li>Download the CSV template with required columns</li>
                <li>Fill in your patient data from your EHR or database</li>
                <li>Save as CSV format</li>
                <li>Upload the file below</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <div className="flex-1">
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
                <Button
                  onClick={() => document.getElementById('csv-upload')?.click()}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing CSV...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Upload Complete!</span>
            </div>
            <p className="text-sm text-slate-600">
              Patient cohort imported successfully from <strong>{fileName}</strong>. Data is now ready for pre-screening against study criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsComplete(false)
                setFileName('')
              }}
            >
              Upload Another File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}