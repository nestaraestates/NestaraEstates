import { MetadataRoute } from 'next'
import { createStaticClient } from '@/utils/supabase/static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nestaraestates.com'
  const supabase = createStaticClient()

  // Fetch all available verified properties
  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at')
    .eq('status', 'AVAILABLE')
    .eq('verification_status', 'VERIFIED')

  const propertyUrls = (properties || []).map((property) => ({
    url: `${baseUrl}/property/${property.id}`,
    lastModified: new Date(property.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/buy`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rent`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/commercial`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...propertyUrls,
  ]
}
