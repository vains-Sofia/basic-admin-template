import { beforeEach, describe, expect, it } from 'vitest'

import {
  finishRequest,
  isRequestLoading,
  pendingRequestCount,
  resetRequestStatus,
  startRequest,
} from './request-status'

describe('request status', () => {
  beforeEach(resetRequestStatus)

  it('tracks concurrent requests without becoming negative', () => {
    startRequest()
    startRequest()
    expect(pendingRequestCount.value).toBe(2)
    expect(isRequestLoading.value).toBe(true)

    finishRequest()
    finishRequest()
    finishRequest()
    expect(pendingRequestCount.value).toBe(0)
    expect(isRequestLoading.value).toBe(false)
  })
})
