import classNames from 'classnames'
import { useRouter } from 'next/router'

import { StartPoolStep1, StartPoolStep2, StartPoolStep3 } from '@/assets/icons'
import { routes } from '@/config/constants'
import { useAdaptiveBreakpoints } from '@/helpers'

import styles from './StartNewPoolDescription.module.scss'

const steps = [
  {
    id: 1,
    title: 'Step 1',
    icon: StartPoolStep1,
    text: 'Select a type of the pool you wish to create',
  },
  {
    id: 2,
    title: 'Step 2',
    icon: StartPoolStep2,
    text: 'Define specific settings related to your pool',
  },
  {
    id: 3,
    title: 'Step 3',
    icon: StartPoolStep3,
    text: 'Invite your friends and members to join the pool',
  },
]

export function StartNewPoolDescription({
  activeStep = 1,
}: {
  activeStep: 1 | 2 | 3
}) {
  const { asPath } = useRouter()
  const { isBreakpointPassed } = useAdaptiveBreakpoints(['sm'])

  const isSmBreakpointPassed = isBreakpointPassed('sm')

  if (isSmBreakpointPassed && asPath !== routes.poolCreating.index) return null

  return (
    <div className={styles.descriptionWrapper}>
      <div className={styles.titleWrapper}>
        <h1>Start a new pool</h1>
        <p>
          Select the sport and game type of the pool you want to run below.
          Follow instructions for best results. Select the sport and game type
          of the pool you want to run below. Follow instructions for best
          results
        </p>
      </div>

      {!isSmBreakpointPassed && (
        <div className={styles.cardsWrapper}>
          {steps.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.id}
                className={classNames(styles.card, {
                  [styles.activeStep]: activeStep === item.id,
                })}
              >
                <p className={styles.title}>{item.title}</p>
                <Icon />
                <p className={styles.text}>{item.text}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
