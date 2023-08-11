import Image from 'next/image'

import { cup, pick, select } from '@/assets/img'

import styles from './PickemRules.module.scss'

export function PickemRules() {
  return (
    <>
      <div className={styles.pick}>
        <p className={styles.daysLeft}>02 days left</p>
        <Image
          src={pick.src}
          width={pick.width}
          height={pick.height}
          alt="Pick"
        />
        <p>Pick a teams you think will win before the deadline</p>
      </div>

      <div className={styles.select}>
        <Image
          src={select.src}
          width={select.width}
          height={select.height}
          alt="Select"
        />
        <p>
          You score points if your
          <br /> picks match the result
        </p>
      </div>

      <div className={styles.cup}>
        <Image src={cup.src} width={cup.width} height={cup.height} alt="Cup" />
        <p>Compete with your friends and take first place</p>
      </div>
    </>
  )
}
