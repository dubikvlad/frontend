import Link from 'next/link'
import { useRouter } from 'next/router'

import { CreditCard } from '@/assets/icons'
import { leadToMonetaryDivision, routes } from '@/config/constants'
import { useGetUserInfo, useGrids, usePool } from '@/helpers'

import styles from './PaymentRequiredPage.module.scss'

export function PaymentRequiredPage() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  const { userInfoData } = useGetUserInfo()
  const { gridsData } = useGrids({
    poolId: poolData?.payment_plan.type === 'by_grid' ? poolData.id : undefined,
  })

  if (!poolData) return null

  const paymentPlanType = poolData.payment_plan.type

  const link =
    paymentPlanType === 'fixed'
      ? routes.account.commish.payPoolFee(poolData.id, {
          quantity: String(poolData.payment_plan.lower_unit_limit),
          price: String(poolData.payment_plan.cost_per_unit),
        })
      : routes.account.commish.payment(poolData.id)

  const upperUnitLimit = poolData.payment_plan.upper_unit_limit

  const actualBalance = userInfoData
    ? userInfoData.wallets.reduce((sum, item) => (sum += item.amount), 0)
    : 0

  const numberUnpaidGrids =
    gridsData.length && upperUnitLimit
      ? gridsData.length <= upperUnitLimit - poolData.payed_units
        ? gridsData.length
        : upperUnitLimit - poolData.payed_units
      : 0

  const costPerUnit = leadToMonetaryDivision(
    poolData.payment_plan.cost_per_unit,
  )

  return (
    <div className={styles.wrapper}>
      <h1>Payment required</h1>

      <div className={styles.paymentWrapper}>
        <div className={styles.poolInfoWrapper}>
          <CreditCard />
          <p className={styles.poolType}>{poolData.pool_type.title}</p>

          <div className={styles.poolInfo}>
            <p>Pool Name:</p>
            <p>{poolData.name}</p>
            <p>Pool ID:</p>
            <p>{poolData.id}</p>
          </div>
        </div>

        <div className={styles.descriptionWrapper}>
          {paymentPlanType === 'by_entry' && (
            <>
              <p>
                Upool.us allows you to create{' '}
                <span>a certain number of entries</span> within your balance.
              </p>
              <p>
                We hope that by creating previous entries on our website, you
                and your pool users <span>appreciated all the pleasures</span>{' '}
                of using Upool.
              </p>
              <p>
                Unfortunately, you have run out of entries for your balance. To
                create more entries, you need to click on the{' '}
                <span>&apos;Purchase Now&apos;</span> button below.
              </p>
            </>
          )}

          {paymentPlanType === 'fixed' && (
            <>
              <p>
                Upool.us allows you to run your{' '}
                <span>{poolData.pool_type.title}</span> for five days from your
                calculation start date before payment is due. In order to
                continue running your pool, we require payment at this time.
              </p>

              <p>
                We hope, by completing this trial period, that you were able to
                appreciate the time saving aspects of this site. Your pool fee
                as <span>the Pool Commissioner</span>, you may pay now by
                clicking on the <span>&apos;Purchase Now&apos;</span> button
                below.
              </p>

              <p>
                <span>The fee</span> for continuing to run your pool{' '}
                <span>is ${costPerUnit}</span>
              </p>
            </>
          )}

          {paymentPlanType === 'by_grid' && (
            <>
              <p>
                You have a total of {gridsData.length} grids,{' '}
                {numberUnpaidGrids} of which are unpaid (
                <span>
                  {numberUnpaidGrids} grids at ${costPerUnit}
                </span>{' '}
                current balance is ${actualBalance}).
              </p>

              <p>
                Grids will be locked once 10 squares have been picked until
                payment is made. Please be aware that all sales are final, so
                please <span>only pay for the grids</span> you need. If you have
                grids that you don&apos;t need, they can be deleted from the
                grid settings page.
              </p>

              {upperUnitLimit && (
                <p>
                  After you pay for {upperUnitLimit},{' '}
                  <span>the grids are on us!</span> That&apos;s right, make
                  payment for {upperUnitLimit} grids and run as many as
                  you&apos;d like after that with no charge (some restrictions
                  apply*).
                </p>
              )}
            </>
          )}

          <div className={styles.buttonWrapper}>
            <p className={styles.mark}>
              {poolData.payment_plan.type === 'by_grid' &&
                `* Grids must all be created under the same pool ID. There is a
                maximum of 30 grids per pool.`}
            </p>
            <Link href={link} className={styles.link}>
              <button className="button button-blue-light">Purchase now</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
