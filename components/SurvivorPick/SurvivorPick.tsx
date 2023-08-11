import classNames from 'classnames'
import Image, { StaticImageData } from 'next/image'
import { useState } from 'react'

type TData = {
  title: string
  id: string
  icon: StaticImageData
  picked?: number
}

import styles from './SurvivorPick.module.scss'

export function SurvivorPick({ teamsArr }: { teamsArr: TData[] }) {
  const [activeId, setActiveId] = useState<null | string>(null)
  return (
    <div className={styles.container}>
      <div className={styles.title}>Game #1, 3:15 PM October 6 </div>
      {teamsArr.map((item, i) => (
        <div
          className={classNames(
            styles.item,
            {
              [styles.active]: activeId == item.id,
            },
            { [styles.disabled]: item.picked },
          )}
          onClick={() => {
            if (item?.picked) return

            if (activeId == null || activeId !== item.id) {
              setActiveId(item.id)
            } else setActiveId(null)
          }}
          key={i}
        >
          <div className={styles.vertical}>{i == 0 ? 'home' : 'away'}</div>
          <div className={styles.imgWrapper}>
            <Image
              src={item.icon.src}
              alt={item.title}
              width={64}
              height={64}
              className={styles.img}
            />
          </div>
          <div className={styles.itemTitle}>{item.title}</div>
          {item?.picked && (
            <div className={styles.add}>picked in week {item?.picked}</div>
          )}
        </div>
      ))}
    </div>
  )
}
