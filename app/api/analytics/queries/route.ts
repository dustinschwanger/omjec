import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7' // Days to look back
    const category = searchParams.get('category') || 'all'

    const supabaseAdmin = getSupabaseAdmin()

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Build query
    let query = supabaseAdmin
      .from('chat_analytics')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    // Add category filter if specified
    if (category && category !== 'all') {
      query = query.eq('query_category', category)
    }

    const { data: queries, error } = await query

    if (error) {
      console.error('Analytics query error:', error)
      throw error
    }

    // Calculate statistics
    const total = queries?.length || 0
    const stats = {
      total,
      avgResponseTime:
        total > 0
          ? queries!.reduce((acc, q) => acc + (q.response_time_ms || 0), 0) / total
          : 0,
      webSearchPercentage:
        total > 0 ? (queries!.filter((q) => q.has_web_search).length / total) * 100 : 0,
      errorRate: total > 0 ? (queries!.filter((q) => q.error_occurred).length / total) * 100 : 0,
    }

    // Get category breakdown
    const categoryBreakdown: Record<string, number> = {}
    queries?.forEach((query) => {
      const cat = query.query_category || 'unknown'
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1
    })

    // Get topic frequency
    const topicFrequency: Record<string, number> = {}
    queries?.forEach((query) => {
      if (query.query_topics && Array.isArray(query.query_topics)) {
        query.query_topics.forEach((topic: string) => {
          topicFrequency[topic] = (topicFrequency[topic] || 0) + 1
        })
      }
    })

    // Sort topics by frequency and get top 10
    const topTopics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }))

    // Get hourly distribution
    const hourlyDistribution = Array(24).fill(0)
    queries?.forEach((query) => {
      const hour = new Date(query.created_at).getHours()
      hourlyDistribution[hour]++
    })

    return NextResponse.json({
      queries: queries?.slice(0, 100) || [], // Return latest 100 queries
      stats,
      categoryBreakdown,
      topTopics,
      hourlyDistribution,
      period: parseInt(period),
    })
  } catch (error) {
    console.error('Analytics query error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
