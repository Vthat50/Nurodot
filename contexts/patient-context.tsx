"use client"

import React, { createContext, useContext, useState } from 'react'

export interface CallTranscript {
  id: string
  callDate: string
  callTime: string
  duration: string
  outcome: 'completed' | 'no_answer' | 'declined' | 'voicemail'
  messages: Array<{
    speaker: 'ai' | 'patient'
    text: string
    timestamp: string
  }>
  verbalConsentTimestamp?: string
  consentAudioUrl?: string
  visitScheduledDuringCall?: boolean
}

export interface EligibilityOverride {
  originalTag: string
  originalStatus: string
  newTag: string
  newStatus: string
  reason: string
  overriddenBy: string
  overriddenAt: string
}

export interface GeneratedDocument {
  id: string
  type: 'ICF' | 'eCRF' | 'Screening Log' | 'Medical History' | 'Adverse Event' | 'SAE Report' | 'Concomitant Medications' | 'Protocol Deviation' | 'Other'
  filename: string
  generatedDate: string
  generatedBy: string
  status: 'draft' | 'signed' | 'submitted'
  url: string // Mock download URL
  isManualUpload?: boolean
}

export interface CriterionMatch {
  criterionId: number
  criterionText: string
  type: 'inclusion' | 'exclusion'
  matched: boolean
  patientValue?: string
  source: 'EHR' | 'AI Call' | 'Manual'
  notes?: string
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: string
  phone: string
  email?: string
  conditions: string[]
  medications: string[]
  source: "EHR" | "CSV" | "Manual"
  eligibilityScore?: number

  // New tag and status system
  tag: "Match" | "Potential Match" | "Eligible" | "Ineligible"
  status: "Pending Review" | "AI Call Initiated" | "On-site visit scheduled" | "Declined Participation" | "Failed Screening" | "Enrolled"

  // Legacy status for backward compatibility
  legacyStatus?: "imported" | "calling" | "screened" | "qualified" | "not_qualified" | "enrolled"

  studyId: string

  // Extended demographic information (optional, for detailed profiles)
  dob?: string
  race?: string
  ethnicity?: string
  address?: string

  // Clinical data (optional)
  cognitiveAssessments?: any
  labResults?: any[]
  imaging?: any[]
  vitalSigns?: any
  visitHistory?: any[]
  studyPartner?: any
  eligibilityNotes?: string
  lastContactDate?: string

  // Criterion matching
  criteriaMatches?: CriterionMatch[]

  // Call history
  callHistory?: CallTranscript[]

  // Consent and scheduling
  verbalConsentTimestamp?: string
  consentAudioUrl?: string
  visitScheduledDate?: string
  visitScheduledTime?: string
  visitSchedulingTimestamp?: string
  visitConfirmationStatus?: 'pending' | 'confirmed' | 'reminder_sent'

  // Override tracking
  eligibilityOverride?: EligibilityOverride

  // Generated documents
  generatedDocuments?: GeneratedDocument[]
}

interface PatientContextType {
  patients: Patient[]
  addPatients: (patients: Patient[]) => void
  updatePatient: (id: string, updates: Partial<Patient>) => void
  getPatientsByStudy: (studyId: string) => Patient[]
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

// Mock patients for CLARITY-AD study
const mockClarityADPatients: Patient[] = [
  {
    id: 'CLR-001',
    name: 'Margaret Thompson',
    age: 68,
    gender: 'Female',
    phone: '(555) 234-5678',
    email: 'margaret.t@email.com',
    conditions: ['Mild Cognitive Impairment', 'Hypertension'],
    medications: ['Lisinopril 10mg', 'Aspirin 81mg'],
    source: 'EHR',
    studyId: 'CLARITY-AD',
    tag: 'Eligible',
    status: 'On-site visit scheduled',
    legacyStatus: 'qualified',
    verbalConsentTimestamp: '2025-09-25T14:34:22Z',
    visitScheduledDate: '2025-10-05',
    visitScheduledTime: '09:00 AM',
    visitSchedulingTimestamp: '2025-09-25T14:45:00Z',
    visitConfirmationStatus: 'confirmed',
    generatedDocuments: [
      {
        id: 'doc-001',
        type: 'ICF',
        filename: 'ICF_CLR-001_Thompson_2025-09-25.pdf',
        generatedDate: '2025-09-25T15:30:00Z',
        generatedBy: 'Dr. Sarah Chen',
        status: 'draft',
        url: '/mock/documents/icf-clr-001.pdf'
      },
      {
        id: 'doc-002',
        type: 'eCRF',
        filename: 'eCRF_CLR-001_Thompson_2025-09-25.pdf',
        generatedDate: '2025-09-25T15:35:00Z',
        generatedBy: 'Dr. Sarah Chen',
        status: 'draft',
        url: '/mock/documents/ecrf-clr-001.pdf'
      }
    ],
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-85 years inclusive', type: 'inclusion', matched: true, patientValue: '68 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'MMSE score 18-26 (mild to moderate)', type: 'inclusion', matched: false, patientValue: 'MMSE: 28', source: 'EHR', notes: 'Score above threshold for mild to moderate impairment' },
      { criterionId: 3, criterionText: 'Positive amyloid status', type: 'inclusion', matched: true, patientValue: 'PET positive', source: 'EHR' },
      { criterionId: 4, criterionText: 'No history of seizures', type: 'exclusion', matched: true, patientValue: 'No seizure history', source: 'EHR' },
      { criterionId: 5, criterionText: 'Willing to have study partner', type: 'inclusion', matched: true, patientValue: 'Confirmed (daughter)', source: 'AI Call' },
    ],
    callHistory: [{
      id: 'call-001',
      callDate: '2025-09-25',
      callTime: '14:30',
      duration: '28:45',
      outcome: 'completed',
      verbalConsentTimestamp: '2025-09-25T14:37:30Z',
      visitScheduledDuringCall: true,
      messages: [
        { speaker: 'ai', text: 'Hello, this is Matt on behalf of Insight Clinical Research site. Is this Margaret Thompson speaking?', timestamp: '14:30:00' },
        { speaker: 'patient', text: 'Yes, this is Margaret.', timestamp: '14:30:05' },
        { speaker: 'ai', text: 'Hi Margaret, I\'m calling because you\'ve previously expressed interest in participating in clinical research for mild cognitive impairment. We\'re currently recruiting for a study involving a potential treatment.', timestamp: '14:30:08' },
        { speaker: 'patient', text: 'Oh yes, I remember filling out that form online. I\'ve been curious about it.', timestamp: '14:30:20' },
        { speaker: 'ai', text: 'That\'s wonderful that you remember! Just to let you know, this call is automated and being recorded for quality and training purposes. I won\'t be able to provide any medical advice. Is now a good time to spend about 20-30 minutes to see if you might be a good match for the study?', timestamp: '14:30:25' },
        { speaker: 'patient', text: 'Yes, now is perfect. I just made myself some tea and was sitting down.', timestamp: '14:30:40' },
        { speaker: 'ai', text: 'That sounds lovely! Tea is always a good idea. Before we dive into some questions, do you have any initial questions about the study, like what it involves or compensation?', timestamp: '14:30:45' },
        { speaker: 'patient', text: 'Well, I am curious about the compensation. And how often would I need to come in?', timestamp: '14:30:55' },
        { speaker: 'ai', text: 'Of course, those are great questions. For this study, you\'ll be compensated up to $300 per in-person visit, $50 per telephone call, and reimbursed for travel. The study lasts about 18 months with at least 10-12 in-person visits and several phone check-ins. Does that work with your schedule?', timestamp: '14:31:00' },
        { speaker: 'patient', text: 'Oh, that\'s quite generous! Yes, I think I could manage that. I\'m retired so I have more flexibility now.', timestamp: '14:31:25' },
        { speaker: 'ai', text: 'That\'s great to hear! Retirement definitely helps with flexibility. Now, I need to confirm some of your contact information and basic details. Can you please confirm your date of birth?', timestamp: '14:31:35' },
        { speaker: 'patient', text: 'March 15th, 1957.', timestamp: '14:31:48' },
        { speaker: 'ai', text: 'So, your date of birth is March 15th, 1957. Is that correct?', timestamp: '14:31:52' },
        { speaker: 'patient', text: 'Yes, that\'s right.', timestamp: '14:31:58' },
        { speaker: 'ai', text: 'Perfect, thank you. Now, do you have a confirmed diagnosis of mild cognitive impairment? If yes, when were you diagnosed and by whom?', timestamp: '14:32:02' },
        { speaker: 'patient', text: 'Yes, I was diagnosed about two years ago by my neurologist, Dr. Chen. I started noticing I was forgetting things more often.', timestamp: '14:32:15' },
        { speaker: 'ai', text: 'I appreciate you sharing that, Margaret. It can be difficult to talk about. Can you describe any memory problems or cognitive changes you\'ve experienced? For example, forgetting recent events or conversations?', timestamp: '14:32:30' },
        { speaker: 'patient', text: 'Well, mostly I forget where I put things, like my keys or my phone. And sometimes I forget if I\'ve already told someone something, so I might repeat myself. My daughter notices it more than I do, honestly.', timestamp: '14:32:45' },
        { speaker: 'ai', text: 'Thank you for being so open about that. It\'s actually really common for family members to notice these things. Speaking of your daughter, do you have a reliable study partner, like a family member or friend, who knows about your daily activities and can accompany you to some visits and answer questions?', timestamp: '14:33:05' },
        { speaker: 'patient', text: 'Yes, my daughter Sarah would definitely be willing to help. She lives just 10 minutes away and we see each other several times a week.', timestamp: '14:33:25' },
        { speaker: 'ai', text: 'That\'s wonderful that you have Sarah close by. Having that support system is so important. Now, have you had a Mini-Mental State Examination, or MMSE test recently? If yes, do you recall your score?', timestamp: '14:33:35' },
        { speaker: 'patient', text: 'I think I had one at my last appointment. I don\'t remember the exact number, but Dr. Chen said it showed mild impairment.', timestamp: '14:33:50' },
        { speaker: 'ai', text: 'That\'s helpful to know. We\'ll verify the exact score from your medical records. Are you currently receiving any treatment or medications for cognitive symptoms? If yes, what medication, dosage, and how long have you been on a stable regimen?', timestamp: '14:34:00' },
        { speaker: 'patient', text: 'I\'m not on anything specifically for the memory issues yet. Just my blood pressure medication.', timestamp: '14:34:18' },
        { speaker: 'ai', text: 'I understand. Now I\'d like to understand your medical history a bit better. What medications are you currently taking? This includes prescriptions, over-the-counter meds, vitamins, or supplements.', timestamp: '14:34:25' },
        { speaker: 'patient', text: 'I take Lisinopril for blood pressure, that\'s 10 milligrams once a day. And I take a baby aspirin, 81 milligrams. Oh, and vitamin D supplements.', timestamp: '14:34:40' },
        { speaker: 'ai', text: 'Thank you for being so thorough. So just to confirm - Lisinopril 10mg once daily, aspirin 81mg, and vitamin D. When did you start the blood pressure medication?', timestamp: '14:35:00' },
        { speaker: 'patient', text: 'About five years ago, I think. It\'s been pretty stable.', timestamp: '14:35:12' },
        { speaker: 'ai', text: 'Good to know it\'s been stable. Do you have any allergies? If yes, what causes the reaction and how severe is it?', timestamp: '14:35:18' },
        { speaker: 'patient', text: 'I\'m allergic to penicillin. I get a rash if I take it. It\'s not life-threatening or anything, but I avoid it.', timestamp: '14:35:30' },
        { speaker: 'ai', text: 'That\'s important information, thank you. We\'ll make sure that\'s noted. Do you smoke or vape?', timestamp: '14:35:42' },
        { speaker: 'patient', text: 'No, I quit smoking about 20 years ago. Best decision I ever made!', timestamp: '14:35:50' },
        { speaker: 'ai', text: 'Congratulations on quitting! That is a huge accomplishment. Now, do you have any active psychiatric conditions, such as ongoing severe depression, anxiety, or other mental health issues requiring treatment?', timestamp: '14:35:55' },
        { speaker: 'patient', text: 'No, nothing like that. I mean, I get a little anxious sometimes, but who doesn\'t? Nothing I\'m being treated for.', timestamp: '14:36:10' },
        { speaker: 'ai', text: 'That makes sense. A little anxiety is certainly normal. Have you participated in any other clinical studies recently, say within the past 6 months?', timestamp: '14:36:22' },
        { speaker: 'patient', text: 'No, this would be my first one.', timestamp: '14:36:32' },
        { speaker: 'ai', text: 'Wonderful. Based on everything you\'ve shared with me today, Margaret, it sounds like you could be a really good match for the CLARITY-AD study. Your cognitive impairment is at the level we\'re looking for, you have great support from your daughter, and your overall health looks good. Would you be interested in moving forward?', timestamp: '14:36:38' },
        { speaker: 'patient', text: 'Yes, I think I would be. It would be nice to feel like I\'m contributing to research that might help others like me.', timestamp: '14:37:00' },
        { speaker: 'ai', text: 'That\'s such a generous way to think about it. Your participation really could make a difference for future treatments. Now, to proceed, I\'ll need your verbal consent. This means you agree to participate in the CLARITY-AD clinical trial. Do you consent to participate?', timestamp: '14:37:10' },
        { speaker: 'patient', text: 'Yes, I consent to participate.', timestamp: '14:37:30' },
        { speaker: 'ai', text: 'Thank you so much, Margaret. Your consent has been recorded. Now, let\'s get you scheduled for your first on-site visit. Are you available on October 5th at 9 AM?', timestamp: '14:37:35' },
        { speaker: 'patient', text: 'Let me check my calendar... yes, October 5th works great!', timestamp: '14:37:50' },
        { speaker: 'ai', text: 'Perfect! You\'re all set for October 5th at 9 AM. You\'ll receive a confirmation email within the next hour with all the details, including the address and what to bring. Is there anything else you\'d like to know before we wrap up?', timestamp: '14:38:00' },
        { speaker: 'patient', text: 'Should I bring my daughter to this first visit?', timestamp: '14:38:18' },
        { speaker: 'ai', text: 'That\'s a great question! Yes, it would actually be very helpful to have Sarah there for the first visit. We\'ll want to meet her and get some information from her perspective as well.', timestamp: '14:38:25' },
        { speaker: 'patient', text: 'Okay, wonderful. I\'ll let her know. Thank you so much for your time, Matt.', timestamp: '14:38:42' },
        { speaker: 'ai', text: 'You\'re very welcome, Margaret. Thank you for your interest and your time today. We\'ll see you on October 5th. Have a great rest of your day!', timestamp: '14:38:50' },
        { speaker: 'patient', text: 'You too! Goodbye!', timestamp: '14:39:00' },
      ]
    }]
  },
  {
    id: 'CLR-002',
    name: 'Robert Chen',
    age: 72,
    gender: 'Male',
    phone: '(555) 345-6789',
    email: 'robert.chen@email.com',
    conditions: ['Alzheimer\'s Disease - Early Stage', 'Type 2 Diabetes'],
    medications: ['Donepezil 10mg', 'Metformin 1000mg'],
    source: 'EHR',
    studyId: 'CLARITY-AD',
    tag: 'Eligible',
    status: 'AI Call Initiated',
    legacyStatus: 'calling',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-85 years inclusive', type: 'inclusion', matched: true, patientValue: '72 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'MMSE score 18-26 (mild to moderate)', type: 'inclusion', matched: true, patientValue: 'MMSE: 24', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid status', type: 'inclusion', matched: true, patientValue: 'CSF positive', source: 'EHR' },
      { criterionId: 4, criterionText: 'No history of seizures', type: 'exclusion', matched: true, patientValue: 'No seizure history', source: 'EHR' },
    ],
  },
  {
    id: 'CLR-003',
    name: 'Patricia Williams',
    age: 65,
    gender: 'Female',
    phone: '(555) 456-7890',
    email: 'patricia.w@email.com',
    conditions: ['Mild Cognitive Impairment'],
    medications: ['Vitamin D 2000IU', 'Omega-3'],
    source: 'EHR',
    studyId: 'CLARITY-AD',
    tag: 'Match',
    status: 'Pending Review',
    legacyStatus: 'qualified',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-85 years inclusive', type: 'inclusion', matched: true, patientValue: '65 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'MMSE score 18-26 (mild to moderate)', type: 'inclusion', matched: true, patientValue: 'MMSE: 25', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid status', type: 'inclusion', matched: true, patientValue: 'Pending PET scan', source: 'EHR', notes: 'Scheduled for next week' },
    ],
  },
  {
    id: 'CLR-004',
    name: 'James Rodriguez',
    age: 58,
    gender: 'Male',
    phone: '(555) 567-8901',
    email: 'james.r@email.com',
    conditions: ['Mild Cognitive Impairment', 'Seizure Disorder'],
    medications: ['Levetiracetam 500mg'],
    source: 'EHR',
    studyId: 'CLARITY-AD',
    tag: 'Ineligible',
    status: 'Failed Screening',
    legacyStatus: 'not_qualified',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-85 years inclusive', type: 'inclusion', matched: true, patientValue: '58 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'MMSE score 18-26 (mild to moderate)', type: 'inclusion', matched: true, patientValue: 'MMSE: 23', source: 'EHR' },
      { criterionId: 4, criterionText: 'No history of seizures', type: 'exclusion', matched: false, patientValue: 'Active seizure disorder', source: 'EHR', notes: 'Screen failure due to exclusion criterion' },
    ],
    callHistory: [{
      id: 'call-004',
      callDate: '2025-09-24',
      callTime: '10:15',
      duration: '8:45',
      outcome: 'completed',
      messages: [
        { speaker: 'ai', text: 'Hello, is this James Rodriguez?', timestamp: '10:15:00' },
        { speaker: 'patient', text: 'Yes, speaking.', timestamp: '10:15:04' },
        { speaker: 'ai', text: 'Hi James, I\'m calling about the CLARITY-AD Alzheimer\'s study. I need to verify some medical information. Do you have a history of seizures?', timestamp: '10:15:08' },
        { speaker: 'patient', text: 'Yes, I do. I take medication for that.', timestamp: '10:15:18' },
        { speaker: 'ai', text: 'I understand. Unfortunately, having a seizure disorder is an exclusion criterion for this particular study. You would not be eligible to participate at this time.', timestamp: '10:15:25' },
        { speaker: 'patient', text: 'Oh, I see. That\'s disappointing, but I understand.', timestamp: '10:15:35' },
        { speaker: 'ai', text: 'I\'m sorry we can\'t include you in this study. We\'ll keep your information on file in case other studies become available that you might be eligible for.', timestamp: '10:15:40' },
      ]
    }]
  },
  {
    id: 'CLR-005',
    name: 'Linda Martinez',
    age: 70,
    gender: 'Female',
    phone: '(555) 678-9012',
    email: 'linda.m@email.com',
    conditions: ['Early Alzheimer\'s Disease'],
    medications: ['Donepezil 5mg'],
    source: 'EHR',
    studyId: 'CLARITY-AD',
    tag: 'Ineligible',
    status: 'Declined Participation',
    legacyStatus: 'not_qualified',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-85 years inclusive', type: 'inclusion', matched: true, patientValue: '70 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'MMSE score 18-26 (mild to moderate)', type: 'inclusion', matched: true, patientValue: 'MMSE: 21', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid status', type: 'inclusion', matched: true, patientValue: 'PET positive', source: 'EHR' },
    ],
    callHistory: [{
      id: 'call-005',
      callDate: '2025-09-26',
      callTime: '15:00',
      duration: '12:10',
      outcome: 'completed',
      messages: [
        { speaker: 'ai', text: 'Hello, may I speak with Linda Martinez?', timestamp: '15:00:00' },
        { speaker: 'patient', text: 'This is Linda.', timestamp: '15:00:04' },
        { speaker: 'ai', text: 'Hi Linda, I\'m calling about the CLARITY-AD clinical trial. Based on your medical records, you appear to be eligible. Would you be interested in learning more?', timestamp: '15:00:08' },
        { speaker: 'patient', text: 'I\'ve been thinking about it, but I\'m not sure. What would it involve?', timestamp: '15:00:20' },
        { speaker: 'ai', text: 'The study involves monthly visits to our clinic, an investigational medication, and regular cognitive assessments. The study lasts 18 months.', timestamp: '15:00:30' },
        { speaker: 'patient', text: 'That sounds like a lot of time commitment. I travel quite a bit to visit my grandchildren.', timestamp: '15:00:45' },
        { speaker: 'ai', text: 'I understand. The time commitment is significant. Would you like some time to think about it?', timestamp: '15:00:55' },
        { speaker: 'patient', text: 'I appreciate the call, but I don\'t think I can commit to that right now. Maybe in the future.', timestamp: '15:01:05' },
        { speaker: 'ai', text: 'I completely understand, Linda. We\'ll keep your information on file in case you change your mind. Is that okay?', timestamp: '15:01:15' },
        { speaker: 'patient', text: 'Yes, that\'s fine. Thank you.', timestamp: '15:01:25' },
      ]
    }]
  },
]

// Mock patients for GRADUATE-I study
const mockGraduateIPatients: Patient[] = [
  {
    id: 'GRAD-001',
    name: 'Elizabeth Anderson',
    age: 63,
    gender: 'Female',
    phone: '(555) 789-0123',
    email: 'elizabeth.a@email.com',
    conditions: ['Prodromal Alzheimer\'s Disease', 'Hypertension'],
    medications: ['Amlodipine 5mg', 'Atorvastatin 20mg'],
    source: 'EHR',
    studyId: 'GRADUATE-I',
    tag: 'Eligible',
    status: 'On-site visit scheduled',
    legacyStatus: 'qualified',
    verbalConsentTimestamp: '2025-09-26T10:15:00Z',
    visitScheduledDate: '2025-10-08',
    visitScheduledTime: '10:30 AM',
    visitSchedulingTimestamp: '2025-09-26T10:25:00Z',
    visitConfirmationStatus: 'confirmed',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-90 years inclusive', type: 'inclusion', matched: true, patientValue: '63 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'CDR score 0.5 (prodromal)', type: 'inclusion', matched: true, patientValue: 'CDR: 0.5', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid biomarker', type: 'inclusion', matched: true, patientValue: 'PET positive', source: 'EHR' },
      { criterionId: 4, criterionText: 'No cancer within 5 years', type: 'exclusion', matched: true, patientValue: 'No cancer history', source: 'EHR' },
    ],
    callHistory: [{
      id: 'call-grad-001',
      callDate: '2025-09-26',
      callTime: '10:00',
      duration: '22:15',
      outcome: 'completed',
      verbalConsentTimestamp: '2025-09-26T10:15:00Z',
      visitScheduledDuringCall: true,
      messages: [
        { speaker: 'ai', text: 'Hello, is this Elizabeth Anderson?', timestamp: '10:00:00' },
        { speaker: 'patient', text: 'Yes, this is Elizabeth speaking.', timestamp: '10:00:05' },
        { speaker: 'ai', text: 'Hi Elizabeth, I\'m calling about the GRADUATE-I study for prodromal Alzheimer\'s. Based on your medical records, you may be eligible. Is now a good time to talk?', timestamp: '10:00:10' },
        { speaker: 'patient', text: 'Yes, I have time. I\'ve been interested in participating in research.', timestamp: '10:00:25' },
        { speaker: 'ai', text: 'That\'s wonderful! Let me ask you a few screening questions. Do you have a confirmed diagnosis of prodromal Alzheimer\'s disease?', timestamp: '10:00:35' },
        { speaker: 'patient', text: 'Yes, my neurologist diagnosed me about a year ago. My memory has been declining gradually.', timestamp: '10:00:50' },
        { speaker: 'ai', text: 'I understand. Have you had an amyloid PET scan or CSF test that showed positive results?', timestamp: '10:01:05' },
        { speaker: 'patient', text: 'Yes, I had a PET scan last year and it was positive for amyloid.', timestamp: '10:01:15' },
        { speaker: 'ai', text: 'Good. Based on your answers, you appear to be a strong candidate for this study. Would you be interested in scheduling a screening visit?', timestamp: '10:01:30' },
        { speaker: 'patient', text: 'Yes, I would like to move forward with this.', timestamp: '10:01:45' },
        { speaker: 'ai', text: 'Excellent. I need your verbal consent to participate. Do you consent to participate in the GRADUATE-I study?', timestamp: '10:02:00' },
        { speaker: 'patient', text: 'Yes, I consent to participate.', timestamp: '10:15:00' },
        { speaker: 'ai', text: 'Thank you, Elizabeth. Your consent has been recorded. Let\'s schedule your screening visit for October 8th at 10:30 AM. Does that work for you?', timestamp: '10:15:10' },
        { speaker: 'patient', text: 'Yes, that works perfectly.', timestamp: '10:15:25' },
      ]
    }]
  },
  {
    id: 'GRAD-002',
    name: 'Michael O\'Brien',
    age: 71,
    gender: 'Male',
    phone: '(555) 890-1234',
    email: 'michael.ob@email.com',
    conditions: ['Prodromal Alzheimer\'s Disease', 'Type 2 Diabetes'],
    medications: ['Metformin 1000mg', 'Glipizide 5mg'],
    source: 'EHR',
    studyId: 'GRADUATE-I',
    tag: 'Match',
    status: 'AI Call Initiated',
    legacyStatus: 'calling',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-90 years inclusive', type: 'inclusion', matched: true, patientValue: '71 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'CDR score 0.5 (prodromal)', type: 'inclusion', matched: true, patientValue: 'CDR: 0.5', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid biomarker', type: 'inclusion', matched: true, patientValue: 'CSF positive', source: 'EHR' },
    ],
    callHistory: [{
      id: 'call-grad-002',
      callDate: '2025-09-27',
      callTime: '14:00',
      duration: '18:30',
      outcome: 'completed',
      messages: [
        { speaker: 'ai', text: 'Hello, is this Michael O\'Brien?', timestamp: '14:00:00' },
        { speaker: 'patient', text: 'Yes, this is Michael.', timestamp: '14:00:04' },
        { speaker: 'ai', text: 'Hi Michael, I\'m calling about the GRADUATE-I clinical trial for prodromal Alzheimer\'s disease. Do you have a few minutes to discuss this?', timestamp: '14:00:08' },
        { speaker: 'patient', text: 'Sure, I can talk now.', timestamp: '14:00:20' },
        { speaker: 'ai', text: 'Great! I see you have a diagnosis of prodromal Alzheimer\'s and your CSF test was positive for amyloid. Is that correct?', timestamp: '14:00:25' },
        { speaker: 'patient', text: 'Yes, that\'s right. My doctor told me about that a few months ago.', timestamp: '14:00:40' },
        { speaker: 'ai', text: 'Thank you for confirming. You appear to be a good match for this study. Are you interested in learning more about participating?', timestamp: '14:00:50' },
        { speaker: 'patient', text: 'Yes, I\'d like to hear more about it.', timestamp: '14:01:00' },
      ]
    }]
  },
  {
    id: 'GRAD-003',
    name: 'Susan Davis',
    age: 68,
    gender: 'Female',
    phone: '(555) 901-2345',
    email: 'susan.davis@email.com',
    conditions: ['Mild Cognitive Impairment'],
    medications: ['Donepezil 5mg', 'Vitamin B12'],
    source: 'EHR',
    studyId: 'GRADUATE-I',
    tag: 'Potential Match',
    status: 'No Answer',
    legacyStatus: 'imported',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-90 years inclusive', type: 'inclusion', matched: true, patientValue: '68 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'CDR score 0.5 (prodromal)', type: 'inclusion', matched: true, patientValue: 'CDR: 0.5', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid biomarker', type: 'inclusion', matched: false, patientValue: 'Pending CSF test', source: 'EHR', notes: 'Awaiting biomarker confirmation' },
    ],
    callHistory: [{
      id: 'call-grad-003',
      callDate: '2025-09-28',
      callTime: '09:00',
      duration: '0:00',
      outcome: 'no_answer',
      messages: []
    }]
  },
  {
    id: 'GRAD-004',
    name: 'David Kim',
    age: 75,
    gender: 'Male',
    phone: '(555) 012-3456',
    email: 'david.kim@email.com',
    conditions: ['Mild Cognitive Impairment', 'Atrial Fibrillation'],
    medications: ['Warfarin 5mg', 'Metoprolol 50mg'],
    source: 'EHR',
    studyId: 'GRADUATE-I',
    tag: 'Match',
    status: 'Pending Review',
    legacyStatus: 'qualified',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-90 years inclusive', type: 'inclusion', matched: true, patientValue: '75 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'CDR score 0.5 (prodromal)', type: 'inclusion', matched: true, patientValue: 'CDR: 0.5', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid biomarker', type: 'inclusion', matched: true, patientValue: 'PET positive', source: 'EHR' },
    ],
    callHistory: [{
      id: 'call-grad-004',
      callDate: '2025-09-28',
      callTime: '11:15',
      duration: '15:45',
      outcome: 'completed',
      messages: [
        { speaker: 'ai', text: 'Hello, may I speak with David Kim?', timestamp: '11:15:00' },
        { speaker: 'patient', text: 'This is David.', timestamp: '11:15:05' },
        { speaker: 'ai', text: 'Hi David, I\'m calling about the GRADUATE-I research study. You may qualify based on your medical records. Do you have time to talk?', timestamp: '11:15:10' },
        { speaker: 'patient', text: 'Yes, I can talk for a bit.', timestamp: '11:15:25' },
        { speaker: 'ai', text: 'Perfect. I see you have mild cognitive impairment and a positive amyloid PET scan. Is that information correct?', timestamp: '11:15:30' },
        { speaker: 'patient', text: 'Yes, that\'s correct. I had the scan done earlier this year.', timestamp: '11:15:45' },
        { speaker: 'ai', text: 'Great. You appear to meet the criteria for this study. Would you be interested in participating?', timestamp: '11:16:00' },
        { speaker: 'patient', text: 'I\'m interested, but I need to discuss it with my family first.', timestamp: '11:16:15' },
        { speaker: 'ai', text: 'That\'s completely understandable. I\'ll mark you as interested and we can follow up after you\'ve had a chance to discuss with your family.', timestamp: '11:16:30' },
      ]
    }]
  },
  {
    id: 'GRAD-005',
    name: 'Barbara Wilson',
    age: 66,
    gender: 'Female',
    phone: '(555) 123-4567',
    email: 'barbara.w@email.com',
    conditions: ['Prodromal Alzheimer\'s Disease'],
    medications: ['None'],
    source: 'EHR',
    studyId: 'GRADUATE-I',
    tag: 'Eligible',
    status: 'Voicemail Left',
    legacyStatus: 'qualified',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-90 years inclusive', type: 'inclusion', matched: true, patientValue: '66 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'CDR score 0.5 (prodromal)', type: 'inclusion', matched: true, patientValue: 'CDR: 0.5', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid biomarker', type: 'inclusion', matched: true, patientValue: 'PET positive', source: 'EHR' },
      { criterionId: 4, criterionText: 'No cancer within 5 years', type: 'exclusion', matched: true, patientValue: 'No cancer history', source: 'EHR' },
    ],
    callHistory: [{
      id: 'call-grad-005',
      callDate: '2025-09-29',
      callTime: '08:30',
      duration: '0:00',
      outcome: 'voicemail',
      messages: []
    }]
  },
  {
    id: 'GRAD-006',
    name: 'Thomas Lee',
    age: 59,
    gender: 'Male',
    phone: '(555) 234-5678',
    email: 'thomas.lee@email.com',
    conditions: ['Mild Cognitive Impairment', 'Prostate Cancer (treated 2023)'],
    medications: ['Abiraterone 250mg'],
    source: 'EHR',
    studyId: 'GRADUATE-I',
    tag: 'Ineligible',
    status: 'Failed Screening',
    legacyStatus: 'not_qualified',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-90 years inclusive', type: 'inclusion', matched: true, patientValue: '59 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'CDR score 0.5 (prodromal)', type: 'inclusion', matched: true, patientValue: 'CDR: 0.5', source: 'EHR' },
      { criterionId: 4, criterionText: 'No cancer within 5 years', type: 'exclusion', matched: false, patientValue: 'Prostate cancer 2023', source: 'EHR', notes: 'Exclusion: Recent cancer history' },
    ],
    callHistory: [{
      id: 'call-grad-006',
      callDate: '2025-09-27',
      callTime: '16:00',
      duration: '9:20',
      outcome: 'completed',
      messages: [
        { speaker: 'ai', text: 'Hello, is this Thomas Lee?', timestamp: '16:00:00' },
        { speaker: 'patient', text: 'Yes, speaking.', timestamp: '16:00:04' },
        { speaker: 'ai', text: 'Hi Thomas, I\'m calling about the GRADUATE-I study. I need to verify some medical history. Have you had cancer within the past 5 years?', timestamp: '16:00:08' },
        { speaker: 'patient', text: 'Yes, I was treated for prostate cancer in 2023.', timestamp: '16:00:20' },
        { speaker: 'ai', text: 'Thank you for letting me know. Unfortunately, recent cancer treatment is an exclusion criterion for this study, so you would not be eligible at this time.', timestamp: '16:00:30' },
        { speaker: 'patient', text: 'I understand. Thanks for letting me know.', timestamp: '16:00:45' },
      ]
    }]
  },
  {
    id: 'GRAD-007',
    name: 'Nancy Johnson',
    age: 64,
    gender: 'Female',
    phone: '(555) 345-6789',
    email: 'nancy.j@email.com',
    conditions: ['Prodromal Alzheimer\'s Disease', 'Depression'],
    medications: ['Sertraline 50mg', 'Vitamin D'],
    source: 'EHR',
    studyId: 'GRADUATE-I',
    tag: 'Potential Match',
    status: 'Declined Participation',
    legacyStatus: 'imported',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-90 years inclusive', type: 'inclusion', matched: true, patientValue: '64 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'CDR score 0.5 (prodromal)', type: 'inclusion', matched: true, patientValue: 'CDR: 0.5', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid biomarker', type: 'inclusion', matched: true, patientValue: 'CSF positive', source: 'EHR' },
      { criterionId: 5, criterionText: 'Stable psychiatric condition', type: 'inclusion', matched: true, patientValue: 'Depression stable on medication >6 months', source: 'EHR', notes: 'Review psychiatric stability' },
    ],
    callHistory: [{
      id: 'call-grad-007',
      callDate: '2025-09-27',
      callTime: '15:45',
      duration: '6:30',
      outcome: 'declined',
      messages: [
        { speaker: 'ai', text: 'Hello, is this Nancy Johnson?', timestamp: '15:45:00' },
        { speaker: 'patient', text: 'Yes, this is Nancy.', timestamp: '15:45:05' },
        { speaker: 'ai', text: 'Hi Nancy, I\'m calling about the GRADUATE-I clinical trial. Based on your records, you may be eligible. Would you like to hear more?', timestamp: '15:45:10' },
        { speaker: 'patient', text: 'I appreciate you calling, but I\'m not interested in participating in a clinical trial at this time.', timestamp: '15:45:30' },
        { speaker: 'ai', text: 'I understand completely. May I ask if there\'s a particular reason, just for our records?', timestamp: '15:45:45' },
        { speaker: 'patient', text: 'I just don\'t feel comfortable with it right now. Maybe in the future.', timestamp: '15:46:00' },
        { speaker: 'ai', text: 'That\'s perfectly fine, Nancy. We\'ll keep your information on file in case you change your mind. Thank you for your time.', timestamp: '15:46:15' },
      ]
    }]
  },
  {
    id: 'GRAD-008',
    name: 'Charles Brown',
    age: 77,
    gender: 'Male',
    phone: '(555) 456-7890',
    email: 'charles.b@email.com',
    conditions: ['Prodromal Alzheimer\'s Disease', 'COPD'],
    medications: ['Albuterol inhaler', 'Tiotropium inhaler'],
    source: 'EHR',
    studyId: 'GRADUATE-I',
    tag: 'Match',
    status: 'Pending Review',
    legacyStatus: 'qualified',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-90 years inclusive', type: 'inclusion', matched: true, patientValue: '77 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'CDR score 0.5 (prodromal)', type: 'inclusion', matched: true, patientValue: 'CDR: 0.5', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid biomarker', type: 'inclusion', matched: true, patientValue: 'PET positive', source: 'EHR' },
    ],
    callHistory: [{
      id: 'call-grad-008',
      callDate: '2025-09-29',
      callTime: '13:30',
      duration: '20:10',
      outcome: 'completed',
      messages: [
        { speaker: 'ai', text: 'Hello, is this Charles Brown?', timestamp: '13:30:00' },
        { speaker: 'patient', text: 'Yes, this is Charles.', timestamp: '13:30:05' },
        { speaker: 'ai', text: 'Hi Charles, I\'m calling about the GRADUATE-I clinical trial for prodromal Alzheimer\'s. Based on your records, you may be eligible. Do you have time to discuss?', timestamp: '13:30:10' },
        { speaker: 'patient', text: 'Sure, I have some time now.', timestamp: '13:30:25' },
        { speaker: 'ai', text: 'Excellent. I see you have a positive amyloid PET scan and a CDR score of 0.5. Is that correct?', timestamp: '13:30:30' },
        { speaker: 'patient', text: 'Yes, my doctor explained all of that to me. I\'ve been noticing some memory issues.', timestamp: '13:30:45' },
        { speaker: 'ai', text: 'I understand. You appear to be a good candidate for this study. Are you interested in participating?', timestamp: '13:31:00' },
        { speaker: 'patient', text: 'Yes, I think so. I want to help with the research.', timestamp: '13:31:15' },
      ]
    }]
  },
  {
    id: 'GRAD-009',
    name: 'Helen Martinez',
    age: 69,
    gender: 'Female',
    phone: '(555) 567-8901',
    email: 'helen.m@email.com',
    conditions: ['Prodromal Alzheimer\'s Disease'],
    medications: ['Aricept 5mg'],
    source: 'EHR',
    studyId: 'GRADUATE-I',
    tag: 'Match',
    status: 'No Answer',
    legacyStatus: 'imported',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-90 years inclusive', type: 'inclusion', matched: true, patientValue: '69 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'CDR score 0.5 (prodromal)', type: 'inclusion', matched: true, patientValue: 'CDR: 0.5', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid biomarker', type: 'inclusion', matched: true, patientValue: 'PET positive', source: 'EHR' },
    ],
    callHistory: [{
      id: 'call-grad-009',
      callDate: '2025-09-29',
      callTime: '17:00',
      duration: '0:00',
      outcome: 'no_answer',
      messages: []
    }]
  },
  {
    id: 'GRAD-010',
    name: 'Richard Taylor',
    age: 73,
    gender: 'Male',
    phone: '(555) 678-9012',
    email: 'richard.t@email.com',
    conditions: ['Prodromal Alzheimer\'s Disease', 'Hypertension'],
    medications: ['Lisinopril 20mg'],
    source: 'EHR',
    studyId: 'GRADUATE-I',
    tag: 'Potential Match',
    status: 'Voicemail Left',
    legacyStatus: 'imported',
    criteriaMatches: [
      { criterionId: 1, criterionText: 'Age 50-90 years inclusive', type: 'inclusion', matched: true, patientValue: '73 years', source: 'EHR' },
      { criterionId: 2, criterionText: 'CDR score 0.5 (prodromal)', type: 'inclusion', matched: true, patientValue: 'CDR: 0.5', source: 'EHR' },
      { criterionId: 3, criterionText: 'Positive amyloid biomarker', type: 'inclusion', matched: true, patientValue: 'CSF positive', source: 'EHR' },
    ],
    callHistory: [{
      id: 'call-grad-010',
      callDate: '2025-09-28',
      callTime: '19:30',
      duration: '0:00',
      outcome: 'voicemail',
      messages: []
    }]
  },
]

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([...mockClarityADPatients, ...mockGraduateIPatients])

  const addPatients = (newPatients: Patient[]) => {
    setPatients(prev => [...prev, ...newPatients])
  }

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const getPatientsByStudy = (studyId: string) => {
    return patients.filter(p => p.studyId === studyId)
  }

  return (
    <PatientContext.Provider value={{
      patients,
      addPatients,
      updatePatient,
      getPatientsByStudy,
    }}>
      {children}
    </PatientContext.Provider>
  )
}

export function usePatients() {
  const context = useContext(PatientContext)
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider')
  }
  return context
}