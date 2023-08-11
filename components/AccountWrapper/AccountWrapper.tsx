import classNames from 'classnames'

import { Sidebar } from '@/features/components/Sidebar'
import { useAdaptiveBreakpoints } from '@/helpers'

import styles from './AccountWrapper.module.scss'

import type { ReactNode } from 'react'

type AccountWrapperProps = { children: ReactNode }

export default function AccountWrapper({ children }: AccountWrapperProps) {
  const { isBreakpointPassed } = useAdaptiveBreakpoints(['md'])

  const isMdBreakpointPassed = isBreakpointPassed('md')

  return (
    <div
      className={classNames(styles.accountWrapper, {
        [styles.mobile]: isMdBreakpointPassed,
      })}
    >
      {!isMdBreakpointPassed && <Sidebar />}
      {children}
    </div>
  )
}
