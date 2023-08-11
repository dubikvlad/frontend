import React, { memo } from 'react'

import { Star } from '@/assets/icons'
import { getShortName } from '@/config/constants'

import styles from './EntryUserIcon.module.scss'

type EntryUserIconProps = {
  isCurrentUser: boolean
  color: string
  userName: string
}

export default memo(function EntryUserIcon({
  isCurrentUser,
  color,
  userName,
}: EntryUserIconProps) {
  return (
    <div className={styles.itemNameWrap}>
      {isCurrentUser ? (
        <Star className={styles.star} />
      ) : (
        <div className={styles.itemName} style={{ backgroundColor: color }}>
          {getShortName(userName).toUpperCase()}
        </div>
      )}
    </div>
  )
})
