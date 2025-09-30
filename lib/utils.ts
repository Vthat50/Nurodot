import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CSV Export utility for patient data
export function exportPatientsToCSV(patients: any[], filename: string = 'patients-export.csv') {
  if (patients.length === 0) {
    alert('No patients to export')
    return
  }

  // Define CSV headers
  const headers = [
    'Patient ID',
    'Name',
    'Age',
    'Gender',
    'Phone',
    'Email',
    'Status',
    'Tag',
    'Conditions',
    'Medications',
    'Eligibility Score',
    'Source',
    'AI Call Status',
    'Verbal Consent Timestamp',
    'Consent Audio URL',
    'Visit Scheduled Date',
    'Visit Scheduled Time',
    'Visit Confirmation Status',
    'Last Contact Date',
    'Study ID'
  ]

  // Convert patients to CSV rows
  const rows = patients.map(patient => [
    patient.id || '',
    patient.name || '',
    patient.age || '',
    patient.gender || '',
    patient.phone || '',
    patient.email || '',
    patient.status || '',
    patient.tag || '',
    Array.isArray(patient.conditions) ? patient.conditions.join('; ') : '',
    Array.isArray(patient.medications) ? patient.medications.join('; ') : '',
    patient.eligibilityScore || '',
    patient.source || '',
    patient.aiCallStatus || '',
    patient.verbalConsentTimestamp || '',
    patient.consentAudioUrl || '',
    patient.visitScheduledDate || '',
    patient.visitScheduledTime || '',
    patient.visitConfirmationStatus || '',
    patient.lastContactDate || '',
    patient.studyId || ''
  ])

  // Escape and quote CSV values
  const escapeCSV = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  // Build CSV content
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(cell => escapeCSV(String(cell))).join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
