import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { PlayoffEntry, PlayoffPointsByStage } from '@/api'
import { Star } from '@/assets/icons'
import { EntriesTable, EntryUserIcon } from '@/features/components'
import type { SortType, TheadData } from '@/features/components/EntriesTable'
import {
  useLeaderboard,
  usePool,
  entriesFiltration,
  useGetUser,
  entriesDataSorting,
} from '@/helpers'

const FilterByEntryAndMembersAndWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndWeeks'),
  { loading: () => <p>Loading...</p> },
)

import styles from './PlayoffLeaderboardTable.module.scss'

export function PlayoffLeaderboardTable() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'playoff'>(Number(poolId))
  const { userData } = useGetUser()
  const { leaderboardData } = useLeaderboard<'playoff'>({
    poolId: Number(poolId),
  })

  const hasTiebreaker = !!leaderboardData?.entries.find(
    (entry) => entry.tiebreaker !== null,
  )

  const theadList: TheadData<'playoff'> = {
    place: { title: '' },
    'entry.color': {
      title: (
        <div key="star" className={styles.starWrap}>
          <Star className={styles.star} />
        </div>
      ),
    },
    name: { title: 'Name', sort: { name: 'name' } },
    PLAY_OFF_STAGE_1_8: {
      title: 'Wild Card PTS',
      sort: { name: 'PLAY_OFF_STAGE_1_8' },
    },
    PLAY_OFF_STAGE_1_4: {
      title: 'Divisional PTS',
      sort: { name: 'PLAY_OFF_STAGE_1_4' },
    },
    PLAY_OFF_STAGE_1_2: {
      title: 'Conference PTS',
      sort: { name: 'PLAY_OFF_STAGE_1_2' },
    },
    PLAY_OFF_STAGE_FINAL: {
      title: 'Super Bowl PTS',
      sort: { name: 'PLAY_OFF_STAGE_FINAL' },
    },
  }

  if (hasTiebreaker) {
    theadList.tiebreaker = {
      title: 'Tiebreak',
      sort: { name: 'tiebreaker' },
    }
    theadList.total = {
      title: 'Total PTS',
      sort: { name: 'total' },
    }
  } else {
    theadList.total = {
      title: 'Total PTS',
      sort: { name: 'total' },
    }
  }

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])
  const [sort, setSort] = useState<SortType<'playoff'>>({
    name: null,
    type: null,
  })

  type CustomEntry = PlayoffEntry & PlayoffPointsByStage

  const entries: CustomEntry[] = leaderboardData
    ? leaderboardData.entries.map((entry: PlayoffEntry) =>
        Object.assign(entry, entry.points_by_stage),
      )
    : []

  const filteredEntries = entriesFiltration<CustomEntry>({
    search,
    entries,
    members,
    pathForSearch: ['name'],
    pathForFiltersMembers: ['user_id'],
  })

  const leaderboardRowObj = generateTableData()

  type TableRowT = {
    place: RowItem
    'entry.color': RowItem
    name: RowItem
    PLAY_OFF_STAGE_1_8: RowItem
    PLAY_OFF_STAGE_1_4: RowItem
    PLAY_OFF_STAGE_1_2: RowItem
    PLAY_OFF_STAGE_FINAL: RowItem
    tiebreaker?: RowItem
    total?: RowItem
  }

  type RowItem = {
    content: number | string | JSX.Element
    bgColor: string
  }

  function generateTableData() {
    return filteredEntries.map((entry: CustomEntry, i: number) => {
      const currentUser: boolean = entry.user_id === userData?.id
      const cellBg: string = currentUser ? '#FFFEF2' : ''
      const pointsCellBg: string = currentUser
        ? '#FFF8B9'
        : i % 2 === 0
        ? '#7e9bdf1a'
        : '#aabff01a'

      const tableRow: TableRowT = {
        place: { content: i + entry.user_id, bgColor: cellBg },
        'entry.color': {
          content: (
            <EntryUserIcon
              isCurrentUser={currentUser}
              userName={entry.name}
              color="#3c8dd9"
            />
          ),
          bgColor: cellBg,
        },
        name: { content: entry.name, bgColor: cellBg },
        PLAY_OFF_STAGE_1_8: {
          content: entry.PLAY_OFF_STAGE_1_8,
          bgColor: cellBg,
        },
        PLAY_OFF_STAGE_1_4: {
          content: entry.PLAY_OFF_STAGE_1_4,
          bgColor: cellBg,
        },
        PLAY_OFF_STAGE_1_2: {
          content: entry.PLAY_OFF_STAGE_1_2,
          bgColor: cellBg,
        },
        PLAY_OFF_STAGE_FINAL: {
          content: entry.PLAY_OFF_STAGE_FINAL,
          bgColor: cellBg,
        },
      }

      if (entry.tiebreaker) {
        tableRow.tiebreaker = {
          content: entry.tiebreaker,
          bgColor: cellBg,
        }
        tableRow.total = {
          content:
            entry.tiebreaker +
            entry.PLAY_OFF_STAGE_FINAL +
            entry.PLAY_OFF_STAGE_1_2 +
            entry.PLAY_OFF_STAGE_1_4 +
            entry.PLAY_OFF_STAGE_1_8,
          bgColor: pointsCellBg,
        }
      } else {
        tableRow.total = {
          content:
            entry.PLAY_OFF_STAGE_FINAL +
            entry.PLAY_OFF_STAGE_1_2 +
            entry.PLAY_OFF_STAGE_1_4 +
            entry.PLAY_OFF_STAGE_1_8,
          bgColor: pointsCellBg,
        }
      }

      return tableRow
    })
  }

  if (!leaderboardData) return null

  const renderEntriesData = !sort.type
    ? leaderboardRowObj
    : entriesDataSorting(leaderboardRowObj, sort)

  return (
    <div>
      {!!poolData && (
        <div className={styles.search}>
          <FilterByEntryAndMembersAndWeeksLazy
            poolData={poolData}
            search={search}
            setSearch={setSearch}
            members={members}
            setMembers={setMembers}
          />
        </div>
      )}

      {renderEntriesData.length ? (
        <EntriesTable
          theadList={theadList}
          sort={sort}
          setSort={setSort}
          tbodyData={renderEntriesData}
          className={classNames(styles.grid, {
            [styles.small]: !hasTiebreaker,
          })}
        />
      ) : (
        <div className={styles.notFound}>
          {search.trim() && (
            <>
              Sorry, there were no results found for{' '}
              <span>&quot;{search}&quot;</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
