"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStudy } from "@/contexts/study-context"
import { useCampaign } from "@/contexts/campaign-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Users,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  TrendingUp,
  Target,
  PhoneCall
} from "lucide-react"

export default function CampaignsPage() {
  const router = useRouter()
  const { currentStudy } = useStudy()
  const { campaigns, setCurrentCampaign } = useCampaign()

  const studyCampaigns = campaigns.filter(c => c.studyId === currentStudy?.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {studyCampaigns.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Campaigns Yet
              </h3>
              <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                Create a screening campaign to manage patient outreach. Add qualified patients from your pre-screening results.
              </p>
              <Button onClick={() => router.push('/dashboard/ingest/patients')}>
                Go to Patient Screening
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {studyCampaigns.map((campaign) => {
              const contactRate = campaign.totalPatients > 0
                ? Math.round((campaign.contacted / campaign.totalPatients) * 100)
                : 0
              const interestRate = campaign.contacted > 0
                ? Math.round((campaign.interested / campaign.contacted) * 100)
                : 0
              const conversionRate = campaign.totalPatients > 0
                ? Math.round((campaign.enrolled / campaign.totalPatients) * 100)
                : 0

              return (
                <Card
                  key={campaign.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
                  onClick={() => {
                    setCurrentCampaign(campaign)
                    router.push(`/campaigns/${campaign.id}`)
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-600" />
                          {campaign.name}
                        </CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                          Created {campaign.createdDate}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {campaign.totalPatients} Patients
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-2xl font-bold text-slate-900">
                            {campaign.totalPatients}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">Total</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Phone className="h-4 w-4 text-blue-400" />
                          <span className="text-2xl font-bold text-blue-600">
                            {campaign.contacted}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">Contacted</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-purple-400" />
                          <span className="text-2xl font-bold text-purple-600">
                            {campaign.interested}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">Interested</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Calendar className="h-4 w-4 text-amber-400" />
                          <span className="text-2xl font-bold text-amber-600">
                            {campaign.scheduled}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">Scheduled</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-2xl font-bold text-green-600">
                            {campaign.enrolled}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">Enrolled</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">Contact Rate</span>
                          <span className="font-semibold">{contactRate}%</span>
                        </div>
                        <Progress value={contactRate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">Interest Rate</span>
                          <span className="font-semibold">{interestRate}%</span>
                        </div>
                        <Progress value={interestRate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">Enrollment Rate</span>
                          <span className="font-semibold">{conversionRate}%</span>
                        </div>
                        <Progress value={conversionRate} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}