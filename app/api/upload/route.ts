import { issueSignedToken, presignUrl } from '@vercel/blob'
import { NextResponse } from 'next/server'

// Returns a presigned PUT URL — the browser uploads directly to Vercel Blob (no size limit)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename') ?? `upload-${Date.now()}`
  const contentType = searchParams.get('contentType') ?? 'application/octet-stream'

  const signedToken = await issueSignedToken({
    operations: ['put'],
    pathname: filename,
    allowedContentTypes: [contentType],
    maximumSizeInBytes: 2 * 1024 * 1024 * 1024,
  })

  const { presignedUrl } = await presignUrl(signedToken, {
    operation: 'put',
    pathname: filename,
    access: 'public',
  })

  return NextResponse.json({ presignedUrl })
}
