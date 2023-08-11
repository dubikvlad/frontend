import classNames from 'classnames'
import { useRouter } from 'next/router'
import React, { Dispatch, Fragment, SetStateAction, useState } from 'react'

import { ScoreDifferentialEntry, ScoreDifferentialResponseData } from '@/api'
import { getShortName } from '@/config/constants'
import { FilterByEntryAndMembersAndWeeks } from '@/features/components'
import {
  SortType,
  TBodyCell,
  TBodyRowData,
  TheadData,
  TheadTitle,
} from '@/features/components/EntriesTable'
import { Sorting, TableSwiper } from '@/features/ui'
import { SelectProps } from '@/features/ui/Select/Select'
import { entriesDataSorting, entriesFiltration, usePool } from '@/helpers'
import { useGetScoreDifferential } from '@/helpers/hooks'

import styles from './XRunScoreDifferential.module.scss'

export function XRunScoreDifferential() {
  const {
    query: { poolId },
  } = useRouter()

  const { scoreDifferentialData } = useGetScoreDifferential(String(poolId))

  const { poolData } = usePool<'xrun'>(Number(poolId))

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])
  const [membersOptions, setMembersOptions] = useState<SelectProps['options']>(
    [],
  )

  const [forecastIndices, setForecastIndices] = useState<{
    first: number
    last: number
  }>({ first: 0, last: 8 })

  const [sort, setSort] = useState<SortType<'xrun_score_differential'>>({
    name: null,
    type: null,
  })

  if (!scoreDifferentialData || !poolData) return <></>

  const filteredEntries = entriesFiltration<ScoreDifferentialEntry>({
    search: search,
    entries: scoreDifferentialData?.entries,
    members: members,
    pathForSearch: ['name'],
    pathForFiltersMembers: ['user_id'],
  })

  const itemsCount = 9

  const theadList: TheadData<'xrun_score_differential'> | null =
    scoreDifferentialData
      ? scoreDifferentialTheadList({
          data: {
            entries: filteredEntries,
            weeks: scoreDifferentialData.weeks,
          },
          forecastIndices,
          setForecastIndices,
          itemsCount,
        })
      : null

  const tbodyData: TBodyRowData<'xrun_score_differential'>[] | null =
    scoreDifferentialData
      ? generateTableData({
          data: {
            entries: filteredEntries,
            weeks: scoreDifferentialData.weeks,
          },
          forecastIndices,
        })
      : null

  function handlingSort(sortName: SortType<'xrun_score_differential'>['name']) {
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

  if (!tbodyData) return <></>

  const renderEntriesData: TBodyRowData<'xrun_score_differential'>[] =
    !sort.type
      ? tbodyData
      : entriesDataSorting<'xrun_score_differential'>(tbodyData, sort)

  const isDisabledFilters: boolean =
    !renderEntriesData.length && !members.length && !search

  return (
    <div className={styles.container}>
      <FilterByEntryAndMembersAndWeeks
        search={search}
        setSearch={setSearch}
        members={members}
        setMembers={setMembers}
        setMembersOptions={setMembersOptions}
        poolData={poolData}
        isDisabled={isDisabledFilters}
      />
      {!!renderEntriesData && renderEntriesData.length ? (
        <div className={styles.tableWrap}>
          <div className={styles.thead}>
            {theadList &&
              Object.values(theadList).map((value: unknown, i: number) => {
                const title = value as TheadTitle<'xrun_score_differential'>

                const activeSort: boolean | undefined =
                  title.sort && title.sort.name === sort?.name

                return (
                  <div className={styles.title} key={i}>
                    {title.sort ? (
                      <div
                        className={classNames(styles.titleWithSort, {
                          [styles.active]: activeSort,
                          [styles.cellCenter]:
                            title.sort.name === 'best' ||
                            title.sort.name === 'total',
                        })}
                        onClick={() =>
                          title.sort && handlingSort(title.sort.name)
                        }
                      >
                        <>{title.title}</>
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
            {renderEntriesData &&
              renderEntriesData.map(
                (row: TBodyRowData<'xrun_score_differential'>, i: number) => {
                  return (
                    <div key={i} className={styles.row}>
                      {Object.entries(row).map(([key, value], i: number) => {
                        const cell = value as TBodyCell

                        return (
                          <div
                            className={classNames(styles.tCell, {
                              [styles.weeksIndent]: key === 'weeks',
                            })}
                            style={{
                              backgroundColor: cell.bgColor,
                            }}
                            key={i}
                          >
                            {cell.content}
                          </div>
                        )
                      })}
                    </div>
                  )
                },
              )}
          </div>
        </div>
      ) : (
        <div className={styles.notFound}>
          {search.trim() ? (
            <>
              Sorry, there were no results found for{' '}
              <span>&quot;{search}&quot;</span>
            </>
          ) : (
            <>
              Unfortunately, we did not find any suitable entries for{' '}
              <span>
                {members.length
                  ? membersOptions
                      .reduce<string[]>((acc, option) => {
                        if (members.includes(option.name))
                          acc.push(option.title)
                        return acc
                      }, [])
                      .join(', ')
                  : 'All members'}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function scoreDifferentialTheadList({
  data,
  forecastIndices,
  setForecastIndices,
  itemsCount,
}: {
  data: ScoreDifferentialResponseData
  forecastIndices: { first: number; last: number }
  setForecastIndices: Dispatch<SetStateAction<{ first: number; last: number }>>
  itemsCount: number
}): TheadData<'xrun_score_differential'> {
  return {
    'entry.color': {
      title: '',
    },
    name: { title: 'Entry Name', sort: { name: 'name' } },
    weeks: {
      title: (
        <TableSwiper
          items={data.weeks}
          itemsCount={itemsCount}
          itemIndices={forecastIndices}
          setItemIndices={setForecastIndices}
          className={styles.weekTtlInSwiper}
        />
      ),
    },
    best: {
      title: 'Best',
      sort: { name: 'best' },
    },
    total: {
      title: 'Total',
      sort: { name: 'total' },
    },
  }
}

function generateTableData({
  data,
  forecastIndices,
}: {
  data: ScoreDifferentialResponseData
  forecastIndices: { first: number; last: number }
}): TBodyRowData<'xrun_score_differential'>[] {
  return data.entries
    .filter((entry) => entry.xrun_forecasts.length)
    .map((entry): TBodyRowData<'xrun_score_differential'> => {
      const weeks = [...data.weeks, ...[...Array(100).keys()].map(() => null)]

      return {
        'entry.color': {
          content: (
            <div className={styles.itemNameWrap}>
              <div
                className={styles.itemName}
                style={{ backgroundColor: entry.color }}
              >
                {getShortName(entry.name).toUpperCase()}
              </div>
            </div>
          ),
        },
        name: { content: entry.name },
        weeks: {
          content: (
            <div className={styles.forecastWrap}>
              {weeks.map((week_number, index) => {
                const forecasts = entry.xrun_forecasts.slice(
                  forecastIndices.first,
                  forecastIndices.last + 1,
                )

                const forecast = forecasts.find((forecast) => {
                  return forecast.week_number === week_number
                })

                if (forecast) {
                  return (
                    <Fragment key={index}>
                      {typeof forecast?.score === 'number' ? (
                        <div
                          className={classNames(styles.score, {
                            [styles.win]: forecast.winner,
                          })}
                        >
                          {forecast?.score}
                        </div>
                      ) : null}
                    </Fragment>
                  )
                }
                if (index > forecastIndices.last + 1) {
                  return <div className={styles.score} key={index}></div>
                }
              })}
            </div>
          ),
        },
        best: {
          content: (
            <p className={styles.customCell}>
              {entry.xrun_forecasts.reduce((acc, cur) => {
                if (cur.score && cur.score < acc) {
                  acc = cur.score
                }
                return acc
              }, 0)}
            </p>
          ),
        },
        total: {
          content: <p className={styles.customCell}>{entry.total_score}</p>,
          bgColor: entry.winner ? 'var(--bg-color-11)' : '',
        },
      }
    })
}
