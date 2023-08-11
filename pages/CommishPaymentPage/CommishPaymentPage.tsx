import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Pool } from '@/api'
import { leadToMonetaryDivision, routes } from '@/config/constants'
import {
  useGetPoolPaymentPlan,
  useGetUserInfo,
  useGrids,
  usePool,
} from '@/helpers'

import styles from './CommishPaymentPage.module.scss'

const PaymentByEntryLazy = dynamic(
  () =>
    import('@/features/components/PaymentByEntry').then(
      (mod) => mod.PaymentByEntry,
    ),
  { loading: () => <p>Loading...</p> },
)

const PaymentFixedLazy = dynamic(
  () =>
    import('@/features/components/PaymentFixed').then(
      (mod) => mod.PaymentFixed,
    ),
  { loading: () => <p>Loading...</p> },
)

const PaymentByGridLazy = dynamic(
  () =>
    import('@/features/components/PaymentByGrid').then(
      (mod) => mod.PaymentByGrid,
    ),
  { loading: () => <p>Loading...</p> },
)

export function CommishPaymentPage() {
  const {
    query: { poolId },
  } = useRouter()

  const { userInfoData } = useGetUserInfo()

  const { poolData } = usePool(Number(poolId))
  const { poolPaymentPlanData } = useGetPoolPaymentPlan({
    poolId: Number(poolId),
  })

  // by_grid
  const { gridsData } = useGrids({
    poolId: poolData?.payment_plan.type === 'by_grid' ? poolData.id : undefined,
  })

  if (!poolData || !userInfoData || !poolPaymentPlanData.length) return null

  const realWallet = userInfoData.wallets.find((item) => item.type === 'real')

  const paymentType = poolData.payment_plan.type
  const upperUnitLimit = poolData.payment_plan.upper_unit_limit ?? 0

  return (
    <div className={styles.wrapper}>
      <div className={styles.paymentInfoWrapper}>
        <div className={styles.paymentInfoText}>
          <h1>Payment</h1>
          {poolData.payment_plan.type === 'by_grid' ? (
            <>
              <p>
                Grids will be locked once 10 squares have been picked until
                payment is made. Please be aware that all sales are final, so
                please <span>only pay for the grids</span> you need. If you have
                grids that you don&apos;t need, they can be deleted from the
                grid settings page.
              </p>

              <p>
                After you pay for {upperUnitLimit},{' '}
                <span>the grids are on us!</span> That&apos;s right, make
                payment for {upperUnitLimit} grids and run as many as you&apos;d
                like after that with no charge (some restrictions apply*).
              </p>
            </>
          ) : poolData.payment_plan.cost_per_unit === 0 ? (
            <>
              <p>
                Your pool is currently {poolData.payment_plan.upper_unit_limit}{' '}
                entries or less, which means{' '}
                <span className={styles.accent}>PAYMENT IS OPTIONAL!</span>
              </p>
              <p>
                If you wish to remove potential ads, or if you continue to add
                entries throughout the season and go over{' '}
                {poolData.payment_plan.upper_unit_limit} entries, the fee
                structure below will apply.
              </p>
            </>
          ) : (
            <p>
              You can pay for the number of entries after reading the plans and
              proceed with the payment
            </p>
          )}
          {}
        </div>

        <div className={styles.paymentInfo}>
          <div className={styles.actualBalanceWrapper}>
            <p className={styles.actualBalance}>
              ${realWallet ? leadToMonetaryDivision(realWallet.amount) : '0.00'}
            </p>
            <p className={styles.actualBalanceText}>Actual balance</p>

            <Link
              href={routes.account.replenish({
                page: 'payment',
                poolId: Number(poolId),
              })}
            >
              <button className="button button-blue-light-outline">
                Replenish
              </button>
            </Link>
          </div>
          <div>
            <p className={styles.poolName}>{poolData.name}</p>

            <div className={styles.infoBlock}>
              <div>
                <p>Pool ID:</p>
                <p>{poolData.id}</p>
              </div>
              {paymentType === 'by_grid' ? (
                <>
                  <div>
                    <p>Current Grids:</p>
                    <p>{gridsData.length}</p>
                  </div>

                  <div>
                    <p>Grids Paid For:</p>
                    <p>{poolData.payed_units}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p>Current Entry Count:</p>
                    <p>{poolData.entries_count}</p>
                  </div>

                  <div>
                    <p>Entries Paid For:</p>
                    <p>{poolData.payed_units}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        {paymentType === 'by_entry' && (
          <PaymentByEntryLazy
            poolPaymentPlanData={poolPaymentPlanData}
            poolData={poolData}
          />
        )}

        {paymentType === 'fixed' && (
          <PaymentFixedLazy
            paymentPlan={poolData.payment_plan}
            poolId={Number(poolId)}
          />
        )}

        {paymentType === 'by_grid' && (
          <div className={styles.byGridWrapper}>
            <PaymentByGridLazy
              poolData={poolData as unknown as Pool<'squares'>}
            />
            <p>
              * Grids must all be created under the same pool ID. There is a
              maximum of 30 grids per pool.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
