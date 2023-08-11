import classNames from 'classnames'
import { useRouter } from 'next/router'

import { ShowRulesArrow, Cross } from '@/assets/icons'
import { useAccount } from '@/contexts'
import { usePool } from '@/helpers'

import styles from './AccountShowRules.module.scss'

export default function AccountShowRules() {
  const {
    query: { poolId },
  } = useRouter()

  const { rulesIsOpen, setRulesIsOpen } = useAccount()
  const { poolData } = usePool(Number(poolId))

  return (
    <div
      className={classNames(styles.rulesWrapper, {
        [styles.small]: !rulesIsOpen,
      })}
    >
      <p
        className={classNames(styles.poolName, {
          [styles.poolNameHide]: !rulesIsOpen,
        })}
      >
        {poolData?.name ?? 'Pool'}
      </p>

      <div
        className={styles.showRules}
        onClick={() => setRulesIsOpen(!rulesIsOpen)}
      >
        <p className={styles.rulesTextWrapper}>
          <span>{rulesIsOpen ? 'Hide rules' : 'Show rules'}</span>
        </p>

        <div className={styles.iconWrapper}>
          {rulesIsOpen ? (
            <Cross className={styles.iconCross} />
          ) : (
            <ShowRulesArrow className={styles.iconArrow} />
          )}
        </div>
      </div>
    </div>
  )
}
