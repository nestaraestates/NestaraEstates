'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Link as LinkIcon, Loader2 } from 'lucide-react'
import { saveWebsiteLink, deleteWebsiteLink } from './actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="bg-brand-600 hover:bg-brand-700">
      {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
      Add Link
    </Button>
  )
}

export function LinksManager({ links }: { links: any[] }) {
  const [error, setError] = useState('')

  async function handleAdd(formData: FormData) {
    const res = await saveWebsiteLink(formData)
    if (res?.error) setError(res.error)
    else setError('')
  }

  async function handleDelete(id: string) {
    await deleteWebsiteLink(id)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {links.map(link => (
          <div key={link.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-brand-100 p-2 rounded-md text-brand-600">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{link.title}</p>
                <a href={link.description} target="_blank" className="text-xs text-blue-500 hover:underline truncate">
                  {link.description}
                </a>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {links.length === 0 && <p className="text-sm text-zinc-500">No external links added yet.</p>}
      </div>

      <form action={handleAdd} className="mt-4 p-4 border border-zinc-200 rounded-xl bg-white dark:bg-zinc-950 dark:border-zinc-800 space-y-4">
        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">Add New Link</h4>
        {error && <p className="text-xs text-red-500">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="title">Link Title (e.g. Website, Instagram)</Label>
            <Input id="title" name="title" placeholder="Company Website" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" placeholder="https://..." required />
          </div>
        </div>
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
