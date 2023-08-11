import { useRouter } from 'next/router'
import { ReactNode, useEffect } from 'react'

import { routes } from '@/config/constants'
import { useLoadingWindow } from '@/contexts'
import { useGetUserInfo, usePool } from '@/helpers'

type CommissionerGuardProps = { children: ReactNode }

export function CommissionerGuard({ children }: CommissionerGuardProps) {
  const {
    query: { poolId },
    push,
    asPath,
    pathname,
  } = useRouter()

  const { userInfoData } = useGetUserInfo()
  const { poolData } = usePool(poolId ? Number(poolId) : undefined)

  const { setIsLoadingShow } = useLoadingWindow()

  useEffect(() => {
    if (poolData && userInfoData && push) {
      if (
        asPath.includes(routes.account.commish.index(poolData.id)) &&
        poolData.owner.id !== userInfoData.id
      ) {
        push(routes.account.overview(poolData.id))
      }
    }
  }, [poolData, userInfoData, asPath, push])

  const blockingСondition1 =
    pathname.includes('[poolId]') && (!poolData || !userInfoData)
  const blockingСondition2 =
    !!poolData &&
    !!userInfoData &&
    asPath.includes(routes.account.commish.index(poolData.id)) &&
    poolData.owner.id !== userInfoData.id

  // если одно из условий не выполнено,
  // то будет показано окно загрузки
  useEffect(() => {
    setIsLoadingShow(blockingСondition1 || blockingСondition2)
  }, [blockingСondition1, blockingСondition2, setIsLoadingShow])

  if (blockingСondition1 || blockingСondition2) return null

  return <>{children}</>
}
