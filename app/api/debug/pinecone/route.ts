import { NextResponse } from 'next/server'
import { getPineconeClient } from '@/lib/pinecone'
import { generateEmbedding } from '@/lib/openai'

export async function GET() {
  try {
    // Query for OJT document
    const query = "OJT employer information"
    const queryEmbedding = await generateEmbedding(query)

    const pinecone = await getPineconeClient()
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!)

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    })

    return NextResponse.json({
      matches: queryResponse.matches.map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata
      })),
      env: {
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        constructed_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'NOT_SET'}/api/documents/download/EXAMPLE_ID`
      }
    }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
