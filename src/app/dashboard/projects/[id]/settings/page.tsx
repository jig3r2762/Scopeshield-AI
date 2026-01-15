'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'

interface Project {
  id: string
  name: string
  scopeSummary: string
  outOfScopeItems: string | null
  revisionCount: number
  maxRevisions: number
}

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [name, setName] = useState('')
  const [scopeSummary, setScopeSummary] = useState('')
  const [outOfScopeItems, setOutOfScopeItems] = useState('')
  const [revisionCount, setRevisionCount] = useState(0)
  const [maxRevisions, setMaxRevisions] = useState(3)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to fetch project')
      }
      const data = await response.json()
      setProject(data)
      setName(data.name)
      setScopeSummary(data.scopeSummary)
      setOutOfScopeItems(data.outOfScopeItems || '')
      setRevisionCount(data.revisionCount || 0)
      setMaxRevisions(data.maxRevisions || 3)
    } catch {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim() || !scopeSummary.trim()) {
      setError('Name and scope summary are required')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          scopeSummary: scopeSummary.trim(),
          outOfScopeItems: outOfScopeItems.trim() || null,
          revisionCount,
          maxRevisions
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update project')
      }

      setSuccess('Project updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Project not found</p>
        <Link href="/dashboard">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/dashboard/projects/${id}`}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 md:mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Project
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Project Settings</CardTitle>
          <CardDescription>
            Update your project scope and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scopeSummary">Scope Summary</Label>
              <Textarea
                id="scopeSummary"
                className="min-h-[150px]"
                value={scopeSummary}
                onChange={(e) => setScopeSummary(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outOfScope">Out of Scope Items</Label>
              <Textarea
                id="outOfScope"
                className="min-h-[100px]"
                value={outOfScopeItems}
                onChange={(e) => setOutOfScopeItems(e.target.value)}
              />
            </div>

            {/* Revision Tracking */}
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <h3 className="font-medium">Revision Tracking</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revisionCount">Revisions Used</Label>
                  <Input
                    id="revisionCount"
                    type="number"
                    min="0"
                    value={revisionCount}
                    onChange={(e) => setRevisionCount(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRevisions">Max Revisions</Label>
                  <Input
                    id="maxRevisions"
                    type="number"
                    min="1"
                    value={maxRevisions}
                    onChange={(e) => setMaxRevisions(parseInt(e.target.value) || 3)}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Track revision rounds to help identify when clients exceed included revisions.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <Link href={`/dashboard/projects/${id}`} className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
