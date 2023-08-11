import { Preloader } from '@/assets/icons'

import styles from './AccountPagePreloader.module.scss'

export function AccountPagePreloader() {
  return (
    <div className={styles.loadingWrapper}>
      <Preloader className={styles.preloader} />
    </div>
  )
}
