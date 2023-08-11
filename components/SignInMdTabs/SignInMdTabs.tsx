import classNames from 'classnames'
import React from 'react'

import styles from './SignInMdTabs.module.scss'

const tabs = {
  'sign-up': 'Sign up',
  'sign-in': 'Sign in',
} as const

export const SignInMdTabs = ({
  active,
  openSignUpModal,
  openSignInModal,
}: {
  active: keyof typeof tabs
  openSignUpModal?: () => void
  openSignInModal?: () => void
}) => {
  return (
    <div className={styles.tabs}>
      {Object.entries(tabs).map(([key, value]) => (
        <div
          key={key}
          className={classNames(styles.tab, {
            [styles.active]: active === key,
          })}
          onClick={() => {
            if (key === 'sign-up' && openSignUpModal) {
              openSignUpModal()
            }
            if (key === 'sign-in' && openSignInModal) {
              openSignInModal()
            }
          }}
        >
          {value}
        </div>
      ))}
    </div>
  )
}
