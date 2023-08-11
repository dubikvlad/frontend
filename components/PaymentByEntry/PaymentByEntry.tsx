import classNames from 'classnames'
import Link from 'next/link'
import { useState } from 'react'

import { PaymentPlan, Pool } from '@/api'
import { leadToMonetaryDivision, routes } from '@/config/constants'
import { Input } from '@/features/ui'

import styles from './PaymentByEntry.module.scss'

type PaymentByEntryProps = {
  poolPaymentPlanData: PaymentPlan[]
  poolData: Pool
}

export function PaymentByEntry({
  poolPaymentPlanData,
  poolData,
}: PaymentByEntryProps) {
  const payedUnits = poolData.payed_units

  const [entriesCount, setEntriesCount] = useState('1')

  function calculateData(item: PaymentPlan) {
    // максимальный лимит категории (может быть null)
    const upperUnitLimit = item.upper_unit_limit ?? Infinity

    // введенное пользоваетелем кол-во энтрисов
    const introducedEntryCount = Number(entriesCount)

    // текущее кол-во оплаченных энтрисов для данной категории
    const entriesPaid =
      payedUnits > upperUnitLimit
        ? upperUnitLimit - (item.lower_unit_limit - 1)
        : payedUnits >= item.lower_unit_limit - 1
        ? payedUnits - (item.lower_unit_limit - 1)
        : 0

    // максимальное возможное кол-во оплачиваемых энтрисов для данной категории
    const maxEntriesCount = item.upper_unit_limit
      ? item.upper_unit_limit - item.lower_unit_limit + 1 - entriesPaid
      : Infinity

    const countEntries =
      introducedEntryCount > maxEntriesCount
        ? maxEntriesCount
        : payedUnits + introducedEntryCount >= item.lower_unit_limit &&
          payedUnits + introducedEntryCount <= upperUnitLimit
        ? payedUnits +
          introducedEntryCount -
          item.lower_unit_limit +
          1 -
          entriesPaid
        : 0

    const total = countEntries * item.cost_per_unit

    return { entriesPaid, countEntries, total, maxEntriesCount }
  }

  const total = poolPaymentPlanData.reduce(
    (acc, item) => (acc += calculateData(item).total),
    0,
  )

  return (
    <div className={styles.paymentBlock}>
      <div className={styles.submitPayment}>
        <p>Submit Payment for </p>
        <Input
          type="number"
          value={entriesCount}
          onChange={(value) =>
            setEntriesCount(Number(value) > 9999 ? '9999' : value)
          }
          placeholder="0"
        />
        <p>entries</p>
      </div>

      <div className={styles.paymentCalc}>
        {poolPaymentPlanData.map((item, i) => {
          const data = calculateData(item)

          return (
            <div key={i} className={styles.paymentCalcItem}>
              <p className={styles.paymentCalcItemTitle}>{item.name}</p>

              <div className={styles.paymentCalcItemPriceBlock}>
                <p>${leadToMonetaryDivision(item.cost_per_unit)}</p>
                <p>per entry</p>
              </div>

              {!!data.maxEntriesCount && (
                <div className={styles.entriesInfoWrapper}>
                  <p className={styles.entriesPaidText}>
                    {data.entriesPaid ? `${data.entriesPaid} Entries paid` : ''}
                  </p>
                  <p className={styles.paymentCalcItemEntriesCount}>
                    +{data.countEntries} entries
                  </p>
                </div>
              )}

              <div className={styles.paymentCalcItemTotalBlock}>
                {data.maxEntriesCount === 0 ? (
                  <p className={styles.upperUnitLimitText}>
                    {data.entriesPaid} entries paid
                  </p>
                ) : (
                  <>
                    <p>Total</p>
                    <p>+${data.total.toFixed(2)}</p>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.totalBlock}>
        <p className={styles.totalText}>Total:</p>
        <p className={styles.totalValue}>${leadToMonetaryDivision(total)}</p>
        <Link
          className={classNames({ [styles.linkDisabled]: total === 0 })}
          href={routes.account.commish.payPoolFee(poolData.id, {
            quantity: entriesCount,
            price: total.toFixed(2),
          })}
        >
          <button
            className={classNames('button', 'button-blue-light', {
              disabled: total === 0,
            })}
          >
            Purchase now
          </button>
        </Link>
      </div>
    </div>
  )
}
