import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import {
  Overview,
  Reports,
  Picks,
  Settings,
  Account,
  CommishPageIcon,
  GridControl,
  MakeAPick,
  IviteAMember,
} from '@/assets/icons'
import { routes } from '@/config/constants'
import { useAccount, useOpenModal } from '@/contexts'
import { USER_MODAL_TYPES } from '@/features/modals'
import { useGetUser, usePool, useAdaptiveBreakpoints } from '@/helpers'

import styles from './Sidebar.module.scss'

export function Sidebar() {
  const {
    asPath,
    query: { poolId },
  } = useRouter()

  const { userData } = useGetUser()
  const { poolData } = usePool(Number(poolId))

  const { openModal } = useOpenModal()

  const { rulesIsOpen } = useAccount()
  const { isBreakpointPassed } = useAdaptiveBreakpoints(['lg'])

  const isAdaptive = isBreakpointPassed('lg')

  const menu = useMemo(() => {
    if (!poolId) return []

    const menu = [
      {
        name: 'Overview',
        icon: Overview,
        className: '',
        link: routes.account.overview(Number(poolId)),
      },
      {
        name: 'All Picks',
        icon: Picks,
        className: 'picks',
        link: routes.account.manageEntries(Number(poolId)),
      },
    ]

    if (!poolData) return menu

    if (poolData.type === 'squares' || poolData.type === 'golf_squares') {
      menu.push({
        name: 'Grid Control',
        icon: GridControl,
        className: '',
        link: routes.account.gridControl(Number(poolId)),
      })
      return menu
    }

    menu.push({
      name: 'Reports',
      icon: Reports,
      className: '',
      link: routes.account.reports(Number(poolId)),
    })

    return menu
  }, [poolData, poolId])

  const addMenu = [
    {
      name: 'Pool Settings',
      icon: Settings,
      className: 'settings',
      isActive: false,
      link: routes.account.settings(Number(poolId)),
    },
    {
      name: 'Account',
      icon: Account,
      className: 'account',
      isActive: false,
      link: routes.account.index,
    },
  ]

  const isSquare =
    poolData?.type === 'squares' || poolData?.type === 'golf_squares'

  const isCommissioner =
    userData && poolData ? userData.id === poolData.owner.id : false

  let makePicksButton = (
    <Link href={routes.account.makePick.index(Number(poolId))}>
      {isAdaptive ? (
        <MakeAPick />
      ) : (
        <button className="button button-blue-light">Make a Pick</button>
      )}
    </Link>
  )

  if (isSquare) {
    makePicksButton = (
      <Link href={routes.account.createGrid(Number(poolId))}>
        <button className="button button-blue-light">Create a Grid</button>
      </Link>
    )
  }

  if (poolData?.type === 'xrun_mlb' || poolData?.type === 'xrun') {
    makePicksButton = <></>
  }

  return (
    <div className={styles.sidebar}>
      <p
        className={classNames(styles.poolName, {
          [styles.poolNameVisible]:
            !rulesIsOpen || asPath !== routes.account.overview(Number(poolId)),
        })}
      >
        {poolData?.name}
      </p>

      <div className={classNames(styles.sidebarMain, styles.sidebarItem)}>
        <div className={styles.menu}>
          {menu.map((item, i) => {
            const Icon = item.icon

            return (
              <Link href={item.link} key={i}>
                <div
                  className={classNames(styles.menuItem, {
                    [styles.active]: asPath == item.link,
                  })}
                >
                  <div className={styles.iconWrapper}>
                    <Icon
                      className={classNames(styles.icon, {
                        [styles[item.className]]: !!item.className,
                      })}
                    />
                  </div>
                  <span>{item.name}</span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className={styles.buttons}>
          {poolData && makePicksButton}

          {isAdaptive ? (
            <div
              onClick={() =>
                openModal({ type: USER_MODAL_TYPES.INVITE_MEMBERS })
              }
              className={styles.iviteWrapper}
            >
              <IviteAMember />
            </div>
          ) : (
            <button
              className="button button-light"
              onClick={() =>
                openModal({ type: USER_MODAL_TYPES.INVITE_MEMBERS })
              }
            >
              Invite a Member
            </button>
          )}
        </div>
      </div>

      <div className={classNames(styles.sidebarAdd, styles.sidebarItem)}>
        <div className={styles.menu}>
          {addMenu.map((item, i) => {
            const Icon = item.icon

            return (
              <Link
                href={item.link ? item.link : '#'}
                key={i}
                className={classNames(styles.menuItem, {
                  [styles.active]: asPath == item.link,
                })}
              >
                <div className={styles.iconWrapper}>
                  <Icon
                    className={classNames(styles.icon, {
                      [styles[item.className]]: !!item.className,
                    })}
                  />
                </div>
                <span>{item.name}</span>
              </Link>
            )
          })}
          {isCommissioner && (
            <Link
              href={routes.account.commish.index(Number(poolId))}
              className={classNames(styles.menuItem, {
                [styles.active]:
                  asPath == routes.account.commish.index(Number(poolId)),
              })}
            >
              <div className={styles.iconWrapper}>
                <CommishPageIcon className={styles.commishIcon} />
              </div>
              <span>Commish Page</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
