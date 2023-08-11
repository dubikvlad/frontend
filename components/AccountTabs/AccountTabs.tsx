import classNames from 'classnames'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import styles from './AccountTabs.module.scss'

type AccountTabsProps = {
  tabsData: readonly string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isActive: any
  setIsActive: Dispatch<SetStateAction<AccountTabsProps['isActive']>>
}

export function AccountTabs({
  tabsData,
  isActive,
  setIsActive,
}: AccountTabsProps) {
  const ulRef = useRef<HTMLUListElement>(null)
  const [isShowBlur, setIsShowBlur] = useState<boolean>(false)

  useEffect(() => {
    if (ulRef.current) {
      setIsShowBlur(ulRef.current.clientWidth < ulRef.current.scrollWidth)
    }
  }, [ulRef])

  return (
    <div
      className={classNames(styles.accountTabsWrapper, {
        [styles.blur]: isShowBlur,
      })}
    >
      <ul className={styles.accountTabsList} ref={ulRef}>
        {tabsData.map((title, i) => (
          <li
            key={i}
            className={classNames({ [styles.active]: title === isActive })}
            onClick={() => setIsActive(title)}
            tabIndex={0}
          >
            {title}
          </li>
        ))}
      </ul>
    </div>
  )
}
