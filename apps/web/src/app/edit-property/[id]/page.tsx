import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateProperty } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !property) {
    return <div className="container mx-auto py-12 text-center">Property not found.</div>
  }

  if (property.owner_id !== user.id) {
    return <div className="container mx-auto py-12 text-center">You do not have permission to edit this property.</div>
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Edit Listing</h1>
        <p className="text-zinc-500 mt-2">Update your property details.</p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Basic Details</CardTitle>
          <CardDescription>Keep your information up to date to attract buyers.</CardDescription>
        </CardHeader>
        
        <form action={updateProperty as any}>
          <CardContent className="space-y-6">
            <input type="hidden" name="property_id" value={property.id} />
            
            <div className="space-y-2">
              <Label>Property Title</Label>
              <Input name="title" defaultValue={property.title} required />
            </div>
            
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input name="price" type="number" defaultValue={property.price} required />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select 
                name="status" 
                defaultValue={property.status}
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="AVAILABLE">Available</option>
                <option value="SOLD">Sold</option>
                <option value="RENTED">Rented</option>
                <option value="UNAVAILABLE">Unavailable / Draft</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Property Description</Label>
              <textarea 
                name="description" 
                defaultValue={property.description || ''}
                className="w-full flex min-h-[150px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" 
                required
              ></textarea>
            </div>

            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              Save Changes
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
