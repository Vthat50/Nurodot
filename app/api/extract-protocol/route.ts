import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log(`Processing PDF: ${file.name}`)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Return mock data matching the actual document with study metadata
    const result = {
      studyInfo: {
        title: "CLARITY-AD",
        fullTitle: "A Study of Lecanemab in Early Alzheimer's Disease (CLARITY AD)",
        phase: "Phase III",
        description: "Randomized, double-blind, placebo-controlled study to evaluate efficacy and safety of lecanemab in subjects with early Alzheimer's disease",
        sponsor: "Eisai Inc.",
        nctId: "NCT03887455"
      },
      inclusion: [
        {
          id: 1,
          text: "Age 50-85 years inclusive",
          field: "age",
          operator: "between",
          value: [50, 85]
        },
        {
          id: 2,
          text: "Clinical diagnosis of mild to moderate AD (NIA-AA criteria)",
          field: "condition",
          operator: "has",
          value: "mild to moderate AD"
        },
        {
          id: 3,
          text: "MMSE score 18-26 (mild to moderate)",
          field: "mmse_score",
          operator: "between",
          value: [18, 26]
        },
        {
          id: 4,
          text: "MoCA score 13-23",
          field: "moca_score",
          operator: "between",
          value: [13, 23]
        },
        {
          id: 5,
          text: "ADAS-Cog 11 score 15-35",
          field: "adas_cog",
          operator: "between",
          value: [15, 35]
        },
        {
          id: 6,
          text: "Positive amyloid status (PET or CSF)",
          field: "amyloid_status",
          operator: "==",
          value: "positive"
        },
        {
          id: 7,
          text: "Reliable study partner",
          field: "study_partner",
          operator: "==",
          value: true
        },
        {
          id: 8,
          text: "Stable AD medications for ≥3 months",
          field: "stable_meds",
          operator: ">=",
          value: 3
        }
      ],
      exclusion: [
        {
          id: 1,
          text: "Other primary neurodegenerative disorders",
          field: "condition",
          operator: "not_has",
          value: "other neurodegenerative disorders"
        },
        {
          id: 2,
          text: "Significant cerebrovascular disease (>4 microhemorrhages)",
          field: "microhemorrhages",
          operator: "<=",
          value: 4
        },
        {
          id: 3,
          text: "Uncontrolled diabetes (HbA1c >8.5%)",
          field: "hba1c",
          operator: "<=",
          value: 8.5
        },
        {
          id: 4,
          text: "Recent cardiovascular events (within 6 months)",
          field: "cardiovascular_event",
          operator: "not_within",
          value: "6 months"
        },
        {
          id: 5,
          text: "Hepatic or renal impairment",
          field: "condition",
          operator: "not_has",
          value: "hepatic or renal impairment"
        },
        {
          id: 6,
          text: "Current participation in other trials",
          field: "other_trial",
          operator: "==",
          value: false
        },
        {
          id: 7,
          text: "Contraindications to MRI",
          field: "mri_contraindication",
          operator: "==",
          value: false
        }
      ],
      questions: [
        "How old are you? (Must be between 50-85 years)",
        "Have you been diagnosed with mild to moderate Alzheimer's disease?",
        "What is your most recent MMSE score? (Must be 18-26)",
        "Do you have a positive amyloid status confirmed by PET or CSF?",
        "Do you have a reliable study partner who can accompany you?",
        "Have you been on stable AD medications for at least 3 months?",
        "Do you have any other neurodegenerative disorders?",
        "Have you had any cardiovascular events in the past 6 months?"
      ],
      fullText: ''
    }

    console.log('Extraction complete - returning mock data')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error extracting protocol:', error)
    return NextResponse.json(
      { error: 'Failed to extract protocol criteria' },
      { status: 500 }
    )
  }
}