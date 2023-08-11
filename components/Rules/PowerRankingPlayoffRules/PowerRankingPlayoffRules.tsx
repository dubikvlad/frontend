import {
  OverviewPowerRankingRule1,
  OverviewPowerRankingRule2,
  OverviewPowerRankingRule3,
} from '@/assets/icons'

import styles from './PowerRankingPlayoffRules.module.scss'

export function PowerRankingPlayoffRules() {
  return (
    <>
      <div className={styles.rule1}>
        <OverviewPowerRankingRule1 />
        <p>Pick a teams you think will win before the deadline</p>
      </div>

      <div className={styles.rule2}>
        <OverviewPowerRankingRule2 />
        <p>You score points equal to your picked team&apos;s points</p>
      </div>

      <div className={styles.rule3}>
        <OverviewPowerRankingRule3 />
        <p>Compete with your friends and take first place</p>
      </div>
    </>
  )
}
