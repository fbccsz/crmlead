import { appEnv } from '../config/env'
import type { CrmGateway } from './crmGateway'
import { HttpCrmGateway } from './httpCrmGateway'
import { HttpClient } from './httpClient'
import { MockCrmGateway } from './mockCrmGateway'

function createGateway(): CrmGateway {
  if (appEnv.useMockApi) return new MockCrmGateway()
  return new HttpCrmGateway(
    new HttpClient(appEnv.apiBaseUrl, {
      timeoutMs: appEnv.httpTimeoutMs,
      retryCount: appEnv.httpRetryCount,
    }),
  )
}

export const crmGateway = createGateway()
