import React, { useState } from 'react'

import { CheckMark, Cross } from '@/assets/icons'

import styles from './SubmitText.module.scss'

export function SubmitText({
  onSubmit,
  children,
  color,
}: {
  onSubmit: () => void
  children: string
  color: `#${string[6]}`
}) {
  const [toSubmit, setToSubmit] = useState(false)

  const handleSubmitClick = () => {
    onSubmit()
    setToSubmit(false)
  }

  if (toSubmit)
    return (
      <div className={styles.buttons}>
        <div className={styles.button} onClick={handleSubmitClick}>
          <CheckMark />
        </div>
        <div className={styles.button} onClick={() => setToSubmit(false)}>
          <Cross stroke="#909090" />
        </div>
      </div>
    )

  return (
    <div
      className={styles.submitText}
      style={{ color: color }}
      onClick={() => setToSubmit(true)}
    >
      {children}
    </div>
  )
}
