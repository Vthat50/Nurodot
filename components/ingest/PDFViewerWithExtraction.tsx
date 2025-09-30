"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle, FileText, Edit2, Save, X, Plus, Trash2 } from 'lucide-react'

// Dynamically import PDFViewer only on client side
const PDFViewer = dynamic(() => import('./PDFViewer').then(mod => ({ default: mod.PDFViewer })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8 text-slate-600">Loading PDF viewer...</div>
})

interface ExtractedCriteria {
  inclusion: Array<{
    id: number
    text: string
    field: string
    operator: string
    value: any
    location?: { start: number; end: number }
  }>
  exclusion: Array<{
    id: number
    text: string
    field: string
    operator: string
    value: any
    location?: { start: number; end: number }
  }>
  questions: string[]
  fullText?: string
}

interface PDFViewerWithExtractionProps {
  pdfFile: File
  extractedData: ExtractedCriteria
}

export function PDFViewerWithExtraction({ pdfFile, extractedData }: PDFViewerWithExtractionProps) {
  const [selectedCriterion, setSelectedCriterion] = useState<string | null>(null)

  // State for inclusion criteria
  const [inclusionCriteria, setInclusionCriteria] = useState(extractedData.inclusion)
  const [editingInclusionId, setEditingInclusionId] = useState<number | null>(null)
  const [editingInclusionText, setEditingInclusionText] = useState<string>('')

  // State for exclusion criteria
  const [exclusionCriteria, setExclusionCriteria] = useState(extractedData.exclusion)
  const [editingExclusionId, setEditingExclusionId] = useState<number | null>(null)
  const [editingExclusionText, setEditingExclusionText] = useState<string>('')

  // State for questions
  const [questions, setQuestions] = useState<string[]>(extractedData.questions)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null)
  const [editingQuestionText, setEditingQuestionText] = useState<string>('')
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)
  const [newQuestionText, setNewQuestionText] = useState<string>('')

  // Collect all text to highlight with type
  const highlightedTexts = [
    ...inclusionCriteria.map(item => ({ text: item.text, type: 'inclusion' as const })),
    ...exclusionCriteria.map(item => ({ text: item.text, type: 'exclusion' as const }))
  ]

  // Inclusion criteria handlers
  const handleEditInclusion = (id: number, text: string) => {
    setEditingInclusionId(id)
    setEditingInclusionText(text)
  }

  const handleSaveInclusion = () => {
    if (editingInclusionId !== null && editingInclusionText.trim()) {
      setInclusionCriteria(prev =>
        prev.map(item =>
          item.id === editingInclusionId
            ? { ...item, text: editingInclusionText.trim() }
            : item
        )
      )
      setEditingInclusionId(null)
      setEditingInclusionText('')
    }
  }

  const handleDeleteInclusion = (id: number) => {
    setInclusionCriteria(prev => prev.filter(item => item.id !== id))
  }

  // Exclusion criteria handlers
  const handleEditExclusion = (id: number, text: string) => {
    setEditingExclusionId(id)
    setEditingExclusionText(text)
  }

  const handleSaveExclusion = () => {
    if (editingExclusionId !== null && editingExclusionText.trim()) {
      setExclusionCriteria(prev =>
        prev.map(item =>
          item.id === editingExclusionId
            ? { ...item, text: editingExclusionText.trim() }
            : item
        )
      )
      setEditingExclusionId(null)
      setEditingExclusionText('')
    }
  }

  const handleDeleteExclusion = (id: number) => {
    setExclusionCriteria(prev => prev.filter(item => item.id !== id))
  }

  // Question handlers
  const handleEditQuestion = (index: number) => {
    setEditingQuestionIndex(index)
    setEditingQuestionText(questions[index])
  }

  const handleSaveQuestion = () => {
    if (editingQuestionIndex !== null && editingQuestionText.trim()) {
      const updatedQuestions = [...questions]
      updatedQuestions[editingQuestionIndex] = editingQuestionText.trim()
      setQuestions(updatedQuestions)
      setEditingQuestionIndex(null)
      setEditingQuestionText('')
    }
  }

  const handleCancelQuestionEdit = () => {
    setEditingQuestionIndex(null)
    setEditingQuestionText('')
  }

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleAddQuestion = () => {
    if (newQuestionText.trim()) {
      setQuestions([...questions, newQuestionText.trim()])
      setNewQuestionText('')
      setIsAddingNew(false)
    }
  }

  const handleCancelAdd = () => {
    setIsAddingNew(false)
    setNewQuestionText('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side: PDF Viewer */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-blue-600" />
            Protocol Document: {pdfFile.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[700px]">
            <PDFViewer
              pdfFile={pdfFile}
              highlightedText={highlightedTexts}
            />
          </ScrollArea>
          <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-700">
            💡 Your uploaded PDF is displayed above. Click criteria on the right to see structured data.
          </div>
        </CardContent>
      </Card>

      {/* Right Side: Extracted Criteria */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">AI-Extracted Criteria</CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {inclusionCriteria.length} Inclusion
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700">
              {exclusionCriteria.length} Exclusion
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {questions.length} Questions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-6 pr-4">
              {/* Inclusion Criteria */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Inclusion Criteria
                </h4>
                <div className="space-y-3">
                  {inclusionCriteria.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-3 transition-all border-slate-200 hover:border-green-300 group"
                    >
                      {editingInclusionId === item.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingInclusionText}
                            onChange={(e) => setEditingInclusionText(e.target.value)}
                            className="text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInclusion()
                              if (e.key === 'Escape') setEditingInclusionId(null)
                            }}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveInclusion} className="text-xs">
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingInclusionId(null)} className="text-xs">
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-slate-900 mb-2 flex-1">{item.text}</p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditInclusion(item.id, item.text)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteInclusion(item.id)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Field: {item.field}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Op: {item.operator}
                            </Badge>
                            {Array.isArray(item.value) ? (
                              <Badge variant="secondary" className="text-xs">
                                Range: {item.value[0]}-{item.value[1]}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Value: {String(item.value)}
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusion Criteria */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Exclusion Criteria
                </h4>
                <div className="space-y-3">
                  {exclusionCriteria.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-3 transition-all border-slate-200 hover:border-red-300 group"
                    >
                      {editingExclusionId === item.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingExclusionText}
                            onChange={(e) => setEditingExclusionText(e.target.value)}
                            className="text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveExclusion()
                              if (e.key === 'Escape') setEditingExclusionId(null)
                            }}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveExclusion} className="text-xs">
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingExclusionId(null)} className="text-xs">
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-slate-900 mb-2 flex-1">{item.text}</p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditExclusion(item.id, item.text)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteExclusion(item.id)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Field: {item.field}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Op: {item.operator}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Value: {String(item.value)}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">Generated Screening Questions</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingNew(true)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Question
                  </Button>
                </div>
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="border border-purple-200 rounded-lg p-3 bg-purple-50/30 group hover:border-purple-300 transition-all"
                    >
                      {editingQuestionIndex === index ? (
                        <div className="space-y-2">
                          <Input
                            value={editingQuestionText}
                            onChange={(e) => setEditingQuestionText(e.target.value)}
                            className="text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveQuestion()
                              if (e.key === 'Escape') handleCancelQuestionEdit()
                            }}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveQuestion} className="text-xs">
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelQuestionEdit} className="text-xs">
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-slate-700 flex-1">
                            <span className="font-semibold text-purple-700">Q{index + 1}:</span> {question}
                          </p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditQuestion(index)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteQuestion(index)}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add New Question Input */}
                  {isAddingNew && (
                    <div className="border border-purple-300 rounded-lg p-3 bg-purple-50/50 space-y-2">
                      <Input
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder="Enter new screening question..."
                        className="text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddQuestion()
                          if (e.key === 'Escape') handleCancelAdd()
                        }}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddQuestion} className="text-xs">
                          <Save className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelAdd} className="text-xs">
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}