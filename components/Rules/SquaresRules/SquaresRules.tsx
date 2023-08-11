import Image from 'next/image'

import { cup, pickSquares, selectSquares } from '@/assets/img'

import styles from './SquaresRules.module.scss'

export function SquaresRules() {
  return (
    <>
      <div className={styles.squares}>
        <Image
          src={pickSquares.src}
          width={pickSquares.width}
          height={pickSquares.height}
          alt="Pick"
        />
        <p>Сlick on a square in the grid</p>
      </div>

      <div className={styles.squares2}>
        <Image
          src={selectSquares.src}
          width={selectSquares.width}
          height={selectSquares.height}
          alt="Select"
        />
        <p>
          <br /> Wait for the match result and score distribution in the grid
        </p>
      </div>

      <div className={styles.squares3}>
        <Image src={cup.src} width={cup.width} height={cup.height} alt="Cup" />
        <p>Compete with your friends and take first place</p>
      </div>
    </>
  )
}
