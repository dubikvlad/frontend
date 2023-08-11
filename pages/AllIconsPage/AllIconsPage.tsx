import * as icons from '@/assets/icons'

import styles from './AllIconsPage.module.scss'

type Key = keyof typeof icons

export function AllIconsPage() {
  return (
    <div className={styles.wrapper}>
      {Object.keys(icons).map((key, i) => {
        const Icon = icons[key as Key]

        return (
          <div key={i}>
            <Icon />
            <p>{key}</p>
          </div>
        )
      })}
    </div>
  )
}
