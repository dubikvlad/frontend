import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'

import { routes } from '@/config/constants'
import { useLoadingWindow } from '@/contexts'
import { useAuth, usePool } from '@/helpers'

type PoolGuardProps = { children: ReactNode }

export function PoolGuard({ children }: PoolGuardProps) {
  const {
    query: { poolId },
    asPath,
    push,
    pathname,
  } = useRouter()

  const { userData, userIsLoading } = useAuth()
  const { poolData, poolError, poolIsLoading } = usePool(
    poolId ? Number(poolId) : undefined,
  )

  const { setIsLoadingShow } = useLoadingWindow()

  useEffect(() => {
    if (!userIsLoading && userData) {
      if (
        pathname.includes('[poolId]') &&
        ((!poolIsLoading && poolError && push) ||
          poolId === 'null' ||
          poolId === 'undefined')
      ) {
        push(routes.account.dashboard)
      }
    }
  }, [
    poolError,
    poolIsLoading,
    push,
    poolId,
    userData,
    userIsLoading,
    asPath,
    pathname,
  ])

  const blockingCondition1 = asPath.includes(routes.account.index) && !userData
  const blockingCondition2 = pathname.includes('[poolId]') && !poolData

  // еcли одно из уcловий не выполнено,
  // то будет показано окно загрузки
  useEffect(() => {
    setIsLoadingShow(blockingCondition1 || blockingCondition2)
  }, [blockingCondition1, blockingCondition2, setIsLoadingShow])

  if (blockingCondition1 || blockingCondition2) return null

  return <>{children}</>
}
