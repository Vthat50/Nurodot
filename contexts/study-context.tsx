"use client"

import React, { createContext, useContext, useState } from 'react'

export interface StudyCriteria {
  inclusion: Array<{
    id: number
    text: string
    field: string
    operator: string
    value: any
  }>
  exclusion: Array<{
    id: number
    text: string
    field: string
    operator: string
    value: any
  }>
  questions: string[]
}

export interface Study {
  id: string
  title: string
  description: string
  phase: string
  enrollmentTarget: number
  currentEnrollment: number
  protocolFile?: File
  criteria?: StudyCriteria
}

interface StudyContextType {
  studies: Study[]
  currentStudy: Study | null
  setCurrentStudy: (study: Study) => void
  createStudy: (study: Study) => void
  updateStudyCriteria: (studyId: string, protocolFile: File, criteria: StudyCriteria) => void
  updateStudyInfo: (studyId: string, updates: Partial<Study>) => void
}

const StudyContext = createContext<StudyContextType | undefined>(undefined)

// Mock studies that are already in the system
const mockStudies: Study[] = [
  {
    id: "CLARITY-AD",
    title: "CLARITY-AD",
    description: "A Study of Lecanemab in Early Alzheimer's Disease",
    phase: "Phase III",
    enrollmentTarget: 150,
    currentEnrollment: 45,
  },
  {
    id: "GRADUATE-I",
    title: "GRADUATE-I",
    description: "Gantenerumab in Prodromal Alzheimer's Disease",
    phase: "Phase III",
    enrollmentTarget: 200,
    currentEnrollment: 0,
  },
]

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [studies, setStudies] = useState<Study[]>(mockStudies)
  const [currentStudy, setCurrentStudy] = useState<Study | null>(null)

  const createStudy = (study: Study) => {
    setStudies(prev => [...prev, study])
    setCurrentStudy(study)
  }

  const updateStudyCriteria = (studyId: string, protocolFile: File, criteria: StudyCriteria) => {
    setStudies(prevStudies =>
      prevStudies.map(study =>
        study.id === studyId
          ? { ...study, protocolFile, criteria }
          : study
      )
    )

    if (currentStudy?.id === studyId) {
      setCurrentStudy({ ...currentStudy, protocolFile, criteria })
    }
  }

  const updateStudyInfo = (studyId: string, updates: Partial<Study>) => {
    setStudies(prevStudies =>
      prevStudies.map(study =>
        study.id === studyId
          ? { ...study, ...updates }
          : study
      )
    )

    if (currentStudy?.id === studyId) {
      setCurrentStudy({ ...currentStudy, ...updates })
    }
  }

  return (
    <StudyContext.Provider value={{
      studies,
      currentStudy,
      setCurrentStudy,
      createStudy,
      updateStudyCriteria,
      updateStudyInfo,
    }}>
      {children}
    </StudyContext.Provider>
  )
}

export function useStudy() {
  const context = useContext(StudyContext)
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider')
  }
  return context
}