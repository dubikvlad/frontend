import Image from 'next/image'

import { OverviewCreditsRule1, OverviewCreditsRule2 } from '@/assets/icons'
import { cup } from '@/assets/img'

import styles from './CreditsRules.module.scss'

export function CreditsRules() {
  return (
    <>
      <div className={styles.rule1}>
        <OverviewCreditsRule1 />
        <p>Choose a team and place credits on it</p>
      </div>

      <div className={styles.rule2}>
        <OverviewCreditsRule2 />
        <p>Depending on game results, your credits change</p>
      </div>

      <div className={styles.cup}>
        <Image src={cup.src} width={cup.width} height={cup.height} alt="Cup" />
        <p>Compete with your friends and take first place</p>
      </div>
    </>
  )
}
