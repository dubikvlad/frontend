import { MajorsRule1, MajorsRule2, MajorsRule3 } from '@/assets/icons'

import styles from './MajorsRules.module.scss'

export function MajorsRules() {
  return (
    <>
      <div className={styles.rule1}>
        <MajorsRule1 />
        <p>Choose one golfer from each Tier</p>
      </div>

      <div className={styles.rule2}>
        <MajorsRule2 />
        <p>Form your team of 6 golfers</p>
      </div>

      <div className={styles.rule3}>
        <MajorsRule3 />
        <p>Compete with your friends and take first place</p>
      </div>
    </>
  )
}
