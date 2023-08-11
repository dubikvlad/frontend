import Link from 'next/link'
import { useRouter } from 'next/router'

import { Cross } from '@/assets/icons'
import { routes } from '@/config/constants'
import { useOpenModal } from '@/contexts'

import styles from './MakePickSuccessNotification.module.scss'

export function MakePickSuccessNotification() {
  const {
    query: { poolId },
  } = useRouter()

  const { closeModal } = useOpenModal()

  return (
    <div className={styles.wrapper}>
      <div onClick={closeModal}>
        <Cross className={styles.cross} />
      </div>

      <p className={styles.notificationText}>Notification</p>

      <p className={styles.title}>Success!</p>

      <div className={styles.textWrapper}>
        <p>
          You have made <span>Your Pick</span> on the path to success
        </p>
        <p>Keep up the good work!</p>
      </div>

      <div className={styles.buttonsWrapper}>
        <button className="button button-blue-outline" onClick={closeModal}>
          Continue making Picks
        </button>
        <Link href={routes.account.manageEntries(Number(poolId))}>
          <button className="button button-blue-light">Go to My Picks</button>
        </Link>
      </div>
    </div>
  )
}
