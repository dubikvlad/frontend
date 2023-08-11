import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'

import { routes } from '@/config/constants'
import { useLoadingWindow } from '@/contexts'
import { useGetUserInfo, useGrids, usePool } from '@/helpers/hooks'

export function PaymentGuard({ children }: { children: ReactNode }) {
  const {
    query: { poolId },
    push,
    asPath,
    pathname,
  } = useRouter()

  const { userInfoData, userInfoLoading } = useGetUserInfo()
  const { poolData, poolIsLoading } = usePool(Number(poolId))

  const { gridsData } = useGrids({
    poolId: poolData?.payment_plan.type === 'by_grid' ? poolData.id : undefined,
  })

  const { setIsLoadingShow } = useLoadingWindow()

  // если проверка пройдена, пропускает дальше
  const [isPaymentVerified, setIsPaymentVerified] = useState(false)

  // если меняется путь, то setIsPaymentVerified сбрасывается
  useEffect(() => {
    setIsPaymentVerified(false)
  }, [asPath])

  useEffect(() => {
    // проверка на то, содерждит ли в себе путь (pathname) [poolId],
    // т.к. параметр poolId можно передавать как GET параметр
    if (
      pathname.includes('[poolId]') &&
      !poolIsLoading &&
      !userInfoLoading &&
      userInfoData &&
      poolData
    ) {
      const isCommissioner = userInfoData.id === poolData.user_id

      // путь без параметров
      const cleanPath = asPath.split('?')[0]

      // разрешенные пути
      const allowedPaths = isCommissioner
        ? [
            routes.account.commish.index(poolData.id),
            routes.account.settings(poolData.id),
            routes.account.paymentRequired(poolData.id),
          ]
        : [routes.account.temporarilyLocked(poolData.id)]

      // проверяет, содержит ли текущая ссылка в себе часть
      // разрешенной ссылки
      const isAllowed = allowedPaths.some((item) => cleanPath.includes(item))

      if (isAllowed) setIsPaymentVerified(true)

      const { entries_count: entriesCount, payed_units: payedUnits } = poolData

      const {
        type,
        cost_per_unit: costPerUnit,
        upper_unit_limit: upperUnitLimit,
      } = poolData.payment_plan

      if (type === 'by_entry') {
        if (
          (!costPerUnit && (upperUnitLimit ?? Infinity) < entriesCount) ||
          (costPerUnit && entriesCount > payedUnits)
        ) {
          if (!isAllowed) {
            push(
              isCommissioner
                ? routes.account.paymentRequired(poolData.id)
                : routes.account.temporarilyLocked(poolData.id),
            )
          }
        } else if (cleanPath === routes.account.paymentRequired(poolData.id)) {
          push(routes.account.overview(poolData.id))
        } else {
          setIsPaymentVerified(true)
        }
      } else if (type === 'fixed') {
        // кол-во дней, которое доступно для бесплатного
        // использования пула
        const freeLimitInDays = 5

        const expireDate = new Date(poolData.created_at)
        expireDate.setDate(expireDate.getDate() + freeLimitInDays)

        if (Date.now() > expireDate.getTime()) {
          if (!isAllowed) {
            push(
              isCommissioner
                ? routes.account.paymentRequired(poolData.id)
                : routes.account.temporarilyLocked(poolData.id),
            )
          }
        } else if (cleanPath === routes.account.paymentRequired(poolData.id)) {
          push(routes.account.overview(poolData.id))
        } else {
          setIsPaymentVerified(true)
        }
      } else if (type === 'by_grid') {
        if (gridsData.length) {
          // лимит бесплатных гридов
          const gridLimit = poolData.payment_plan.upper_unit_limit

          // текущее кол-во созданных гридов пула
          const currentNumberGrids = gridsData.length

          if (
            gridLimit !== null &&
            currentNumberGrids >= gridLimit &&
            poolData.payed_units < gridLimit
          ) {
            if (!isAllowed) {
              push(
                isCommissioner
                  ? routes.account.paymentRequired(poolData.id)
                  : routes.account.temporarilyLocked(poolData.id),
              )
            }
          } else if (
            cleanPath === routes.account.paymentRequired(poolData.id)
          ) {
            push(routes.account.overview(poolData.id))
          } else {
            setIsPaymentVerified(true)
          }
        } else {
          setIsPaymentVerified(true)
        }
      } else {
        setIsPaymentVerified(true)
      }
    }
  }, [
    poolData,
    poolIsLoading,
    push,
    asPath,
    pathname,
    userInfoData,
    userInfoLoading,
    gridsData,
  ])

  const blockingCondition1 =
    pathname.includes('[poolId]') &&
    (!isPaymentVerified || !userInfoData || !poolData)

  // если условие не выполнено,
  // то будет показано окно загрузки
  useEffect(() => {
    setIsLoadingShow(blockingCondition1)
  }, [blockingCondition1, setIsLoadingShow])

  if (blockingCondition1) return null

  return <>{children}</>
}
