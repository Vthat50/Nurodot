"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CallTranscript {
  id: string
  patientId: string
  patientName: string
  callDate: string
  callTime: string
  duration: string
  transcript: string
  summary?: string
  outcome?: 'interested' | 'not_interested' | 'needs_followup' | 'scheduled'
}

export interface CampaignPatient {
  id: string
  name: string
  age: number
  gender: string
  phone: string
  email: string
  status: 'not_contacted' | 'contacted' | 'interested' | 'not_interested' | 'scheduled' | 'screened' | 'enrolled'
  lastContactDate?: string
  lastContactMethod?: 'phone' | 'email' | 'ai_call' | 'portal'
  notes?: string
  scheduledDate?: string
  transcript?: string
}

export interface ScreeningCriteria {
  inclusionCriteria: Array<{id: number, text: string, field?: string, op?: string, value?: any}>
  exclusionCriteria: Array<{id: number, text: string, field?: string, op?: string, value?: any}>
  screeningQuestions: Array<{id: number, question: string}>
}

export interface Campaign {
  id: string
  studyId: string
  studyName: string
  name: string
  createdDate: string
  patients: CampaignPatient[]
  transcripts?: CallTranscript[]
  screeningCriteria?: ScreeningCriteria
  totalPatients: number
  contacted: number
  interested: number
  scheduled: number
  enrolled: number
}

interface CampaignContextType {
  campaigns: Campaign[]
  currentCampaign: Campaign | null
  setCurrentCampaign: (campaign: Campaign) => void
  getCampaignById: (id: string) => Campaign | undefined
  createCampaign: (campaign: Campaign) => void
  addPatientToCampaign: (campaignId: string, patient: CampaignPatient) => void
  updatePatientStatus: (campaignId: string, patientId: string, status: CampaignPatient['status'], notes?: string) => void
  addTranscript: (campaignId: string, transcript: CallTranscript) => void
  updateTranscript: (campaignId: string, transcriptId: string, updates: Partial<CallTranscript>) => void
  deleteTranscript: (campaignId: string, transcriptId: string) => void
  updateScreeningCriteria: (campaignId: string, criteria: ScreeningCriteria) => void
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined)

// Mock campaign for CLARITY-AD with JOHN SMITH
const mockClarityADCampaign: Campaign = {
  id: 'CLARITY-AD-SCREENING-001',
  studyId: 'CLARITY-AD',
  studyName: 'CLARITY-AD',
  name: 'CLARITY-AD Screening Campaign',
  createdDate: '2025-09-20',
  patients: [
    {
      id: 'P001',
      name: 'JOHN SMITH',
      age: 67,
      gender: 'Male',
      phone: '+12179791384',
      email: 'john.smith@email.com',
      status: 'not_contacted',
    }
  ],
  transcripts: [],
  totalPatients: 1,
  contacted: 0,
  interested: 0,
  scheduled: 0,
  enrolled: 0
}

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  // Initialize campaigns with mock data to avoid hydration mismatch
  const [campaigns, setCampaigns] = useState<Campaign[]>([mockClarityADCampaign])
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('campaigns_v2')
      if (stored) {
        try {
          setCampaigns(JSON.parse(stored))
        } catch (e) {
          console.error('Failed to parse campaigns from localStorage:', e)
        }
      }
      // Clear old cache
      localStorage.removeItem('campaigns')
      setIsInitialized(true)
    }
  }, [])

  // Persist campaigns to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('campaigns_v2', JSON.stringify(campaigns))
    }
  }, [campaigns, isInitialized])

  const getCampaignById = (id: string) => {
    return campaigns.find(c => c.id === id)
  }

  const createCampaign = (campaign: Campaign) => {
    setCampaigns(prev => [...prev, campaign])
    setCurrentCampaign(campaign)
  }

  const addPatientToCampaign = (campaignId: string, patient: CampaignPatient) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? {
              ...campaign,
              patients: [...campaign.patients, patient],
              totalPatients: campaign.totalPatients + 1
            }
          : campaign
      )
    )

    if (currentCampaign?.id === campaignId) {
      setCurrentCampaign({
        ...currentCampaign,
        patients: [...currentCampaign.patients, patient],
        totalPatients: currentCampaign.totalPatients + 1
      })
    }
  }

  const updatePatientStatus = (
    campaignId: string,
    patientId: string,
    status: CampaignPatient['status'],
    notes?: string
  ) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign => {
        if (campaign.id !== campaignId) return campaign

        const updatedPatients = campaign.patients.map(patient =>
          patient.id === patientId
            ? {
                ...patient,
                status,
                notes,
                lastContactDate: new Date().toISOString().split('T')[0]
              }
            : patient
        )

        // Recalculate counts
        const contacted = updatedPatients.filter(p =>
          ['contacted', 'interested', 'not_interested', 'scheduled', 'screened', 'enrolled'].includes(p.status)
        ).length
        const interested = updatedPatients.filter(p =>
          ['interested', 'scheduled', 'screened', 'enrolled'].includes(p.status)
        ).length
        const scheduled = updatedPatients.filter(p =>
          ['scheduled', 'screened', 'enrolled'].includes(p.status)
        ).length
        const enrolled = updatedPatients.filter(p => p.status === 'enrolled').length

        return {
          ...campaign,
          patients: updatedPatients,
          contacted,
          interested,
          scheduled,
          enrolled
        }
      })
    )

    if (currentCampaign?.id === campaignId) {
      const updatedPatients = currentCampaign.patients.map(patient =>
        patient.id === patientId
          ? {
              ...patient,
              status,
              notes,
              lastContactDate: new Date().toISOString().split('T')[0]
            }
          : patient
      )

      const contacted = updatedPatients.filter(p =>
        ['contacted', 'interested', 'not_interested', 'scheduled', 'screened', 'enrolled'].includes(p.status)
      ).length
      const interested = updatedPatients.filter(p =>
        ['interested', 'scheduled', 'screened', 'enrolled'].includes(p.status)
      ).length
      const scheduled = updatedPatients.filter(p =>
        ['scheduled', 'screened', 'enrolled'].includes(p.status)
      ).length
      const enrolled = updatedPatients.filter(p => p.status === 'enrolled').length

      setCurrentCampaign({
        ...currentCampaign,
        patients: updatedPatients,
        contacted,
        interested,
        scheduled,
        enrolled
      })
    }
  }

  const addTranscript = (campaignId: string, transcript: CallTranscript) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? {
              ...campaign,
              transcripts: [...(campaign.transcripts || []), transcript]
            }
          : campaign
      )
    )
  }

  const updateTranscript = (campaignId: string, transcriptId: string, updates: Partial<CallTranscript>) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? {
              ...campaign,
              transcripts: (campaign.transcripts || []).map(t =>
                t.id === transcriptId ? { ...t, ...updates } : t
              )
            }
          : campaign
      )
    )
  }

  const deleteTranscript = (campaignId: string, transcriptId: string) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? {
              ...campaign,
              transcripts: (campaign.transcripts || []).filter(t => t.id !== transcriptId)
            }
          : campaign
      )
    )
  }

  const updateScreeningCriteria = (campaignId: string, criteria: ScreeningCriteria) => {
    setCampaigns(prevCampaigns =>
      prevCampaigns.map(campaign =>
        campaign.id === campaignId
          ? {
              ...campaign,
              screeningCriteria: criteria
            }
          : campaign
      )
    )
  }

  return (
    <CampaignContext.Provider value={{
      campaigns,
      currentCampaign,
      setCurrentCampaign,
      getCampaignById,
      createCampaign,
      addPatientToCampaign,
      updatePatientStatus,
      addTranscript,
      updateTranscript,
      deleteTranscript,
      updateScreeningCriteria,
    }}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  const context = useContext(CampaignContext)
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider')
  }
  return context
}