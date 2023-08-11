import { GolfPickXRule1, GolfPickXRule2, GolfPickXRule3 } from '@/assets/icons'

import styles from './GolfPickXRules.module.scss'

export function GolfPickXRules() {
  return (
    <>
      <div className={styles.rule1}>
        <GolfPickXRule1 />
        <p>Pick golfer(s) from the tournament field</p>
      </div>

      <div className={styles.rule2}>
        <GolfPickXRule2 />
        <p>
          Get overall winnings from the golfer selected in a given tournament
        </p>
      </div>

      <div className={styles.rule3}>
        <GolfPickXRule3 />
        <p>Compete with your friends and take first place</p>
      </div>
    </>
  )
}
