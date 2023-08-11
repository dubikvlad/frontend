import { useRouter } from 'next/router'

import { Lock2 } from '@/assets/icons'
import { usePool } from '@/helpers'

import styles from './TemporarilyLockedPage.module.scss'

export function TemporarilyLockedPage() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  if (!poolData) return null

  return (
    <div className={styles.wrapper}>
      <h1>Pool temporarily locked</h1>

      <div className={styles.temporarilyLockedWrapper}>
        <Lock2 />

        <div className={styles.description}>
          <p>
            Unfortunately, <span>your pool has been locked</span> until the
            commissioner pays for it. However, all of your picks and reports{' '}
            <span>are saved.</span>
          </p>
          <p>
            Please contact your commissioner via email{' '}
            <a href={`mailto:${poolData.owner.email}`} className={styles.email}>
              {poolData.owner.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
