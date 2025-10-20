'use client'

import { useState, useEffect } from 'react'
import styles from '../dashboard/dashboard.module.css'

interface QueryAnalytics {
  id: string
  query_text: string
  query_category: string
  query_topics: string[]
  word_count: number
  response_time_ms: number
  has_web_search: boolean
  sources_used: any
  error_occurred: boolean
  created_at: string
}

interface Analytics {
  queries: QueryAnalytics[]
  stats: {
    total: number
    avgResponseTime: number
    webSearchPercentage: number
    errorRate: number
  }
  categoryBreakdown: Record<string, number>
  topTopics: Array<{ topic: string; count: number }>
  hourlyDistribution: number[]
  period: number
}

interface Trends {
  trends: Array<{
    topic: string
    current: number
    previous: number
    change: number
    trending: boolean
  }>
  categoryTrends: Array<{
    category: string
    current: number
    previous: number
    change: number
  }>
  volumeData: Array<{ date: string; count: number }>
  period: number
  totalCurrent: number
  totalPrevious: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [trends, setTrends] = useState<Trends | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    fetchAnalytics()
  }, [period, category])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [analyticsRes, trendsRes] = await Promise.all([
        fetch(`/api/analytics/queries?period=${period}&category=${category}`),
        fetch(`/api/analytics/trends?period=${period}`),
      ])

      if (analyticsRes.ok && trendsRes.ok) {
        const analyticsData = await analyticsRes.json()
        const trendsData = await trendsRes.json()
        setAnalytics(analyticsData)
        setTrends(trendsData)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTopicName = (topic: string) => {
    return topic
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading && !analytics) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>
            <i className="fas fa-chart-line"></i>
            Chat Analytics
          </h1>
          <p className={styles.subtitle}>Insights into user interactions and trends</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label
            htmlFor="period"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}
          >
            Time Period:
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              fontSize: '1rem',
            }}
          >
            <option value="1">Last 24 Hours</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="category"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}
          >
            Category:
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              fontSize: '1rem',
            }}
          >
            <option value="all">All Categories</option>
            <option value="job_search">Job Search</option>
            <option value="career_guidance">Career Guidance</option>
            <option value="training">Training</option>
            <option value="youth_program">Youth Program</option>
            <option value="employer_services">Employer Services</option>
            <option value="unemployment">Unemployment</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div className={styles.card} style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6C757D', marginBottom: '0.5rem' }}>
            Total Queries
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ohio-blue)' }}>
            {analytics?.stats?.total || 0}
          </p>
          {trends && (
            <p style={{ fontSize: '0.875rem', color: '#6C757D' }}>
              {trends.totalCurrent > trends.totalPrevious ? (
                <span style={{ color: '#10b981' }}>
                  <i className="fas fa-arrow-up"></i> +
                  {Math.round(((trends.totalCurrent - trends.totalPrevious) / (trends.totalPrevious || 1)) * 100)}%
                </span>
              ) : (
                <span style={{ color: '#ef4444' }}>
                  <i className="fas fa-arrow-down"></i>{' '}
                  {Math.round(((trends.totalCurrent - trends.totalPrevious) / (trends.totalPrevious || 1)) * 100)}%
                </span>
              )}
            </p>
          )}
        </div>

        <div className={styles.card} style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6C757D', marginBottom: '0.5rem' }}>
            Avg Response Time
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ohio-red)' }}>
            {Math.round(analytics?.stats?.avgResponseTime || 0)}ms
          </p>
        </div>

        <div className={styles.card} style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6C757D', marginBottom: '0.5rem' }}>
            Web Search Usage
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ohio-blue)' }}>
            {Math.round(analytics?.stats?.webSearchPercentage || 0)}%
          </p>
        </div>

        <div className={styles.card} style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6C757D', marginBottom: '0.5rem' }}>
            Error Rate
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ohio-red)' }}>
            {Math.round(analytics?.stats?.errorRate || 0)}%
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Category Breakdown */}
        <div className={styles.card} style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-th-large"></i>
            Query Categories
          </h2>
          <div>
            {Object.entries(analytics?.categoryBreakdown || {})
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {formatTopicName(cat)}
                    </span>
                    <span style={{ color: '#6C757D' }}>{count}</span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: '#e2e8f0',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${((count / (analytics?.stats?.total || 1)) * 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(135deg, var(--ohio-blue), var(--ohio-red))',
                        borderRadius: '999px',
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top Topics */}
        <div className={styles.card} style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-tags"></i>
            Top Topics
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {analytics?.topTopics?.map(({ topic, count }) => (
              <span
                key={topic}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f0f4ff',
                  color: 'var(--ohio-blue)',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {formatTopicName(topic)} ({count})
              </span>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        <div className={styles.card} style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-fire"></i>
            Trending Topics
          </h2>
          <div>
            {trends?.trends?.slice(0, 10).map(({ topic, current, change, trending }) => (
              <div
                key={topic}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  padding: '0.5rem',
                  background: trending ? '#fef3c7' : '#f8f9fa',
                  borderRadius: '8px',
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  {trending && <i className="fas fa-fire" style={{ color: '#f59e0b', marginRight: '0.5rem' }}></i>}
                  {formatTopicName(topic)}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>{current}</div>
                  <div style={{ fontSize: '0.75rem', color: change > 0 ? '#10b981' : '#ef4444' }}>
                    {change > 0 ? '+' : ''}
                    {change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Activity */}
        <div className={styles.card} style={{ padding: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-clock"></i>
            Hourly Activity
          </h2>
          <div style={{ display: 'flex', alignItems: 'end', height: '150px', gap: '2px' }}>
            {analytics?.hourlyDistribution?.map((count, hour) => {
              const maxCount = Math.max(...(analytics?.hourlyDistribution || [1]))
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0
              return (
                <div
                  key={hour}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, var(--ohio-blue), var(--ohio-red))',
                    height: `${height}%`,
                    borderRadius: '4px 4px 0 0',
                    cursor: 'pointer',
                  }}
                  title={`${hour}:00 - ${count} queries`}
                />
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#6C757D' }}>
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>11pm</span>
          </div>
        </div>
      </div>

      {/* Recent Queries Table */}
      <div className={styles.card} style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-list"></i>
          Recent Queries
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#6C757D' }}>
                  Time
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#6C757D' }}>
                  Query (Anonymized)
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#6C757D' }}>
                  Category
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#6C757D' }}>
                  Topics
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#6C757D' }}>
                  Response Time
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics?.queries?.slice(0, 20).map((query) => (
                <tr key={query.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    {new Date(query.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', maxWidth: '400px' }}>
                    {query.query_text}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#f0f4ff',
                        color: 'var(--ohio-blue)',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {formatTopicName(query.query_category)}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    {query.query_topics?.map((t) => formatTopicName(t)).join(', ') || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6C757D' }}>
                    {query.response_time_ms}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
