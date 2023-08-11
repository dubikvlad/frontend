import { QARule1, QARule2, QARule3 } from '@/assets/icons'

import styles from './QARules.module.scss'

export function QARules() {
  return (
    <>
      <div className={styles.rule1}>
        <QARule1 />
        <p>Select a team and set the game total score</p>
      </div>

      <div className={styles.rule2}>
        <QARule2 />
        <p>You get points for a guess match outcome and score</p>
      </div>

      <div className={styles.rule3}>
        <QARule3 />
        <p>Wait for results and win first place</p>
      </div>
    </>
  )
}
