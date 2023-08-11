import Image from 'next/image'

import { OverviewMarginRule1, OverviewMarginRule2 } from '@/assets/icons'
import { cup } from '@/assets/img'

import styles from './MarginRules.module.scss'

export function MarginRules() {
  return (
    <>
      <div className={styles.rule1}>
        <OverviewMarginRule1 />
        <p>Pick a teams you think will win before the deadline</p>
      </div>

      <div className={styles.rule2}>
        <OverviewMarginRule2 />
        <p>You score points equal to your picked team&apos;s points</p>
      </div>

      <div className={styles.cup}>
        <Image src={cup.src} width={cup.width} height={cup.height} alt="Cup" />
        <p>Compete with your friends and take first place</p>
      </div>
    </>
  )
}
