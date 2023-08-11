import React from 'react'

import { Info } from '@/assets/icons'

import styles from './InfoRow.module.scss'

export function InfoRow({
  value,
  placeholder,
  toolTipTitle,
  toolTipContent,
}: {
  value?: string
  placeholder?: string
  toolTipTitle?: string
  toolTipContent?: string | string[]
}) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{placeholder}</div>
      <div className={styles.info}>
        <div
          dangerouslySetInnerHTML={{ __html: value || '' }}
          className={styles.text}
        />
        <div className={styles.tip}>
          <Info fill="#aeaeae" />

          <div className={styles.tooltip}>
            <div className={styles.tooltipTitle}>{toolTipTitle}</div>
            <div>{toolTipContent}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
