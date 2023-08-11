import { XRunMLBRule1, XRunMLBRule2, XRunMLBRule3 } from '@/assets/icons'

import styles from './XRunMLBRules.module.scss'

export function XRunMLBRules() {
  return (
    <>
      <div className={styles.rule1}>
        <XRunMLBRule1 />
        <p>A commissioner assigns a pool team</p>
      </div>

      <div className={styles.rule2}>
        <XRunMLBRule2 />
        <p>Wait for your team to score 13 points</p>
      </div>

      <div className={styles.rule3}>
        <XRunMLBRule3 />
        <p>Wait for results and win first place</p>
      </div>
    </>
  )
}
