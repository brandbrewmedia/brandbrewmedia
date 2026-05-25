import { put, list, del } from '@vercel/blob'
import { NextResponse } from 'next/server'

export type PhotoEntry = {
  id: string
  name: string
  category: string
  tag: string
  client: string
  desc: string
  result: string
  url: string
  uploadedAt: string
}

const META_FILENAME = 'photos-meta.json'

async function readMeta(): Promise<PhotoEntry[]> {
  const { blobs } = await list({ prefix: META_FILENAME })
  if (blobs.length === 0) return []
  const res = await fetch(blobs[0].url + `?t=${Date.now()}`)
  if (!res.ok) return []
  return res.json()
}

async function writeMeta(photos: PhotoEntry[]) {
  await put(META_FILENAME, JSON.stringify(photos), {
    access: 'public',
    addRandomSuffix: false,
  })
}

export async function GET() {
  const photos = await readMeta()
  return NextResponse.json(photos)
}

export async function POST(request: Request) {
  const body = await request.json() as Omit<PhotoEntry, 'id' | 'uploadedAt'>
  const newEntry: PhotoEntry = {
    ...body,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    uploadedAt: new Date().toISOString(),
  }
  const photos = await readMeta()
  photos.unshift(newEntry)
  await writeMeta(photos)
  return NextResponse.json(newEntry)
}

export async function DELETE(request: Request) {
  const { id, url } = await request.json()
  const photos = await readMeta()
  await writeMeta(photos.filter(p => p.id !== id))
  if (url && url.includes('vercel-storage.com')) {
    await del(url).catch(() => {})
  }
  return NextResponse.json({ ok: true })
}
