import { ReactNode } from 'react'

import { CommissionerGuard, PaymentGuard, PoolGuard } from './index'

export function GuardWrapper({ children }: { children: ReactNode }) {
  return (
    <PoolGuard>
      <PaymentGuard>
        <CommissionerGuard>{children}</CommissionerGuard>
      </PaymentGuard>
    </PoolGuard>
  )
}
