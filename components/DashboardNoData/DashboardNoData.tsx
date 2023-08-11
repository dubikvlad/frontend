import classNames from 'classnames'
import getConfig from 'next/config'
import Link from 'next/link'
import { useRouter } from 'next/router'
import qs from 'qs'
import { Dispatch, SetStateAction, useState } from 'react'

import { api } from '@/api'
import { routes } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { USER_MODAL_TYPES } from '@/features/modals'
import { DashboardPageTabs } from '@/features/pages/DashboardPage'
import { Input } from '@/features/ui'
import { useAdaptiveBreakpoints, useGetUser } from '@/helpers'

import styles from './DashboardNoData.module.scss'

const {
  publicRuntimeConfig: { appUrl },
} = getConfig()

export function DashboardNoData({
  activeTab,
  setActiveTab,
}: {
  activeTab: DashboardPageTabs
  setActiveTab: Dispatch<SetStateAction<DashboardPageTabs>>
}) {
  const { openModal } = useOpenModal()

  const Buttons = () => {
    switch (activeTab) {
      case 'my pools':
        return <MyPoolsBtns setActiveTab={setActiveTab} />
      case 'join a pool':
        return <JoinAPoolBtns />
      default:
        return <></>
    }
  }

  if (activeTab === 'archived') {
    return <div className={styles.empty}>No Data</div>
  }

  return (
    <>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>GET IN THE GAME!</h2>
        <p className={styles.intro}>
          It seems you don&apos;t have any active pools at the moment. But
          that&apos;s okay! You can create a new pool or join an existing one
          and try UPool.
        </p>
        <div
          className={classNames(styles.buttons, {
            [styles.isJoinTab]: activeTab === 'join a pool',
          })}
        >
          <Buttons />
        </div>
        <div className={styles.or}>or</div>
        <p className={styles.intro2}>
          Invite your friends to UPool to create more connections. (The more
          connections you have, the more likely it is you&apos;ll see public
          pools that other commissioners are running)
        </p>

        <div className={styles.inviteBtnWrap}>
          <button
            className={classNames('button button-white-outline', styles.button)}
            onClick={() => openModal({ type: USER_MODAL_TYPES.INVITE_MEMBERS })}
          >
            INVITE
          </button>
        </div>
      </div>
    </>
  )
}

function MyPoolsBtns({
  setActiveTab,
}: {
  setActiveTab: Dispatch<SetStateAction<DashboardPageTabs>>
}) {
  return (
    <>
      <Link href={routes.poolCreating.index} passHref>
        <button
          className={classNames('button button-blue-light', styles.button)}
        >
          START NEW POOL
        </button>
      </Link>

      <button
        className={classNames('button button-blue-light', styles.button)}
        onClick={() => setActiveTab('join a pool')}
      >
        JOIN A POOL
      </button>
    </>
  )
}

function JoinAPoolBtns() {
  const { push } = useRouter()
  const { userData } = useGetUser()
  const { breakpoint } = useAdaptiveBreakpoints(['sm'])

  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isValidString =
    value.includes(`${appUrl}/attach`) &&
    value.includes('pool_id') &&
    value.includes('password')

  async function joinPool() {
    if (!userData) return

    try {
      setIsLoading(true)

      const { pool_id, password } = qs.parse(value.split('?')[1])

      const res = await api.pools.join({
        pool_id: Number(pool_id),
        code: String(password),
        name: `${userData.username} #1`,
      })

      if (!res.error) push(routes.account.overview(Number(pool_id)))
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
    }
  }

  if (breakpoint === 'sm') {
    return (
      <>
        <Input
          placeholder="Join Link"
          value={value}
          onChange={setValue}
          withLabel
        />

        <button
          className={classNames('button button-blue-light', styles.joinBtnSm, {
            disabled: !isValidString || isLoading,
          })}
          onClick={joinPool}
        >
          JOIN
        </button>
      </>
    )
  }

  return (
    <>
      <div className={styles.inputWrapper}>
        <Input
          placeholder="Join Link"
          value={value}
          onChange={setValue}
          withLabel
        />
        <div className={styles.buttonWrapper}>
          <button
            className={classNames('button button-blue-light', styles.button, {
              disabled: !isValidString || isLoading,
            })}
            onClick={joinPool}
          >
            JOIN
          </button>
        </div>
      </div>
    </>
  )
}
