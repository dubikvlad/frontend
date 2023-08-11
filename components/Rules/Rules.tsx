import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { Pool } from '@/api'
import { useAccount } from '@/contexts'
import { usePool } from '@/helpers'

import styles from './Rules.module.scss'

const PickemRulesLazy = dynamic(
  () =>
    import('@/features/components/Rules/PickemRules').then(
      (mod) => mod.PickemRules,
    ),
  { loading: () => <p>Loading...</p> },
)

const SurvivorRulesLazy = dynamic(
  () =>
    import('@/features/components/Rules/SurvivorRules').then(
      (mod) => mod.SurvivorRules,
    ),
  { loading: () => <p>Loading...</p> },
)

const SquaresRulesLazy = dynamic(
  () =>
    import('@/features/components/Rules/SquaresRules').then(
      (mod) => mod.SquaresRules,
    ),
  { loading: () => <p>Loading...</p> },
)

const GolfSquaresRulesLazy = dynamic(
  () =>
    import('@/features/components/Rules/GolfSquaresRules').then(
      (mod) => mod.GolfSquaresRules,
    ),
  { loading: () => <p>Loading...</p> },
)

const BracketRulesLazy = dynamic(
  () =>
    import('@/features/components/Rules/BracketRules').then(
      (mod) => mod.BracketRules,
    ),
  { loading: () => <p>Loading...</p> },
)

const CreditsRulesLazy = dynamic(
  () =>
    import('@/features/components/Rules/CreditsRules').then(
      (mod) => mod.CreditsRules,
    ),
  { loading: () => <p>Loading...</p> },
)

const MarginRulesLazy = dynamic(
  () =>
    import('@/features/components/Rules/MarginRules').then(
      (mod) => mod.MarginRules,
    ),
  { loading: () => <p>Loading...</p> },
)

const PowerRankingPlayoffRulesLazy = dynamic(() =>
  import('@/features/components/Rules/PowerRankingPlayoffRules').then(
    (mod) => mod.PowerRankingPlayoffRules,
  ),
)

const XRunMLBRulesLazy = dynamic(
  () =>
    import('features/components/Rules/XRunMLBRules').then(
      (mod) => mod.XRunMLBRules,
    ),
  { loading: () => <p>Loading...</p> },
)

const XRunRulesLazy = dynamic(
  () =>
    import('features/components/Rules/XRunRules').then((mod) => mod.XRunRules),
  { loading: () => <p>Loading...</p> },
)

const QARulesLazy = dynamic(
  () => import('features/components/Rules/QARules').then((mod) => mod.QARules),
  { loading: () => <p>Loading...</p> },
)

const GolfPickXRulesLazy = dynamic(
  () =>
    import('features/components/Rules/GolfPickXRules').then(
      (mod) => mod.GolfPickXRules,
    ),
  { loading: () => <p>Loading...</p> },
)

const MajorsRulesLazy = dynamic(
  () =>
    import('features/components/Rules/MajorsRules').then(
      (mod) => mod.MajorsRules,
    ),
  { loading: () => <p>Loading...</p> },
)

export function Rules() {
  const { rulesIsOpen } = useAccount()

  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  if (!poolData) return null

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.closed]: !rulesIsOpen,
      })}
    >
      <div className={styles.welcomeAndReminderWrapper}>
        <p className={styles.welcome}>Welcome to {poolData.pool_type.title}!</p>
        <p className={styles.reminder}>{poolData.invite_message}</p>
      </div>

      <div>
        <div className={styles.rulesWrapper}>
          <RulesComponent poolType={poolData.type} />
        </div>

        <p className={styles.seeFullRules}>See full rules</p>
      </div>
    </div>
  )
}

function RulesComponent({ poolType }: { poolType: Pool['type'] }) {
  switch (poolType) {
    case 'pick_em':
      return <PickemRulesLazy />
    case 'survivor':
      return <SurvivorRulesLazy />
    case 'squares':
      return <SquaresRulesLazy />
    case 'golf_squares':
      return <GolfSquaresRulesLazy />
    case 'bracket':
      return <BracketRulesLazy />
    case 'credits':
      return <CreditsRulesLazy />
    case 'margin':
      return <MarginRulesLazy />
    case 'playoff':
      return <PowerRankingPlayoffRulesLazy />
    case 'xrun_mlb':
      return <XRunMLBRulesLazy />
    case 'xrun':
      return <XRunRulesLazy />
    case 'qa':
      return <QARulesLazy />
    case 'golf_pick_x':
      return <GolfPickXRulesLazy />
    case 'golf_majors':
      return <MajorsRulesLazy />
    default:
      return null
  }
}
