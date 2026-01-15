'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Upload, X } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [scopeSummary, setScopeSummary] = useState('')
  const [outOfScopeItems, setOutOfScopeItems] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setPdfFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Project name is required')
      return
    }

    if (!scopeSummary.trim()) {
      setError('Scope summary is required')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('scopeSummary', scopeSummary)
      if (outOfScopeItems) {
        formData.append('outOfScopeItems', outOfScopeItems)
      }
      if (pdfFile) {
        formData.append('contract', pdfFile)
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create project')
        return
      }

      router.push(`/dashboard/projects/${data.id}`)
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 md:mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Set up a project with scope details to start analyzing client messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Website Redesign for Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scopeSummary">Scope Summary *</Label>
              <Textarea
                id="scopeSummary"
                placeholder="Enter the project scope as bullet points. For example:
- Design and develop a 5-page marketing website
- Implement responsive design for mobile devices
- Set up contact form with email notifications
- Basic SEO optimization"
                className="min-h-[150px]"
                value={scopeSummary}
                onChange={(e) => setScopeSummary(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Be specific about what is included in the project scope.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outOfScope">Out of Scope Items (Optional)</Label>
              <Textarea
                id="outOfScope"
                placeholder="List items explicitly excluded from the scope. For example:
- Content writing and copywriting
- Photography or video production
- Ongoing maintenance after launch"
                className="min-h-[100px]"
                value={outOfScopeItems}
                onChange={(e) => setOutOfScopeItems(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Helps identify requests that are clearly out of scope.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Contract PDF (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">{pdfFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPdfFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload a contract PDF
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Max file size: 10MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload your contract to help AI better understand the project terms.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
