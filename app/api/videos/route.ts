import { put, list, del } from '@vercel/blob'
import { NextResponse } from 'next/server'

type VideoEntry = {
  id: string
  name: string
  category: string
  type: 'upload' | 'youtube'
  url: string
  youtubeId?: string
  thumbnail?: string
  uploadedAt: string
}

const META_FILENAME = 'videos-meta.json'

async function readMeta(): Promise<VideoEntry[]> {
  const { blobs } = await list({ prefix: META_FILENAME })
  if (blobs.length === 0) return []
  const res = await fetch(blobs[0].url + `?t=${Date.now()}`)
  if (!res.ok) return []
  return res.json()
}

async function writeMeta(videos: VideoEntry[]) {
  await put(META_FILENAME, JSON.stringify(videos), {
    access: 'public',
    addRandomSuffix: false,
  })
}

export async function GET() {
  const videos = await readMeta()
  return NextResponse.json(videos)
}

export async function POST(request: Request) {
  const body = await request.json() as Omit<VideoEntry, 'id' | 'uploadedAt'>
  const newEntry: VideoEntry = {
    ...body,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    uploadedAt: new Date().toISOString(),
  }
  const videos = await readMeta()
  videos.unshift(newEntry)
  await writeMeta(videos)
  return NextResponse.json(newEntry)
}

export async function DELETE(request: Request) {
  const { id, url } = await request.json()
  const videos = await readMeta()
  const updated = videos.filter(v => v.id !== id)
  await writeMeta(updated)

  // Delete the actual blob file if it was an upload
  if (url && url.includes('vercel-storage.com')) {
    await del(url).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
