import classNames from 'classnames'
import Image from 'next/image'
import { useState } from 'react'

import { Participant, PlayoffEntriesResponseData, PlayoffEntry } from '@/api'
import { generateParticipantImagePath, getShortName } from '@/config/constants'
import { Option } from '@/features/ui/Select/Select'
import { Sorting, SortingProps } from '@/features/ui/Sorting'
import { entriesFiltration } from '@/helpers'

import styles from './PlayoffTable.module.scss'

type SortType = {
  name: 'name' | null
  sort: SortingProps['active']
}

export function PlayoffTable({
  playoffData,
  members,
  search,
  membersOptions,
}: {
  playoffData: PlayoffEntriesResponseData
  members: string[]
  search: string
  membersOptions: Option[]
}) {
  const [sort, setSort] = useState<SortType>({ name: null, sort: null })
  const [activeIndex, setActiveIndex] = useState<null | number>(null)

  const entries = playoffData.entries ?? []
  const excluded_participants = playoffData.excluded_participants ?? []
  const isLess14 = playoffData.playoff_forecasts_count < 14

  const filteredEntries = entriesFiltration<PlayoffEntry>({
    search,
    entries: entries,
    members,
    pathForSearch: ['name'],
    pathForFiltersMembers: ['user_id'],
  })

  const sortedData =
    sort.sort === null ? filteredEntries : [...filteredEntries].sort(sorting)

  function handlingSort(sortName: SortType['name']) {
    if (sortName === sort.name) {
      if (sort.sort === null) setSort((prev) => ({ ...prev, sort: 'top' }))
      if (sort.sort === 'top') setSort((prev) => ({ ...prev, sort: 'bottom' }))
      if (sort.sort === 'bottom') setSort({ name: null, sort: null })
      return
    }

    setSort({ name: sortName, sort: 'top' })
  }

  function sorting(a: PlayoffEntry, b: PlayoffEntry) {
    if (sort.name === 'name') {
      if (sort.sort === 'bottom') {
        if (a.name > b.name) return -1
        if (a.name < b.name) return 1
        return 0
      } else {
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
      }
    }
    return 0
  }

  const isExcluded = (participant: Participant) => {
    const filtered = excluded_participants.filter((item) => {
      return item?.id === participant.id
    })
    return filtered.length > 0
  }

  const points: number[] = []

  if (playoffData?.playoff_forecasts_count) {
    for (let i = playoffData?.playoff_forecasts_count; i >= 1; i--) {
      points.push(i)
    }
  }

  function changeActive(id: number | null) {
    if (id !== null) {
      setActiveIndex(id)
    } else setActiveIndex(null)
  }

  return (
    <div className={styles.wrapper}>
      {sortedData.length ? (
        <>
          <div className={styles.headWrapper}>
            <div className={classNames(styles.head, styles.row)}>
              <div
                className={classNames(styles.names, {
                  [styles.active]: sort.name === 'name',
                })}
                onClick={() => handlingSort('name')}
              >
                Entry Name{' '}
                <Sorting active={sort.name === 'name' ? sort.sort : null} />
              </div>
              <div className={styles.points}>
                {points.map((point, i) => (
                  <div
                    key={point}
                    className={classNames(styles.point, {
                      [styles.bigIcon]: isLess14,
                      [styles.activeNumber]: i == activeIndex,
                    })}
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.body}>
            {sortedData.map((entry, i) => {
              return (
                <div
                  key={i}
                  className={classNames(styles.row, 'short-name-block-wrapper')}
                >
                  <div className={classNames(styles.names)}>
                    <div
                      className="short-name-block"
                      style={{ backgroundColor: entry.entry_color }}
                    >
                      <p>{getShortName(entry.name).toUpperCase()}</p>
                    </div>
                    {entry.name}
                  </div>
                  <div
                    className={styles.points}
                    onMouseOut={() => setActiveIndex(null)}
                  >
                    {entry.forecasts.map((forecast, i) => {
                      return (
                        <div
                          className={classNames(styles.point, {
                            [styles.red]: isExcluded(forecast.participant),
                          })}
                          key={forecast.id}
                          onMouseOver={() => changeActive(i)}
                        >
                          <Image
                            src={generateParticipantImagePath(
                              forecast.participant.external_id,
                            )}
                            width={isLess14 ? 45 : 40}
                            height={isLess14 ? 45 : 40}
                            alt={
                              forecast.participant.short_name ??
                              forecast.participant.name
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
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
