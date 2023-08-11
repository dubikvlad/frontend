import {
  GolfSquaresRule1,
  GolfSquaresRule2,
  GolfSquaresRule3,
} from '@/assets/icons'

import styles from './GolfSquaresRules.module.scss'

export function GolfSquaresRules() {
  return (
    <>
      <div className={styles.rule1}>
        <GolfSquaresRule1 />
        <p>Сlick on a square in the grid</p>
      </div>

      <div className={styles.rule2}>
        <GolfSquaresRule2 />
        <p>Wait for the match result and score distribution in the grid</p>
      </div>

      <div className={styles.rule3}>
        <GolfSquaresRule3 />
        <p>Compete with your friends and take first place</p>
      </div>
    </>
  )
}
