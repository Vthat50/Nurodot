"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

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
}

export interface Campaign {
  id: string
  studyId: string
  studyName: string
  name: string
  createdDate: string
  patients: CampaignPatient[]
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
  totalPatients: 1,
  contacted: 0,
  interested: 0,
  scheduled: 0,
  enrolled: 0
}

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  // Initialize campaigns from localStorage or use mock data
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('campaigns')
      if (stored) {
        return JSON.parse(stored)
      }
    }
    return [mockClarityADCampaign]
  })

  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null)

  // Persist campaigns to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('campaigns', JSON.stringify(campaigns))
    }
  }, [campaigns])

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

  return (
    <CampaignContext.Provider value={{
      campaigns,
      currentCampaign,
      setCurrentCampaign,
      getCampaignById,
      createCampaign,
      addPatientToCampaign,
      updatePatientStatus,
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