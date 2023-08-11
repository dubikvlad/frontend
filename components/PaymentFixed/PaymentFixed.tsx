import Link from 'next/link'

import { PaymentPlan } from '@/api'
import { leadToMonetaryDivision, routes } from '@/config/constants'

import styles from './PaymentFixed.module.scss'

type PaymentFixedProps = {
  paymentPlan: PaymentPlan
  poolId: number
}

export function PaymentFixed({ paymentPlan, poolId }: PaymentFixedProps) {
  const price = leadToMonetaryDivision(paymentPlan.cost_per_unit)

  return (
    <div className={styles.wrapper}>
      <div className={styles.fixedPriceWrapper}>
        <p className={styles.fixedText}>Fixed</p>
        <p className={styles.price}>${price}</p>
        <p className={styles.perPoolText}>per pool</p>
      </div>

      <div className={styles.submitAndTotalWrapper}>
        <div className={styles.submitPaymentText}>
          Submit Payment for 1 pool
        </div>

        <div className={styles.totalWrapper}>
          <p className={styles.totalText}>Total:</p>
          <p className={styles.totalPrice}>${price}</p>

          <Link
            className={styles.link}
            href={routes.account.commish.payPoolFee(poolId, {
              quantity: String(paymentPlan.lower_unit_limit),
              price: String(paymentPlan.cost_per_unit),
            })}
          >
            <button className="button button-blue-light">Purchase now</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
