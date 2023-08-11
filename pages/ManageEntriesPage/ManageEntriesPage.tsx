import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { poolTypes } from '@/config/constants'
import { usePool } from '@/helpers'

import styles from './ManageEntriesPage.module.scss'

const PickemManageEntriesPageLazy = dynamic(
  () =>
    import('@/features/pages/ManageEntriesPage/PickemManageEntriesPage').then(
      (mod) => mod.PickemManageEntriesPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const SurvivorManageEntriesPageLazy = dynamic(
  () =>
    import('@/features/pages/ManageEntriesPage/SurvivorManageEntriesPage').then(
      (mod) => mod.SurvivorManageEntriesPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const SquaresManageEntriesPageLazy = dynamic(
  () =>
    import('@/features/pages/ManageEntriesPage/SquaresManageEntriesPage').then(
      (mod) => mod.SquaresManageEntriesPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const GolfSquaresManageEntriesPageLazy = dynamic(
  () =>
    import(
      '@/features/pages/ManageEntriesPage/GolfSquaresManageEntriesPage'
    ).then((mod) => mod.GolfSquaresManageEntriesPage),
  { loading: () => <p>Loading...</p> },
)

const BracketManageEntriesPageLazy = dynamic(
  () =>
    import('@/features/pages/ManageEntriesPage/BracketManageEntriesPage').then(
      (mod) => mod.BracketManageEntriesPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const CreditsManageEntriesPageLazy = dynamic(
  () =>
    import('@/features/pages/ManageEntriesPage/CreditsManageEntriesPage').then(
      (mod) => mod.CreditsManageEntriesPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const MarginManageEntriesPageLazy = dynamic(
  () =>
    import('@/features/pages/ManageEntriesPage/MarginManageEntriesPage').then(
      (mod) => mod.MarginManageEntriesPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const PlayoffManageEntriesPageLazy = dynamic(() =>
  import('@/features/pages/ManageEntriesPage/PlayoffManageEntriesPage').then(
    (mod) => mod.PlayoffManageEntriesPage,
  ),
)

const XRunMLBManageEntriesPageLazy = dynamic(
  () =>
    import('features/pages/ManageEntriesPage/XRunMLBManageEntriesPage').then(
      (mod) => mod.XRunMLBManageEntriesPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const XRunManageEntriesPageLazy = dynamic(
  () =>
    import('features/pages/ManageEntriesPage/XRunManageEntriesPage').then(
      (mod) => mod.XRunManageEntriesPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const QAManageEntriesPageLazy = dynamic(
  () =>
    import('@/features/pages/ManageEntriesPage/QAManageEntriesPage').then(
      (mod) => mod.QAManageEntriesPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const PickXManageEntriesPageLazy = dynamic(
  () =>
    import('@/features/pages/ManageEntriesPage/PickXManageEntriesPage').then(
      (mod) => mod.PickXManageEntriesPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const GolfMajorsManageEntriesPageLazy = dynamic(
  () =>
    import(
      '@/features/pages/ManageEntriesPage/GolfMajorsManageEntriesPage'
    ).then((mod) => mod.GolfMajorsManageEntriesPage),
  { loading: () => <p>Loading...</p> },
)

export function ManageEntriesPage() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  const entriesPage = useMemo(() => {
    if (poolData && poolData.type) {
      switch (poolData.type) {
        case poolTypes.pick_em:
          return <PickemManageEntriesPageLazy />
        case poolTypes.survivor:
          return <SurvivorManageEntriesPageLazy />
        case poolTypes.squares:
          return <SquaresManageEntriesPageLazy />
        case poolTypes.golf_squares:
          return <GolfSquaresManageEntriesPageLazy />
        case poolTypes.bracket:
          return <BracketManageEntriesPageLazy />
        case poolTypes.credits:
          return <CreditsManageEntriesPageLazy />
        case poolTypes.margin:
          return <MarginManageEntriesPageLazy />
        case poolTypes.playoff:
          return <PlayoffManageEntriesPageLazy />
        case poolTypes.xrun_mlb:
          return <XRunMLBManageEntriesPageLazy />
        case poolTypes.xrun:
          return <XRunManageEntriesPageLazy />
        case poolTypes.qa:
          return <QAManageEntriesPageLazy />
        case poolTypes.golf_pick_x:
          return <PickXManageEntriesPageLazy />
        case poolTypes.golf_majors:
          return <GolfMajorsManageEntriesPageLazy />
        default:
          return null
      }
    }

    return null
  }, [poolData])

  return <div className={styles.wrapper}>{entriesPage}</div>
}
