import Image from 'next/image'
import React from 'react'

import { cup, bracket, bracketPick } from '@/assets/img'

import styles from './BracketRules.module.scss'

export function BracketRules() {
  return (
    <>
      <div className={styles.pick}>
        <Image
          src={bracket.src}
          width={bracket.width}
          height={bracket.height}
          alt="Bracket"
        />
        <p>Select teams starting with Wild Cards</p>
      </div>

      <div className={styles.select}>
        <Image
          src={bracketPick.src}
          width={bracketPick.width}
          height={bracketPick.height}
          alt="Select"
        />
        <p>
          Fill in the playoff
          <br /> bracket in full
        </p>
      </div>

      <div className={styles.cup}>
        <Image src={cup.src} width={cup.width} height={cup.height} alt="Cup" />
        <p>
          Wait for results and <br /> win first place
        </p>
      </div>
    </>
  )
}
