"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, CheckCircle, ExternalLink, Loader2, FileSpreadsheet } from 'lucide-react'

interface EpicFHIRConnectorProps {
  onDataExtracted: (patients: any[]) => void
}

export function EpicFHIRConnector({ onDataExtracted }: EpicFHIRConnectorProps) {
  const [isExtracting, setIsExtracting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleSlicerDicerExport = async () => {
    setIsExtracting(true)

    // Simulate SlicerDicer export processing
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Simulate data extraction - Mix of eligible, potential, and ineligible patients
    const mockPatients = [
      // ELIGIBLE MATCHES (Pass ALL criteria)
      {
        id: 'P001',
        name: 'John Smith',
        age: 67,
        gender: 'male',
        diagnoses: ['Mild Alzheimer\'s Disease'],
        mmse_score: 22,
        medications: ['Donepezil 10mg'],
        last_visit: '2025-09-15'
      },
      {
        id: 'P002',
        name: 'Mary Johnson',
        age: 72,
        gender: 'female',
        diagnoses: ['Moderate Alzheimer\'s Disease'],
        mmse_score: 19,
        medications: ['Memantine 10mg', 'Rivastigmine 6mg'],
        last_visit: '2025-09-20'
      },
      {
        id: 'P003',
        name: 'Robert Williams',
        age: 65,
        gender: 'male',
        diagnoses: ['Mild Cognitive Impairment'],
        mmse_score: 24,
        medications: ['Vitamin E'],
        last_visit: '2025-09-18'
      },
      {
        id: 'P004',
        name: 'Patricia Brown',
        age: 70,
        gender: 'female',
        diagnoses: ['Early-stage Alzheimer\'s Disease'],
        mmse_score: 21,
        medications: ['Donepezil 10mg', 'Memantine 10mg'],
        last_visit: '2025-09-22'
      },
      {
        id: 'P005',
        name: 'Michael Davis',
        age: 69,
        gender: 'male',
        diagnoses: ['Mild Alzheimer\'s Disease'],
        mmse_score: 23,
        medications: ['Donepezil 5mg'],
        last_visit: '2025-09-19'
      },
      // POTENTIAL MATCHES (Pass 60%+ but not all criteria)
      {
        id: 'P006',
        name: 'Linda Wilson',
        age: 68,
        gender: 'female',
        diagnoses: ['Alzheimer\'s Disease', 'History of TIA (3 years ago)'],
        mmse_score: 20,
        medications: ['Rivastigmine 9mg', 'Aspirin'],
        last_visit: '2025-09-21'
      },
      {
        id: 'P007',
        name: 'James Martinez',
        age: 73,
        gender: 'male',
        diagnoses: ['Moderate Alzheimer\'s Disease'],
        mmse_score: 17,
        medications: ['Memantine 20mg', 'Donepezil 10mg'],
        last_visit: '2025-09-17'
      },
      // INELIGIBLE (Fail key criteria)
      {
        id: 'P008',
        name: 'Thomas Clark',
        age: 45,
        gender: 'male',
        diagnoses: ['Early-onset Dementia'],
        mmse_score: 20,
        medications: ['Donepezil 10mg'],
        last_visit: '2025-09-16'
      },
      {
        id: 'P009',
        name: 'Jennifer Lee',
        age: 71,
        gender: 'female',
        diagnoses: ['Alzheimer\'s Disease', 'Breast Cancer (remission)'],
        mmse_score: 21,
        medications: ['Rivastigmine 6mg', 'Tamoxifen'],
        last_visit: '2025-09-24'
      },
    ]

    onDataExtracted(mockPatients)
    setIsComplete(true)
    setIsExtracting(false)
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-semibold text-slate-900">Epic SlicerDicer Integration</h3>
            <p className="text-sm text-slate-600">
              Import patient cohorts directly from Epic's research tools
            </p>
          </div>
        </div>

        {!isComplete ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="text-sm space-y-2">
                <div>
                  <strong>✨ Automated Workflow:</strong> Use Epic's built-in research tools to identify and import patient cohorts.
                </div>
                <div className="text-xs text-slate-600 space-y-1 mt-2">
                  <p><strong>Coordinators typically use:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><strong>SlicerDicer:</strong> Interactive patient cohort builder</li>
                    <li><strong>Cogito/Reporting Workbench:</strong> Advanced reporting</li>
                    <li><strong>Research Study Tracking:</strong> Built-in Epic research module</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-white border border-blue-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm text-slate-900">How it works:</h4>
              <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
                <li>Open <strong>Epic SlicerDicer</strong> or <strong>Reporting Workbench</strong> in your Epic environment</li>
                <li>Build your patient cohort using study criteria (age, diagnosis, labs, etc.)</li>
                <li>Export to Excel/CSV with required fields:
                  <ul className="list-disc list-inside ml-6 text-xs mt-1 text-slate-600">
                    <li>Patient ID, MRN, Age, Gender</li>
                    <li>Diagnosis codes (ICD-10)</li>
                    <li>Recent lab results (if needed)</li>
                    <li>Medications</li>
                  </ul>
                </li>
                <li>Click below to simulate importing from Epic</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSlicerDicerExport}
                disabled={isExtracting}
                className="flex-1"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing from SlicerDicer...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    SlicerDicer Import
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Import Complete!</span>
            </div>
            <p className="text-sm text-slate-600">
              Patient cohort imported successfully from Epic SlicerDicer. Data is now ready for pre-screening against study criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsComplete(false)
              }}
            >
              Import Another Cohort
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}