"use client"

import React, { createContext, useContext, useState } from 'react'

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

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null)

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