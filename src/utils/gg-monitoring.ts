import { MetricServiceClient, protos } from '@google-cloud/monitoring'

const projectId = 'gen-lang-client-0058731285'

const client = new MetricServiceClient()

console.log(new Date().toISOString())

function buildInterval(
  daysAgo: number
): protos.google.monitoring.v3.ITimeInterval {
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - daysAgo * 24 * 60 * 60 * 1000)

  return {
    startTime: { seconds: Math.floor(startTime.getTime() / 1000) },
    endTime: { seconds: Math.floor(endTime.getTime() / 1000) }
  }
}

function ensureProjectId(): string {
  if (!projectId) {
    throw new Error('Thiếu GCLOUD_PROJECT_ID hoặc GOOGLE_CLOUD_PROJECT')
  }
  return projectId
}

export type ApiRequestMetric = {
  metricType: string
  responseCode?: string
  date: Date
  total: number
}

export async function getApiRequestsMetrics(
  serviceName: string,
  daysAgo = 7
): Promise<ApiRequestMetric[]> {
  const request: protos.google.monitoring.v3.IListTimeSeriesRequest = {
    name: `projects/${ensureProjectId()}`,
    filter: `metric.type="serviceruntime.googleapis.com/api/request_count" AND resource.label.service="${serviceName}"`,
    interval: buildInterval(daysAgo),
    aggregation: {
      alignmentPeriod: { seconds: 86400 },
      perSeriesAligner:
        protos.google.monitoring.v3.Aggregation.Aligner.ALIGN_SUM
    }
  }

  const [timeSeries] = await client.listTimeSeries(request)

  return (
    timeSeries?.flatMap((series: protos.google.monitoring.v3.ITimeSeries) => {
      const metricType = series.metric?.type ?? 'unknown'
      const labels = series.metric?.labels ?? {}
      const responseCode = labels['response_code']
      return (
        series.points?.map((point) => {
          const seconds =
            Number(point.interval?.startTime?.seconds ?? 0) ||
            Number(point.interval?.endTime?.seconds ?? 0) ||
            0
          const date = new Date(seconds * 1000)
          const value = point.value?.int64Value ?? '0'
          return {
            metricType,
            responseCode,
            date,
            total: Number(value)
          }
        }) ?? []
      )
    }) ?? []
  )
}

export async function getTodayApiRequestsMetrics(
  serviceName: string
): Promise<ApiRequestMetric[]> {
  const now = new Date()
  const startOfTodayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )

  const request: protos.google.monitoring.v3.IListTimeSeriesRequest = {
    name: `projects/${ensureProjectId()}`,
    filter: `metric.type="serviceruntime.googleapis.com/api/request_count" AND resource.label.service="${serviceName}"`,
    interval: {
      startTime: { seconds: Math.floor(startOfTodayUtc.getTime() / 1000) },
      endTime: { seconds: Math.floor(now.getTime() / 1000) }
    },
    aggregation: {
      alignmentPeriod: { seconds: 86400 },
      perSeriesAligner:
        protos.google.monitoring.v3.Aggregation.Aligner.ALIGN_SUM
    }
  }

  const [timeSeries] = await client.listTimeSeries(request)

  return (
    timeSeries?.flatMap((series: protos.google.monitoring.v3.ITimeSeries) => {
      const metricType = series.metric?.type ?? 'unknown'
      const labels = series.metric?.labels ?? {}
      const responseCode = labels['response_code']
      return (
        series.points?.map((point) => {
          const seconds =
            Number(point.interval?.startTime?.seconds ?? 0) ||
            Number(point.interval?.endTime?.seconds ?? 0) ||
            0
          const date = new Date(seconds * 1000)
          const value = point.value?.int64Value ?? '0'
          return {
            metricType,
            responseCode,
            date,
            total: Number(value)
          }
        }) ?? []
      )
    }) ?? []
  )
}
