import classNames from 'classnames'
import Link from 'next/link'
import { Router, useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { PoolData, UserResponseData } from '@/api'
import {
  Account2,
  AddNewAccount,
  Cross,
  LogoLight,
  Notification,
  SignOut,
  Switch,
} from '@/assets/icons'
import { localStorageKeys, routes, sportsIconsByCode } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { OpenModalContextType } from '@/contexts/OpenModalContext'
import { USER_MODAL_TYPES } from '@/features/modals'
import {
  useAdaptiveBreakpoints,
  useAuth,
  useGetSports,
  useUserPools,
} from '@/helpers'

import styles from './Header.module.scss'

const notification = 4

export function Header({
  resetToken,
  resetEmail,
}: {
  resetToken?: string
  resetEmail?: string
}) {
  const { isBreakpointPassed } = useAdaptiveBreakpoints(['sm', 'md'])

  const isMdBreakpointPassed = isBreakpointPassed('md')
  const isSmBreakpointPassed = isBreakpointPassed('sm')

  const {
    asPath,
    push,
    route,
    query: { poolTypeId },
  } = useRouter()

  const { userData, logout } = useAuth()

  const { openModal, modalType } = useOpenModal()

  useEffect(() => {
    if (route.includes(routes.passwordReset()) && resetEmail && resetToken) {
      openModal({
        type: USER_MODAL_TYPES.RESET_PASSWORD,
        props: { resetEmail, resetToken },
      })
    }
  }, [openModal, resetEmail, resetToken, route])

  const [mobileStep, setMobileStep] = useState<null | number>(null)

  useEffect(() => {
    function getStep() {
      if (asPath === routes.poolCreating.index) return 1
      if (
        poolTypeId &&
        !isNaN(+poolTypeId) &&
        asPath === routes.poolCreating.step2(+poolTypeId)
      )
        return 2
      if (asPath === routes.poolCreating.step3) return 3

      return null
    }

    setMobileStep(getStep())
  }, [asPath, poolTypeId])

  const [mobileMenuIsActive, setMobileMenuIsActive] = useState<boolean | null>(
    null,
  )

  useEffect(() => {
    setMobileMenuIsActive(null)
  }, [asPath, isMdBreakpointPassed])

  return (
    <>
      <div className={styles.header}>
        <div className={styles.wrapper}>
          <Link href={routes.index}>
            <LogoLight />
          </Link>

          {userData ? (
            <LoggedInUserComponents
              isMdBreakpointPassed={isMdBreakpointPassed}
              asPath={asPath}
              push={push}
              userData={userData}
              logout={logout}
              modalType={modalType}
              openModal={openModal}
              mobileMenuIsActive={mobileMenuIsActive}
              setMobileMenuIsActive={setMobileMenuIsActive}
            />
          ) : (
            <div className={styles.buttonsWrapper}>
              <p
                onClick={() =>
                  openModal({
                    type: USER_MODAL_TYPES.SIGN_IN,
                  })
                }
                className={styles.logIn}
              >
                Log In
              </p>
              <button
                className={classNames(
                  'button',
                  'button-blue-light',
                  styles.signUp,
                )}
                onClick={() =>
                  openModal({
                    type: USER_MODAL_TYPES.CREATE_AN_ACCOUNT,
                  })
                }
              >
                Sign up
              </button>
            </div>
          )}
        </div>

        {!!mobileStep && isSmBreakpointPassed && (
          <div className={styles.mobileSteps}>
            <div
              className={classNames(styles.mobileStep, {
                [styles.mobileStepActive]: mobileStep >= 1,
              })}
            ></div>
            <div
              className={classNames(styles.mobileStep, {
                [styles.mobileStepActive]: mobileStep >= 2,
              })}
            ></div>
            <div
              className={classNames(styles.mobileStep, {
                [styles.mobileStepActive]: mobileStep >= 3,
              })}
            ></div>
          </div>
        )}

        {isMdBreakpointPassed && (
          <div
            className={classNames(styles.mobileMenuWrapper, {
              [styles.mobileMenuWrapperVisible]: mobileMenuIsActive,
              [styles.mobileMenuWrapperWithMobileStep]:
                !!mobileStep && isSmBreakpointPassed,
            })}
          >
            <MenuList
              asPath={asPath}
              modalType={modalType}
              openModal={openModal}
            />
          </div>
        )}
      </div>
    </>
  )
}

function AccountMenuWrapper({
  userData,
  asPath,
  isVisible,
  setIsVisible,
  logout,
  push,
}: {
  userData: UserResponseData
  asPath: string
  isVisible: boolean
  setIsVisible: Dispatch<SetStateAction<boolean>>
  logout: () => Promise<void>
  push: (url: string) => Promise<boolean>
}) {
  const { poolsActiveData } = useUserPools()
  const { sportsData } = useGetSports()

  const [recentlyAcessedPools, setRecentlyAcessedPools] = useState<
    string | null
  >(localStorage.getItem(localStorageKeys.recentlyAcessedPools))

  useEffect(() => {
    setRecentlyAcessedPools(
      localStorage.getItem(localStorageKeys.recentlyAcessedPools),
    )
  }, [asPath, isVisible])

  const recentlyAcessedPoolsArr = recentlyAcessedPools
    ? recentlyAcessedPools.split(',').reduce<PoolData[]>((acc, item) => {
        const findItem = poolsActiveData?.find(
          (pool) => pool.id === Number(item),
        )

        if (findItem) acc.push(findItem)
        return acc
      }, [])
    : []

  // удалить пул из списка последних посещенных пулов
  function removePoolFromList(poolId: number) {
    const items = localStorage.getItem(localStorageKeys.recentlyAcessedPools)

    const arr = items ? items.split(',') : []
    arr.splice(arr.indexOf(String(poolId)), 1)

    arr.length
      ? localStorage.setItem(localStorageKeys.recentlyAcessedPools, String(arr))
      : localStorage.removeItem(localStorageKeys.recentlyAcessedPools)

    setRecentlyAcessedPools(
      localStorage.getItem(localStorageKeys.recentlyAcessedPools),
    )
  }

  // скрывать меню при прокрутке страницы
  useEffect(() => {
    const hideMenu = () => setIsVisible(false)

    window.addEventListener('scroll', hideMenu)
    return () => window.removeEventListener('scroll', hideMenu)
  }, [setIsVisible])

  return (
    <div
      className={classNames(styles.accountMenuWrapper, {
        [styles.accountVisible]: isVisible,
      })}
    >
      <div className={styles.accountMenuTitleWrapper}>
        <div
          className={styles.accountLink}
          onClick={() =>
            push(routes.account.index).then(() => setIsVisible(false))
          }
        >
          <p className={styles.accountMenuTitle}>{userData.username}</p>
          <p className={styles.accountMenuSubtitle}>
            {userData.first_name} {userData.last_name}
          </p>
        </div>
      </div>

      <p className={styles.accountMenuRecentlyText}>Recently acessed pools</p>

      <div className={styles.accountMenuRecentlyWrapper}>
        <div className={styles.accountMenuRecentlyList}>
          {recentlyAcessedPoolsArr.length ? (
            recentlyAcessedPoolsArr.map((item, i) => {
              if (i > 3) return null

              const sportCode = sportsData.find(
                (sport) => sport.id === item.sport_id,
              )?.sport_code
              const Icon = sportCode ? sportsIconsByCode[sportCode] : undefined

              return (
                <div
                  key={item.id}
                  className={styles.accountMenuRecentlyListItem}
                >
                  <div className={styles.icon}>{Icon && <Icon />}</div>
                  <div className={styles.poolTitleWrapper}>
                    <p className={styles.poolTitle}>{item.name}</p>
                    <p className={styles.poolSubtitle}>
                      {item.pool_type.title}
                    </p>
                  </div>
                  <div
                    className={styles.crossIcon}
                    onClick={() => removePoolFromList(item.id)}
                  >
                    <Cross />
                  </div>

                  <Link
                    href={routes.account.overview(item.id)}
                    className={styles.poolLink}
                    onClick={() => setIsVisible(false)}
                  ></Link>
                </div>
              )
            })
          ) : (
            <p className={styles.noRecentPools}>
              There are no recent available pools
            </p>
          )}
        </div>

        {recentlyAcessedPoolsArr.length > 4 && (
          <div className={styles.viewAll} onClick={() => setIsVisible(false)}>
            <Link href={routes.account.dashboard}>View all</Link>
          </div>
        )}
      </div>

      <ul className={styles.accountMenuActions}>
        <li className={styles.listItem}>
          <AddNewAccount className={styles.addNewAccount} />
          <p>Add New Account</p>
        </li>

        <li className={styles.listItem}>
          <Switch className={styles.switch} />
          <p>Switch Account</p>
        </li>

        <li
          className={styles.listItem}
          onClick={() => {
            logout()
            setIsVisible(false)
          }}
        >
          <SignOut className={styles.signOut} />
          <p>Sign Out</p>
        </li>
      </ul>
    </div>
  )
}

type LoggedInUserComponentsProps = {
  isMdBreakpointPassed: boolean
  asPath: Router['asPath']
  push: Router['push']
  userData: UserResponseData
  logout: () => Promise<void>
  modalType: OpenModalContextType['modalType']
  openModal: OpenModalContextType['openModal']
  mobileMenuIsActive: boolean | null
  setMobileMenuIsActive: Dispatch<
    SetStateAction<LoggedInUserComponentsProps['mobileMenuIsActive']>
  >
}

function LoggedInUserComponents({
  isMdBreakpointPassed,
  asPath,
  push,
  userData,
  logout,
  modalType,
  openModal,
  mobileMenuIsActive,
  setMobileMenuIsActive,
}: LoggedInUserComponentsProps) {
  const [accountMenuWrapperIsVisible, setAccountMenuWrapperIsVisible] =
    useState(false)

  return (
    <>
      {!isMdBreakpointPassed && (
        <>
          <MenuList
            asPath={asPath}
            modalType={modalType}
            openModal={openModal}
          />

          <div className={styles.notificationWrapper}>
            <p>
              <span>{notification}</span>
            </p>
            <Notification />
          </div>
        </>
      )}

      <div className={styles.accountWrapper}>
        <OutsideClickHandler
          onOutsideClick={() => setAccountMenuWrapperIsVisible(false)}
          display="contents"
        >
          <div
            className={styles.accountIcon}
            onClick={() => setAccountMenuWrapperIsVisible((prev) => !prev)}
          >
            <Account2 />
          </div>

          <AccountMenuWrapper
            userData={userData}
            asPath={asPath}
            isVisible={accountMenuWrapperIsVisible}
            setIsVisible={setAccountMenuWrapperIsVisible}
            logout={logout}
            push={push}
          />
        </OutsideClickHandler>
      </div>

      {isMdBreakpointPassed && (
        <div
          className={classNames(styles.mobileMenu, {
            [styles.mobileMenuNotActive]:
              mobileMenuIsActive !== null && !mobileMenuIsActive,
            [styles.mobileMenuActive]:
              mobileMenuIsActive !== null && mobileMenuIsActive,
          })}
          onClick={() => setMobileMenuIsActive((prev) => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </>
  )
}

type MenuListProps = {
  asPath: Router['asPath']
  modalType: OpenModalContextType['modalType']
  openModal: OpenModalContextType['openModal']
}

function MenuList({ asPath, modalType, openModal }: MenuListProps) {
  type MenuItem = {
    title: string
    isActive: boolean
    link?: string
    onClick?: () => void
  }

  const menu: MenuItem[] = [
    {
      title: 'Dashboard',
      link: routes.account.dashboard,
      isActive:
        asPath.includes(routes.account.dashboard) &&
        modalType !== USER_MODAL_TYPES.JOIN_A_POOL,
    },
    {
      title: 'Start a New Pool',
      link: routes.poolCreating.index,
      isActive:
        asPath.includes(routes.poolCreating.index) &&
        modalType !== USER_MODAL_TYPES.JOIN_A_POOL,
    },
    {
      title: 'Join a Pool',
      onClick: () => openModal({ type: USER_MODAL_TYPES.JOIN_A_POOL }),
      isActive: modalType === USER_MODAL_TYPES.JOIN_A_POOL,
    },
  ]

  return (
    <nav className={styles.nav}>
      <ul>
        {menu.map((item, i) =>
          item.link ? (
            <Link href={item.link} key={i}>
              <li
                className={classNames({
                  [styles.active]: item.isActive,
                })}
              >
                {item.title}
              </li>
            </Link>
          ) : (
            <li
              key={i}
              onClick={item.onClick}
              className={classNames({
                [styles.active]: item.isActive,
              })}
            >
              {item.title}
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}
