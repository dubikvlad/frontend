import { XRunRule1, XRunRule2, XRunRule3 } from '@/assets/icons'

import styles from './XRunRules.module.scss'

export function XRunRules() {
  return (
    <>
      <div className={styles.rule1}>
        <XRunRule1 />
        <p>A commissioner assigns a pool team</p>
      </div>

      <div className={styles.rule2}>
        <XRunRule2 />
        <p>Wait for your team to score 33 points</p>
      </div>

      <div className={styles.rule3}>
        <XRunRule3 />
        <p>Wait for results and win first place</p>
      </div>
    </>
  )
}
