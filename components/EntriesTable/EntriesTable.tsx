import classNames from 'classnames'
import React, { Dispatch, ReactElement } from 'react'

import { PoolTypesObjForEntriesTable } from '@/api'
import { Sorting } from '@/features/ui'

import styles from './EntriesTable.module.scss'

type BracketTitles =
  | 'place'
  | 'entry.color'
  | 'entry.name'
  | 'currentPoints'
  | 'possiblePoints'
  | `round_${number}`
  | 'predictedChampion'

type MarginTitles =
  | 'place'
  | 'entry.color'
  | 'name'
  | 'count_win'
  | 'count_lost'
  | 'points'

type XRunMLBTitles =
  | 'entry.color'
  | 'name'
  | 'team'
  | 'runs'
  | 'matches'
  | 'games'

type XRunMLBMyPicksTitles =
  | 'id'
  | 'entry.color'
  | 'name'
  | 'team'
  | 'matches'
  | 'games'

type XRunTitles = 'entry.color' | 'name' | 'weeks'

type XRunMLBPickByMembersTitles = Exclude<XRunMLBMyPicksTitles, 'id'>

type XRunScoreDifferentialTitles = XRunTitles | 'best' | 'total'

type XRunPicksByMembersTitles = 'entry.color' | 'name' | 'team' | 'score'

type QALeaderboardTitles =
  | 'id'
  | 'entryColor'
  | 'entryName'
  | 'questionsAnswered'
  | 'correctAnswers'
  | 'points'

type PickXLeaderboardTitles =
  | 'place'
  | 'entryColor'
  | 'entryName'
  | 'totalToPar'
  | 'feDex'
  | 'winnings'

type MajorsYearToDateTitles =
  | 'entryColor'
  | 'entryName'
  | 'tournaments'
  | 'majorsPicked'
  | 'total'
  | 'feDex'
  | 'winnings'

type MajorsByTournamentTitles =
  | 'place'
  | 'entryColor'
  | 'entryName'
  | 'totalToPar'
  | 'tieDiff'
  | 'feDex'
  | 'winnings'

type MajorsPlayerPerformanceSummaryTitles =
  | 'worldRank'
  | 'name'
  | 'score'
  | 'pars'
  | 'birdies'
  | 'eagles'
  | 'bogeys'
  | 'doubles'
  | 'triples'
  | 'albatross'

type MajorsPlayerValueSummaryTitles =
  | 'name'
  | 'score'
  | 'salary'
  | 'value'
  | 'scale'

type EntriesTableKeys = {
  bracket: BracketTitles
  margin: MarginTitles
  pick_em: string
  survivor: string
  playoff: string
  qa: QALeaderboardTitles
  credits: string
  xrun: XRunTitles
  xrun_picks_by_members: XRunPicksByMembersTitles
  xrun_score_differential: XRunScoreDifferentialTitles
  xrun_mlb: XRunMLBTitles
  xrun_mlb_my_picks: XRunMLBMyPicksTitles
  xrun_mlb_picks_by_members: XRunMLBPickByMembersTitles
  squares: string
  golf_pick_x: PickXLeaderboardTitles
  golf_pick_x_results: Exclude<PickXLeaderboardTitles, 'entryColor'>
  golf_majors_year_to_date: MajorsYearToDateTitles
  golf_majors_by_tournament: MajorsByTournamentTitles
  golf_majors_player_performance_summary: MajorsPlayerPerformanceSummaryTitles
  golf_majors_player_value_summary: MajorsPlayerValueSummaryTitles
}

export type TheadData<
  TPoolType extends keyof PoolTypesObjForEntriesTable = PoolTypesObjForEntriesTable['bracket'],
> = {
  [key in EntriesTableKeys[TPoolType]]: TheadTitle<TPoolType>
}

export type TheadTitle<
  TPoolType extends keyof PoolTypesObjForEntriesTable = PoolTypesObjForEntriesTable['bracket'],
> = {
  title: string | ReactElement
  sort?: { name: EntriesTableKeys[TPoolType] }
}

export type TBodyRowData<
  TPoolType extends keyof PoolTypesObjForEntriesTable = PoolTypesObjForEntriesTable['bracket'],
> = {
  [key in EntriesTableKeys[TPoolType]]: TBodyCell
}

export type TBodyCell = {
  content: string | number | ReactElement
  bgColor?: string
  colored?: boolean
  coloredGreen?: boolean
}

export type SortType<
  TPoolType extends keyof PoolTypesObjForEntriesTable = PoolTypesObjForEntriesTable['bracket'],
> = {
  name: EntriesTableKeys[TPoolType] | null
  type: 'top' | 'bottom' | null
}

type TableTypeProps<
  TPoolType extends keyof PoolTypesObjForEntriesTable = PoolTypesObjForEntriesTable['bracket'],
> = {
  theadList: TheadData<TPoolType> | null
  sort?: SortType<TPoolType>
  setSort?: Dispatch<React.SetStateAction<SortType<TPoolType>>>
  tbodyData: TBodyRowData<TPoolType>[]
  className?: string
  cellHeight?: string
  defaultColorThead?: boolean
}

export default function EntriesTable<
  TPoolType extends keyof PoolTypesObjForEntriesTable = PoolTypesObjForEntriesTable['bracket'],
>({
  sort,
  theadList,
  setSort,
  tbodyData,
  className = '',
  cellHeight = '',
  defaultColorThead = false,
}: TableTypeProps<TPoolType>) {
  function handlingSort(sortName: SortType<TPoolType>['name']) {
    if (sort && setSort) {
      if (sortName === sort.name) {
        if (sort.type === null) setSort((prev) => ({ ...prev, type: 'top' }))
        if (sort.type === 'top')
          setSort((prev) => ({ ...prev, type: 'bottom' }))
        if (sort.type === 'bottom') setSort({ name: null, type: null })

        return
      }

      setSort({ name: sortName, type: 'top' })
    }
  }

  return (
    <div>
      <div className={classNames([styles.thead, className])}>
        {theadList &&
          Object.values(theadList).map((value: unknown, i: number) => {
            const title = value as TheadTitle<TPoolType>

            const activeSort: boolean | undefined =
              title.sort && title.sort.name === sort?.name

            return (
              <div
                className={classNames(styles.title, {
                  [styles.defaultColor]: defaultColorThead,
                })}
                key={i}
              >
                {title.sort ? (
                  <div
                    className={classNames(styles.titleWithSort, {
                      [styles.active]: activeSort,
                    })}
                    onClick={() => title.sort && handlingSort(title.sort.name)}
                  >
                    <span>{title.title}</span>
                    <Sorting
                      active={
                        sort?.name === title.sort.name ? sort?.type : null
                      }
                    />
                  </div>
                ) : (
                  <>{title.title}</>
                )}
              </div>
            )
          })}
      </div>
      <div className={styles.tbody}>
        {tbodyData.map((row: TBodyRowData<TPoolType>, i: number) => {
          return (
            <div key={i} className={classNames(styles.row, className)}>
              {Object.values(row).map((value, i: number) => {
                const cell = value as TBodyCell

                return (
                  <div
                    key={i}
                    style={{
                      backgroundColor: cell.bgColor,
                      height: cellHeight,
                    }}
                    className={classNames({
                      [styles.colored]: cell.colored,
                      [styles.coloredGreen]: cell.coloredGreen,
                    })}
                  >
                    {cell.content}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
