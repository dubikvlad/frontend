import classNames from 'classnames'
import { ReactNode, useEffect, useState } from 'react'
import { useRef } from 'react'

import { Info } from '@/assets/icons'

import styles from './InfoContainer.module.scss'

type InfoContainerProps = {
  iconHeight?: number
  children: ReactNode
  withInfo?: boolean
}

export function InfoContainer({
  iconHeight = 16,
  children,
  withInfo = false,
}: InfoContainerProps) {
  const notificationRef = useRef<HTMLDivElement>(null)

  const [isLefty, setIsLefty] = useState<boolean>(false)

  function setNotificationPosition() {
    if (!notificationRef.current) return

    const documentWidth = document.documentElement.clientWidth

    const leftPos = notificationRef.current.getBoundingClientRect().left
    const width = notificationRef.current.offsetWidth

    setIsLefty(leftPos + width > documentWidth)
  }

  useEffect(() => {
    if (!isLefty) setNotificationPosition()
  }, [notificationRef, children, isLefty])

  useEffect(() => {
    window.addEventListener('resize', setNotificationPosition)
    return () => window.removeEventListener('scroll', setNotificationPosition)
  }, [])

  return (
    <div className={styles.wrapper}>
      <Info className={styles.icon} height={iconHeight} />
      <div
        className={classNames(styles.notification, {
          [styles.lefty]: isLefty,
        })}
        ref={notificationRef}
      >
        {withInfo && <p className={styles.info}>instruction</p>}
        {children}
      </div>
    </div>
  )
}
