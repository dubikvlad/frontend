import React from 'react'

import { PoolData } from '@/api'
import { CheckMark, Cross } from '@/assets/icons'
import { useOpenModal } from '@/contexts'
import { useCopyToClipboard } from '@/helpers'

import styles from './DashboardMembershipDetails.module.scss'

export function DashboardMembershipDetails({ pool }: { pool: PoolData }) {
  const { copyToClipboard, copiedToClipboard, showCheck } = useCopyToClipboard()
  const { closeModal } = useOpenModal()

  return (
    <div className={styles.entrySettingsDetails}>
      <div className={styles.close} onClick={closeModal}>
        <Cross width={14} height={14} stroke="var(--text-color)" />
      </div>
      <div className={styles.detailsData}>
        <div className={styles.detailsTitle}>Membership Details</div>
        <div className={styles.detailsInfo}>
          <p>Membership ID:</p>
          <p>{pool.membership_id}</p>
        </div>
        <div className={styles.detailsInfo}>
          <p>Join Date:</p>
          <p>
            {new Date(pool.join_date).toLocaleDateString().split('.').join('/')}
          </p>
        </div>
        <div className={styles.detailsInfo}>
          <p>Pool ID:</p>
          <p>{pool.id}</p>
        </div>
      </div>
      <div className={styles.detailsData}>
        <div className={styles.detailsInfo}>
          <p>Pool Commissioner:</p>
          <p>
            {pool.owner?.first_name} {pool.owner?.last_name}
          </p>
        </div>
        <div className={styles.detailsInfoWrapper}>
          <div className={styles.detailsInfo}>
            <p>Commissioner Email:</p>
            <p>{pool.owner?.email}</p>
          </div>

          <div
            className={styles.detailsCopy}
            onClick={() => copyToClipboard(pool.owner.email)}
          >
            {!showCheck && !copiedToClipboard ? <>copy</> : <></>}

            {copiedToClipboard ? <CheckMark /> : <></>}
          </div>
        </div>
      </div>
    </div>
  )
}
