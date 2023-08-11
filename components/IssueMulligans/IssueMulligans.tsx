import classNames from 'classnames'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'

import {
  SurvivorEntriesItem,
  SurvivorEntriesItemForecastItem,
  api,
  CustomMulligansForecasts,
} from '@/api'
import { getShortName } from '@/config/constants'
import { Switcher, Sorting } from '@/features/ui'
import { SortingProps } from '@/features/ui/Sorting/Sorting'
import { useGetPoolEntries } from '@/helpers'

import styles from './IssueMulligans.module.scss'

type EntriesByWeeks = {
  [key: number]: EntriesByWeeksItem
}

type EntriesByWeeksItem = {
  entryName: string
  forecastId: number
  forecastIds: number[]
  issueMulligan: number
  memberId: number
  memberName: string
  mulligansToDate: number
  currentStatus: 'Eliminated' | 'Active' | string
}

type SortType = {
  name: 'id' | 'name' | 'entry-name' | null
  sort: SortingProps['active']
}

type CustomForecasts = {
  [key: number]: {
    forecastId: number
    value: boolean
  }
}

export function IssueMulligans({
  currentWeek,
  setMulligansObj,
  commish = false,
}: {
  currentWeek: string
  setMulligansObj?: Dispatch<SetStateAction<CustomMulligansForecasts | null>>
  commish?: boolean
}) {
  const {
    query: { poolId },
  } = useRouter()

  const { poolEntriesData, poolEntriesMutate } = useGetPoolEntries<'survivor'>({
    poolId: Number(poolId),
    weekNumber: Number(currentWeek),
  })

  const [changedMulligans, setChangedMulligans] =
    useState<CustomMulligansForecasts>({})

  const entriesByWeeks: {
    [key: number]: EntriesByWeeks
  } = {}
  const countMulligansByEntryId: {
    [key: number]: 1 | 0
  } = {}

  const [sort, setSort] = useState<SortType>({ name: null, sort: null })

  const handlingSortMemoized = useCallback(
    (sortName: SortType['name']) => {
      if (sortName === sort.name) {
        if (sort.sort === null) setSort((prev) => ({ ...prev, sort: 'top' }))
        if (sort.sort === 'top')
          setSort((prev) => ({ ...prev, sort: 'bottom' }))
        if (sort.sort === 'bottom') setSort({ name: null, sort: null })
        return
      }

      setSort({ name: sortName, sort: 'top' })
    },
    [sort],
  )

  poolEntriesData.forEach((entry) => {
    if (entry.forecasts.length) {
      const checked_weeks: number[] = []

      entry.forecasts.forEach((forecast) => {
        if (
          (forecast.status === 'lost' && entry.is_closed) ||
          forecast.is_mulligan
        ) {
          if (forecast.is_mulligan) {
            if (countMulligansByEntryId?.[entry.id]) {
              countMulligansByEntryId[entry.id] += checked_weeks.includes(
                forecast.week_number,
              )
                ? 0
                : 1
            } else {
              countMulligansByEntryId[entry.id] = 1
            }

            checked_weeks.push(forecast.week_number)
          }

          if (!entriesByWeeks[forecast.week_number]) {
            entriesByWeeks[forecast.week_number] = {}

            entriesByWeeks[forecast.week_number][entry.id] =
              getDataFromEntryByWeek(entry, forecast)
          } else {
            if (entriesByWeeks[forecast.week_number][entry.id]) {
              entriesByWeeks[forecast.week_number][entry.id][
                'forecastIds'
              ].push(forecast.id)
            } else {
              entriesByWeeks[forecast.week_number][entry.id] =
                getDataFromEntryByWeek(entry, forecast)
            }
          }
        }
      })
    }
  })

  function getDataFromEntryByWeek(
    entry: SurvivorEntriesItem,
    forecast: SurvivorEntriesItemForecastItem,
  ) {
    return {
      memberId: entry.id,
      entryName: entry.name,
      memberName: entry.user.first_name + ' ' + entry.user.last_name,
      mulligansToDate: 0,
      currentStatus: forecast.is_mulligan
        ? 'Active'
        : entry.is_closed
        ? 'Eliminated'
        : '',
      issueMulligan: forecast.is_mulligan,
      forecastId: forecast.id,
      forecastIds: [forecast.id],
    }
  }

  function onChangeTypes(
    e: boolean,
    issueMulligan: number,
    forecastIds: number[],
  ) {
    const value = e

    if (issueMulligan == Number(value)) {
      const tempMulligans: CustomForecasts = { ...changedMulligans }
      forecastIds.forEach((forecastId) => {
        delete tempMulligans[forecastId]
      })
      setChangedMulligans(tempMulligans)
      setMulligansObj && setMulligansObj(tempMulligans)
    } else {
      const newForecasts: CustomForecasts = {}

      forecastIds.forEach((forecastId) => {
        newForecasts[forecastId] = {
          forecastId: forecastId,
          value: value,
        }
      })

      setChangedMulligans({
        ...changedMulligans,
        ...newForecasts,
      })

      setMulligansObj &&
        setMulligansObj({
          ...changedMulligans,
          ...newForecasts,
        })
    }
  }

  async function saveMulligans() {
    await api.pools.saveMulligans(
      Number(poolId),
      Object.values(changedMulligans),
    )
    poolEntriesMutate()
  }

  const entriesBySelectedWeek = entriesByWeeks[Number(currentWeek)]
  const sortedEntries =
    entriesBySelectedWeek && Object.values(entriesBySelectedWeek).sort(sorting)

  function sorting(a: EntriesByWeeksItem, b: EntriesByWeeksItem) {
    if (sort.name === 'id') {
      if (sort.sort === 'bottom') {
        if (a.memberId > b.memberId) return -1
        if (a.memberId < b.memberId) return 1
        return 0
      } else {
        if (a.memberId > b.memberId) return 1
        if (a.memberId < b.memberId) return -1
        return 0
      }
    }

    if (sort.name === 'name') {
      if (sort.sort === 'bottom') {
        if (a.memberName > b.memberName) return -1
        if (a.memberName < b.memberName) return 1
        return 0
      } else {
        if (a.memberName > b.memberName) return 1
        if (a.memberName < b.memberName) return -1
        return 0
      }
    }

    if (sort.name === 'entry-name') {
      if (sort.sort === 'bottom') {
        if (a.entryName > b.entryName) return -1
        if (a.entryName < b.entryName) return 1
        return 0
      } else {
        if (a.entryName > b.entryName) return 1
        if (a.entryName < b.entryName) return -1
        return 0
      }
    }
    return 0
  }

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.commish]: commish,
      })}
    >
      {!entriesBySelectedWeek ? (
        <table>
          <thead>
            <tr>
              <th>
                <div
                  className={classNames(styles.sortWrapper, {
                    [styles.active]: sort.name === 'id',
                  })}
                  onClick={() => handlingSortMemoized('id')}
                >
                  Membership ID
                  <Sorting active={sort.name === 'id' ? sort.sort : null} />
                </div>
              </th>
              <th>
                <div
                  className={classNames(styles.sortWrapper, {
                    [styles.active]: sort.name === 'name',
                  })}
                  onClick={() => handlingSortMemoized('name')}
                >
                  Name
                  <Sorting active={sort.name === 'name' ? sort.sort : null} />
                </div>
              </th>
              <th>
                <div
                  className={classNames(styles.sortWrapper, {
                    [styles.active]: sort.name === 'entry-name',
                  })}
                  onClick={() => handlingSortMemoized('entry-name')}
                >
                  Entry Name
                  <Sorting
                    active={sort.name === 'entry-name' ? sort.sort : null}
                  />
                </div>
              </th>
              <th>Mulligans to date</th>
              <th>Current Status</th>
              <th>Issue Mulligan</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries?.map((item, i) => (
              <tr key={i}>
                <td>{item.memberId}</td>
                <td>
                  <div className={styles.nameWrapper}>
                    <div
                      className={classNames('short-name-block', styles.short)}
                    >
                      <p>{getShortName(item.entryName).toUpperCase()}</p>
                    </div>
                    {item.memberName}
                  </div>
                </td>
                <td>{item.entryName}</td>
                <td>{countMulligansByEntryId[item.memberId] || 0}</td>
                <td
                  className={classNames(styles.status, {
                    [styles.active]: item.currentStatus === 'Active',
                  })}
                >
                  {item.currentStatus}
                </td>
                <SwitcherWrapper item={item} onChangeTypes={onChangeTypes} />
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div
          className={classNames(styles.noData, { [styles.commish]: commish })}
        >
          No entries were eliminated in <strong>Week {currentWeek}</strong>
        </div>
      )}
      {!setMulligansObj && entriesBySelectedWeek && (
        <div
          className={classNames('button button-blue-light', styles.button)}
          onClick={() => saveMulligans()}
        >
          save mulligans
        </div>
      )}
    </div>
  )
}

function SwitcherWrapper({
  item,
  onChangeTypes,
}: {
  item: EntriesByWeeksItem
  onChangeTypes: (
    e: boolean,
    issueMulligan: number,
    forecastIds: number[],
  ) => void
}) {
  const [switcher, setSwitcher] = useState(!!item.issueMulligan)

  return (
    <td>
      <Switcher
        value={switcher}
        onChange={() => {
          setSwitcher(!switcher)
          onChangeTypes(!switcher, item.issueMulligan, item.forecastIds)
        }}
      />
    </td>
  )
}
