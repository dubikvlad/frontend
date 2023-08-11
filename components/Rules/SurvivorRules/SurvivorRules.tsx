import Image from 'next/image'

import { resultsSurvivor, pickSurvivor, selectSurvivor } from '@/assets/img'

import styles from './SurvivorRules.module.scss'

export function SurvivorRules() {
  return (
    <>
      <div className={styles.survivor}>
        <Image
          src={pickSurvivor.src}
          width={pickSurvivor.width}
          height={pickSurvivor.height}
          alt="Survivor"
        />
        <p>
          You pick one team
          <br /> to win each week
        </p>
      </div>

      <div className={styles.survivor2}>
        <Image
          src={selectSurvivor.src}
          width={selectSurvivor.width}
          height={selectSurvivor.height}
          alt="Survivor 2"
        />
        <p>
          If they lose, you are <br /> eliminated
        </p>
      </div>

      <div className={styles.survivor3}>
        <Image
          src={resultsSurvivor.src}
          width={resultsSurvivor.width}
          height={resultsSurvivor.height}
          alt="Survivor 3"
        />
        <p>Be the last survivor and win the pool</p>
      </div>
    </>
  )
}
