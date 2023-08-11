import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { Pool, PoolTournament, PoolTypes } from '@/api'
import { months } from '@/config/constants'
import { useGetPoolEntries, useGetPoolEvents, usePool } from '@/helpers'

import styles from './ReportsPage.module.scss'

const ReportNHLPoolLazy = dynamic(
  () => import('@/assets/icons/reports-icons/ReportNHLPool'),
  { loading: () => <p>Loading...</p> },
)

const ReportCustomPoolLazy = dynamic(
  () => import('@/assets/icons/reports-icons/ReportCustomPool'),
  { loading: () => <p>Loading...</p> },
)

const ReportMLBPoolLazy = dynamic(
  () => import('@/assets/icons/reports-icons/ReportMLBPool'),
  { loading: () => <p>Loading...</p> },
)

const ReportNBAPoolLazy = dynamic(
  () => import('@/assets/icons/reports-icons/ReportNBAPool'),
  { loading: () => <p>Loading...</p> },
)

const ReportNFLAndNCAAPoolLazy = dynamic(
  () => import('@/assets/icons/reports-icons/ReportNFLAndNCAAPool'),
  { loading: () => <p>Loading...</p> },
)

const ReportPGAPoolLazy = dynamic(
  () => import('@/assets/icons/reports-icons/ReportPGAPool'),
  { loading: () => <p>Loading...</p> },
)

// pages
const PickemReportsPageLazy = dynamic(
  () =>
    import('@/features/pages/ReportsPage/PickemReportsPage').then(
      (mod) => mod.PickemReportsPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const SurvivorReportsPageLazy = dynamic(
  () =>
    import('@/features/pages/ReportsPage/SurvivorReportsPage').then(
      (mod) => mod.SurvivorReportsPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const PlayoffBracketReportsPageLazy = dynamic(
  () =>
    import('@/features/pages/ReportsPage/PlayoffBracketReportsPage').then(
      (mod) => mod.PlayoffBracketPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const CreditReportsPageLazy = dynamic(
  () =>
    import('@/features/pages/ReportsPage/CreditReportsPage').then(
      (mod) => mod.CreditReportsPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const XRunReportsPageLazy = dynamic(
  () =>
    import('@/features/pages/ReportsPage/XRunReportsPage').then(
      (mod) => mod.XRunReportsPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const PlayoffPowerRankingReportsPageLazy = dynamic(
  () =>
    import('@/features/pages/ReportsPage/PlayoffPowerRankingReportsPage').then(
      (mod) => mod.PlayoffPowerRankingReportsPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const GolfPickXReportsPageLazy = dynamic(
  () =>
    import('@/features/pages/ReportsPage/GolfPickXReportsPage').then(
      (mod) => mod.GolfPickXReportsPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const MajorsReportsPageLazy = dynamic(
  () =>
    import('@/features/pages/ReportsPage/MajorsReportsPage').then(
      (mod) => mod.MajorsReportsPage,
    ),
  { loading: () => <p>Loading...</p> },
)

export function ReportsPage() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))
  const { poolEntriesCountWithPicks } = useGetPoolEntries({
    poolId: poolData?.id,
  })

  const type = poolData?.type

  const reportsPageByType = useMemo(() => {
    if (poolData)
      switch (poolData.type) {
        case 'pick_em':
          return <PickemReportsPageLazy />
        case 'survivor':
          return <SurvivorReportsPageLazy />
        case 'bracket':
          return <PlayoffBracketReportsPageLazy />
        case 'credits':
          return <CreditReportsPageLazy />
        case 'xrun':
          return <XRunReportsPageLazy />
        case 'playoff':
          return <PlayoffPowerRankingReportsPageLazy />
        case 'golf_pick_x':
          return <GolfPickXReportsPageLazy />
        case 'golf_majors':
          return (
            <MajorsReportsPageLazy
              poolData={poolData as unknown as Pool<'golf_majors'>}
            />
          )
        default:
          return <></>
      }

    return <></>
  }, [poolData])

  return (
    <div className={styles.wrapper}>
      <h1>Reports</h1>

      {!!(type && poolEntriesCountWithPicks !== undefined) && (
        <ReportsInfo
          poolData={poolData}
          poolEntriesCountWithPicks={poolEntriesCountWithPicks}
          externalId={poolData.tournament.external_id}
        />
      )}

      <div>{reportsPageByType}</div>
    </div>
  )
}

type ReportsInfoProps = {
  poolData: Pool
  poolEntriesCountWithPicks: number
  externalId: PoolTournament['external_id']
}

function ReportsInfo({
  poolData,
  poolEntriesCountWithPicks,
  externalId,
}: ReportsInfoProps) {
  const stringId = String(externalId)

  const nhl = stringId === '15975'
  const nba = stringId === '17511'
  const nflAndNcaa = stringId === '15658' || stringId === '15657'
  const mlb = stringId === '15884'
  const pga = stringId === 'pga'
  const custom = stringId === 'CUSTOM'

  return (
    <div className={styles.reportsInfo}>
      <div className={styles.poolMembersInfo}>
        <div>
          {nhl && <ReportNHLPoolLazy />}
          {nba && <ReportNBAPoolLazy />}
          {nflAndNcaa && <ReportNFLAndNCAAPoolLazy />}
          {mlb && <ReportMLBPoolLazy />}
          {pga && <ReportPGAPoolLazy />}
          {custom && <ReportCustomPoolLazy />}
        </div>

        <div className={styles.info1}>
          <p
            className={classNames(styles.poolMembersText, {
              [styles.nhl]: nhl,
              [styles.nba]: nba,
              [styles.nflAndNcaa]: nflAndNcaa,
              [styles.mlb]: mlb,
              [styles.pga]: pga,
              [styles.custom]: custom,
            })}
          >
            Pool members
          </p>
          <p className={styles.poolMembers}>{poolData.users_count}</p>

          <div className={styles.info2}>
            <p>
              Active Entries <span>{poolData.entries_count}</span>
            </p>
            <p>
              Picks in <span>{poolEntriesCountWithPicks}</span>
            </p>
            <p>
              Picks not in{' '}
              <span>{poolData.entries_count - poolEntriesCountWithPicks}</span>
            </p>
          </div>
        </div>
      </div>

      <div className={styles.poolInfo}>
        <p
          className={classNames(styles.poolInfoTitle, {
            [styles.nhl]: nhl,
            [styles.nba]: nba,
            [styles.nflAndNcaa]: nflAndNcaa,
            [styles.mlb]: mlb,
            [styles.pga]: pga,
            [styles.custom]: custom,
          })}
        >
          {poolData.pool_type.title}
        </p>

        <div className={styles.poolInfoWrapper}>
          {(poolData.type === 'pick_em' ||
            poolData.type === 'survivor' ||
            poolData.type === 'playoff') && <PoolInfo poolData={poolData} />}
        </div>

        <div className={styles.commissionerInfo}>
          <p>Commissioner:</p>
          <p className={styles.commissionerValue}>
            {poolData.owner.first_name} {poolData.owner.last_name}
          </p>
        </div>
      </div>
    </div>
  )
}

function handlingDeadline(poolEventsDeadline: string | null | undefined) {
  if (!poolEventsDeadline) return ''

  if (isNaN(Number(new Date(poolEventsDeadline)))) {
    return 'Each game locks individually at scheduled game time'
  }

  const deadlineDate = new Date(poolEventsDeadline)
  const date = deadlineDate.getDate()

  return `${String(date).length < 2 ? `0${date}` : date} ${months[
    deadlineDate.getMonth()
  ].slice(0, 3)} ${deadlineDate.getFullYear()}`
}

function PoolInfo({ poolData }: { poolData: Pool<PoolTypes> }) {
  const { poolEventsDeadline } = useGetPoolEvents({
    poolId: poolData.type === 'playoff' ? undefined : poolData.id,
    weekNumber:
      poolData.pick_pool && 'current_week' in poolData.pick_pool
        ? poolData.pick_pool.current_week
        : undefined,
  })

  if (!poolData.pick_pool) return null

  const deadlineText =
    poolEventsDeadline ??
    ('pick_deadline' in poolData.pick_pool
      ? poolData.pick_pool.pick_deadline
      : undefined)

  const deadlineTime = handlingDeadline(deadlineText)

  return (
    <>
      {'start_week' in poolData.pick_pool && (
        <>
          <p>Pool started:</p>
          <p className={styles.value}>WEEK {poolData.pick_pool.start_week}</p>
        </>
      )}

      <p>Deadline:</p>
      <p className={styles.value}>{deadlineTime}</p>
    </>
  )
}
