import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7' // Days to look back

    const supabaseAdmin = getSupabaseAdmin()

    // Calculate date ranges
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    const prevStartDate = new Date(startDate)
    prevStartDate.setDate(prevStartDate.getDate() - parseInt(period))

    // Get queries for current period
    const { data: currentQueries, error: currentError } = await supabaseAdmin
      .from('chat_analytics')
      .select('query_topics, query_category, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (currentError) {
      console.error('Current period query error:', currentError)
      throw currentError
    }

    // Get queries for previous period
    const { data: previousQueries, error: previousError } = await supabaseAdmin
      .from('chat_analytics')
      .select('query_topics, query_category')
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    if (previousError) {
      console.error('Previous period query error:', previousError)
      throw previousError
    }

    // Calculate topic trends
    const currentTopics: Record<string, number> = {}
    const previousTopics: Record<string, number> = {}

    currentQueries?.forEach((query) => {
      if (query.query_topics && Array.isArray(query.query_topics)) {
        query.query_topics.forEach((topic: string) => {
          currentTopics[topic] = (currentTopics[topic] || 0) + 1
        })
      }
    })

    previousQueries?.forEach((query) => {
      if (query.query_topics && Array.isArray(query.query_topics)) {
        query.query_topics.forEach((topic: string) => {
          previousTopics[topic] = (previousTopics[topic] || 0) + 1
        })
      }
    })

    // Calculate trending topics
    const trends = Object.keys(currentTopics).map((topic) => {
      const current = currentTopics[topic]
      const previous = previousTopics[topic] || 0
      const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0

      return {
        topic,
        current,
        previous,
        change: Math.round(change),
        trending: change > 20, // Mark as "hot" if >20% increase
      }
    })

    // Sort by change (descending)
    trends.sort((a, b) => b.change - a.change)

    // Calculate category trends
    const currentCategories: Record<string, number> = {}
    const previousCategories: Record<string, number> = {}

    currentQueries?.forEach((query) => {
      const cat = query.query_category || 'unknown'
      currentCategories[cat] = (currentCategories[cat] || 0) + 1
    })

    previousQueries?.forEach((query) => {
      const cat = query.query_category || 'unknown'
      previousCategories[cat] = (previousCategories[cat] || 0) + 1
    })

    const categoryTrends = Object.keys(currentCategories).map((category) => {
      const current = currentCategories[category]
      const previous = previousCategories[category] || 0
      const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0

      return {
        category,
        current,
        previous,
        change: Math.round(change),
      }
    })

    // Get daily query volume for current period
    const dailyVolume: Record<string, number> = {}
    currentQueries?.forEach((query) => {
      const date = new Date(query.created_at).toISOString().split('T')[0]
      dailyVolume[date] = (dailyVolume[date] || 0) + 1
    })

    const volumeData = Object.entries(dailyVolume)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      trends: trends.slice(0, 20), // Top 20 trending topics
      categoryTrends,
      volumeData,
      period: parseInt(period),
      totalCurrent: currentQueries?.length || 0,
      totalPrevious: previousQueries?.length || 0,
    })
  } catch (error) {
    console.error('Trends error:', error)
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 })
  }
}
