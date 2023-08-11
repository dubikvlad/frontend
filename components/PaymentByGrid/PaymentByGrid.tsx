import classNames from 'classnames'
import Link from 'next/link'
import { useState } from 'react'

import { Pool } from '@/api'
import { leadToMonetaryDivision, routes } from '@/config/constants'
import { Input } from '@/features/ui'

import styles from './PaymentByGrid.module.scss'

export function PaymentByGrid({ poolData }: { poolData: Pool<'squares'> }) {
  const paymentPlan = poolData.payment_plan
  const costPerGrid = paymentPlan.cost_per_unit

  const [numberGrids, setNumberGrids] = useState(0)

  const upperUnitLimit =
    (paymentPlan.upper_unit_limit ?? 0) - poolData.payed_units

  return (
    <div className={styles.wrapper}>
      <div className={styles.costWrapper}>
        <p className={styles.fixedText}>Fixed</p>
        <p className={styles.cost}>${leadToMonetaryDivision(costPerGrid)}</p>
        <p className={styles.perGridText}>per grid</p>
      </div>

      {!upperUnitLimit ? (
        <div className={styles.payedWrapper}>
          <p>
            You have paid <span>the maximum number of grids (30)</span>{' '}
            available for this pool. Enjoy your grids with your friends!
          </p>
          <p>
            You can go to the{' '}
            <Link href={routes.account.gridControl(poolData.id)}>
              All Grids page
            </Link>
          </p>
        </div>
      ) : (
        <div className={styles.paymentWrapper}>
          <div className={styles.paymentBlock}>
            <p>Submit Payment for</p>
            <Input
              className={styles.paymentInput}
              type="number"
              value={String(numberGrids)}
              onChange={(value) =>
                setNumberGrids(
                  Number(value) > upperUnitLimit
                    ? upperUnitLimit
                    : Number(value),
                )
              }
            />
            <p>grids</p>
          </div>

          <div className={styles.totalBlock}>
            <p className={styles.totalText}>Total:</p>
            <p className={styles.total}>
              ${leadToMonetaryDivision(costPerGrid * numberGrids)}
            </p>

            <Link
              className={classNames(styles.link, {
                [styles.linkDisabled]: !numberGrids,
              })}
              href={routes.account.commish.payPoolFee(poolData.id, {
                quantity: String(numberGrids),
                price: (costPerGrid * numberGrids).toFixed(2),
              })}
            >
              <button className="button button-blue-light">Purchase now</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
