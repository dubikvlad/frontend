import classNames from 'classnames'
import getConfig from 'next/config'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import qs from 'qs'
import { useState } from 'react'

import { api } from '@/api'
import { AddMemberSm, Cross, Custom, Plus } from '@/assets/icons'
import * as leaguesIcons from '@/assets/img/leagues'
import { leadToMonetaryDivision, routes } from '@/config/constants'
import { Input } from '@/features/ui'
import { useAdaptiveBreakpoints, useGetUser, useGetUserInfo } from '@/helpers'

import styles from './DashboardAdditional.module.scss'

export function DashboardAdditional() {
  const { breakpoint } = useAdaptiveBreakpoints(['sm'])

  return (
    <div className={styles.add}>
      <AddStatus breakpoint={breakpoint} />
      <AddPools breakpoint={breakpoint} />
      <JoinPool breakpoint={breakpoint} />
    </div>
  )
}

function AddStatus({ breakpoint }: { breakpoint: 'sm' | 'source' | null }) {
  const { push } = useRouter()

  const { userInfoData, userInfoLoading } = useGetUserInfo()

  const addData = [
    { name: 'Pools Created', data: userInfoData?.pools.length ?? '-' },
    { name: 'Members Invited', data: '-' },
  ]

  const actualBalance = userInfoData?.wallets.reduce(
    (sum, item) => (sum += item.amount),
    0,
  )

  const isBonusBalance =
    (userInfoData?.wallets.find((item) => item.type === 'bonus')?.amount ??
      0) !== 0

  const returnDots = () => '.'.repeat(100)

  const replenishBtnIsDisabled = userInfoLoading || !userInfoData

  if (breakpoint === 'sm') {
    return (
      <div className={styles.statusMd}>
        <div className={styles.balanceMd}>
          {actualBalance === undefined
            ? '-'
            : `$${leadToMonetaryDivision(actualBalance)}`}
          {!isBonusBalance && (
            <p className={styles.mark}>
              <span>*</span>
              <span className={styles.bonusBalanceText}>
                Here is your bonus balance displayed. You can manage it through
                the site to your preference, the functionality will not be
                restricted.
              </span>
            </p>
          )}

          <p className={styles.balanceInfoMd}>
            {isBonusBalance ? 'Bonus Balance' : 'Actual balance'}
          </p>
        </div>

        <div
          className={styles.replenish}
          onClick={() =>
            !replenishBtnIsDisabled && push(routes.account.replenish())
          }
        >
          Replenish
        </div>
      </div>
    )
  }

  return (
    <div className={styles.status}>
      <div className={styles.balance}>
        {actualBalance === undefined
          ? '-'
          : `$${leadToMonetaryDivision(actualBalance)}`}
        {isBonusBalance && (
          <p className={styles.mark}>
            <span>*</span>
            <span className={styles.bonusBalanceText}>
              Here is your bonus balance displayed. You can manage it through
              the site to your preference, the functionality will not be
              restricted.
            </span>
          </p>
        )}
      </div>
      <p className={styles.balanceInfo}>
        {isBonusBalance ? 'Bonus Balance' : 'Actual balance'}
      </p>
      <div className={styles.info}>
        {addData.map((data, i) => {
          return (
            <div className={styles.infoRow} key={i}>
              <span className={styles.infoText}>{data.name}</span>
              <span className={styles.infoDots}>{returnDots()}</span>
              <span className={styles.infoNumber}>{data.data}</span>
            </div>
          )
        })}
      </div>
      <button
        className={classNames(
          'button button-blue-light-outline',
          styles.replenishBtn,
          { disabled: replenishBtnIsDisabled },
        )}
        onClick={() =>
          !replenishBtnIsDisabled && push(routes.account.replenish())
        }
      >
        Replenish
      </button>
    </div>
  )
}

const rLink = routes.poolCreating.index

const newPools = [
  { title: 'NFL', icon: leaguesIcons.nfl, link: `${rLink}?sport=5` },
  { title: 'MLB', icon: leaguesIcons.mlb, link: `${rLink}?sport=7` },
  {
    title: 'NCAA',
    icon: leaguesIcons.сollegeFootball,
    link: `${rLink}?sport=6`,
  },
  { title: 'NBA', icon: leaguesIcons.nba, link: `${rLink}?sport=4` },
  { title: 'NHL', icon: leaguesIcons.nhl, link: `${rLink}?sport=1` },
  { title: 'PGA', icon: leaguesIcons.pga, link: `${rLink}?sport=3` },
]

function AddPools({ breakpoint }: { breakpoint: 'sm' | 'source' | null }) {
  const [showStartPools, setShowStartPools] = useState<boolean>(false)

  return (
    <>
      {showStartPools || breakpoint !== 'sm' ? (
        <div className={styles.poolsStart}>
          <div className={styles.header}>
            <h3 className={styles.title}>Start New POOL</h3>

            {breakpoint === 'sm' ? (
              <div onClick={() => setShowStartPools((p) => !p)}>
                <Cross width={14} height={14} stroke="var(--text-color)" />
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className={styles.startItems}>
            {newPools.map((item, i) => (
              <Link key={i} href={item.link} className={styles.startItem}>
                <Image
                  src={item.icon.src}
                  alt={item.title}
                  width={60}
                  height={60}
                  className={styles.startImg}
                />
                <span className={styles.startItemTitle}>{item.title}</span>
              </Link>
            ))}
            <Link
              href={`${routes.poolCreating.index}?sport=13`}
              className={styles.startItem}
            >
              <Custom className={styles.customIcon} />
              <span className={styles.startItemTitle}>Custom Pool</span>
            </Link>
          </div>
        </div>
      ) : (
        <div
          className={styles.startPoolSm}
          onClick={() => setShowStartPools((p) => !p)}
        >
          <p>Start New POOL</p>
          <Plus />
        </div>
      )}
    </>
  )
}

const {
  publicRuntimeConfig: { appUrl },
} = getConfig()

function JoinPool({ breakpoint }: { breakpoint: 'sm' | 'source' | null }) {
  const { push } = useRouter()
  const { userData } = useGetUser()

  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [showJoinPools, setShowJoinPools] = useState<boolean>(false)

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

  const isValidString =
    value.includes(`${appUrl}/attach`) &&
    value.includes('pool_id') &&
    value.includes('password')

  return (
    <>
      {showJoinPools || breakpoint !== 'sm' ? (
        <div className={styles.joinWrapper}>
          <div className={styles.header}>
            <h3 className={styles.title}>
              {breakpoint !== 'sm' ? 'Quick Join' : 'join a POOL'}
            </h3>

            {breakpoint === 'sm' ? (
              <div onClick={() => setShowJoinPools((p) => !p)}>
                <Cross width={14} height={14} stroke="var(--text-color)" />
              </div>
            ) : (
              <></>
            )}
          </div>

          <p className={styles.joinInfo}>
            Enter join link below to join the pool
          </p>
          <div className={styles.inputWrapper}>
            <Input
              placeholder="Join Link"
              value={value}
              onChange={setValue}
              withLabel
            />
            <div className={styles.buttonWrapper}>
              <button
                className={classNames(
                  'button',
                  'button-blue-light',
                  styles.button,
                  { disabled: !isValidString || isLoading },
                )}
                onClick={joinPool}
              >
                JOIN
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={styles.startPoolSm}
          onClick={() => setShowJoinPools((p) => !p)}
        >
          <p>join a POOL</p>
          <AddMemberSm />
        </div>
      )}
    </>
  )
}
