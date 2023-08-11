import { PickSummaryGroup } from '@/api'

import { PickSummary } from './PickSummary'
import styles from './SidebarInfo.module.scss'

export function SidebarInfo({
  pickSummaryGroups,
  groupId,
  title
}: {
  pickSummaryGroups: PickSummaryGroup[] | null | undefined
  groupId: number
  title?: string
}) {
  return (
    <div className={styles.notificationWrapper}>
      {groupId ? (
        pickSummaryGroups && (
          <PickSummary
            group={pickSummaryGroups.find((item) => item.id === groupId)}
            title={title}
          />
        )
      ) : (
        <div className={styles.emptyInfo}>
          <p className={styles.emptyInfoTitle}>notification</p>
          <p>
            Please select the game from the playoff bracket you want to see the
            stats for
          </p>
        </div>
      )}
    </div>
  )
}
