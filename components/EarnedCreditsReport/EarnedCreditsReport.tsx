import classNames from 'classnames'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ValueType,
  NameType,
} from 'recharts/types/component/DefaultTooltipContent'

import { EarnedCreditsResponseData, User } from '@/api'
import {
  dateFormattingHistory,
  defaultEntryColor,
  getShortName,
} from '@/config/constants'
import { Input, Select2, SelectWithCheckboxes } from '@/features/ui'
import { useEarnedCredits, useGetPoolUsers, usePool } from '@/helpers'

import styles from './EarnedCreditsReport.module.scss'

export function EarnedCreditsReport() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'credits'>(poolId ? +poolId : undefined)
  const { earnedCreditsData, earnedCreditsIsLoading } = useEarnedCredits({
    poolId: poolData?.id,
  })

  const [selectedEntryId, setSelectedEntryId] = useState<null | number>(null)

  const { poolUsersData } = useGetPoolUsers(poolData?.id)

  const [searchValue, setSearchValue] = useState('')

  const [members, setMembers] = useState<string[]>([])
  const [numberOfCredits, setNumberOfCredits] = useState<string>(
    numberOfCreditsOptions[0].name,
  )

  if (!poolData) return null

  function filterData() {
    let data = [...earnedCreditsData]

    if (members.length) {
      data = data.filter((user) => members.includes(String(user.id)))
    }

    if (!!searchValue.trim()) {
      data = data.filter(
        (user) =>
          user.name
            .trim()
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase()) ||
          user.entries.some((entry) =>
            entry.name
              .trim()
              .toLowerCase()
              .includes(searchValue.trim().toLowerCase()),
          ),
      )
    }

    data.sort((aItem, bItem) => {
      if (numberOfCredits === 'Sort by number of credits') {
        const aEntriesNumber = aItem.entries.reduce(
          (sum, entry) => (sum += entry.credits_total),
          0,
        )

        const bEntriesNumber = bItem.entries.reduce(
          (sum, entry) => (sum += entry.credits_total),
          0,
        )

        return bEntriesNumber - aEntriesNumber
      }

      if (numberOfCredits === 'Sort by wins') {
        const aEntriesWins = aItem.entries.reduce(
          (sum, entry) => (sum += entry.credits_won),
          0,
        )

        const bEntriesWins = bItem.entries.reduce(
          (sum, entry) => (sum += entry.credits_won),
          0,
        )

        return bEntriesWins - aEntriesWins
      }

      if (numberOfCredits === 'Sort by date of join') {
        const aDateJoined = new Date(aItem.date_joined).getTime()
        const bDateJoined = new Date(bItem.date_joined).getTime()

        return bDateJoined - aDateJoined
      }

      if (numberOfCredits === 'Sort by name') {
        if (aItem.name > bItem.name) return 1
        if (aItem.name < bItem.name) return -1
        return 0
      }

      return 0
    })

    return data
  }

  const filteredData = filterData()

  return (
    <div className={styles.wrapper}>
      {earnedCreditsData.length ? (
        <>
          <Filter
            poolUsersData={poolUsersData}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            members={members}
            setMembers={setMembers}
            numberOfCredits={numberOfCredits}
            setNumberOfCredits={setNumberOfCredits}
          />

          <div className={styles.reportWrapper}>
            <div className={classNames(styles.reportRow, styles.reportRowHead)}>
              <p>Name</p>
              <p>Date Joined</p>
              <div>
                <p>Entry Name</p>
                <p>Picks Made</p>
                <p>Wins</p>
                <p>Losses</p>
                <p>Credits</p>
              </div>
            </div>

            <div>
              {filteredData.length ? (
                filteredData.map((item) => (
                  <EarnedCreditsItem
                    key={item.id}
                    item={item}
                    selectedEntryId={selectedEntryId}
                    setSelectedEntryId={setSelectedEntryId}
                    availableWeek={poolData.available_week}
                  />
                ))
              ) : !!searchValue.trim() ? (
                <p className={styles.noData}>
                  No matching entries were found for{' '}
                  <span>
                    &quot;{searchValue.trim()}
                    &quot;
                  </span>
                </p>
              ) : (
                <p className={styles.noData}>
                  No matching entries were found for the members you selected
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        !earnedCreditsIsLoading && (
          <p className={styles.noData}>
            There are <span>no entries</span> in the pool. Statistics will be
            available after one of the members makes his first pick
          </p>
        )
      )}
    </div>
  )
}

type EarnedCreditsItemProps = {
  item: EarnedCreditsResponseData
  selectedEntryId: number | null
  setSelectedEntryId: Dispatch<
    SetStateAction<EarnedCreditsItemProps['selectedEntryId']>
  >
  availableWeek: number[]
}

function EarnedCreditsItem({
  item,
  selectedEntryId,
  setSelectedEntryId,
  availableWeek,
}: EarnedCreditsItemProps) {
  const selectedEntry = item.entries.find((item) => item.id === selectedEntryId)

  const chartData =
    selectedEntry && availableWeek.length
      ? availableWeek.map((week) => ({
          weekNumber: week,
          creditsTotal: selectedEntry.credits_by_week[week],
        }))
      : []

  return (
    <>
      <div className={styles.reportRow}>
        <p>{item.name}</p>
        <p>
          {dateFormattingHistory({
            text: item.date_joined,
            withDayOfWeek: false,
            withoutTime: true,
          })}
        </p>

        <div className={styles.entriesWrapper}>
          {item.entries.map((entry) => (
            <div
              key={entry.id}
              className={classNames(styles.entryItem, {
                [styles.entryItemActive]: entry.id === selectedEntryId,
              })}
              onClick={() =>
                setSelectedEntryId((prev) =>
                  prev === entry.id ? null : entry.id,
                )
              }
            >
              <div className={styles.entryNameWrapper}>
                <div
                  className="short-name-block"
                  style={{
                    backgroundColor: entry?.entry_color ?? defaultEntryColor,
                  }}
                >
                  <p>{getShortName(entry.name)}</p>
                </div>
                <p>{entry.name}</p>
              </div>
              <p>{entry.count_picks}</p>
              <p>{entry.credits_won}</p>
              <p>{entry.credits_lost}</p>
              <p>{entry.credits_total}</p>
            </div>
          ))}
        </div>
      </div>

      {!!selectedEntry && (
        <div className={styles.diagramWrapper}>
          <p className={styles.diagramTitle}>Credits earned</p>

          <p className={styles.yAxisName}>Credits</p>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} className={styles.areaChart}>
              <defs>
                <linearGradient
                  id="colorSurvivors"
                  gradientTransform="rotate(90)"
                >
                  <stop offset="17.2%" stopColor="rgba(39, 50, 151, 0.05)" />
                  <stop offset="102.74%" stopColor="rgba(40, 50, 141, 0)" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="5 5"
                strokeWidth={0.5}
                stroke="#eaeaea"
                vertical={false}
              />

              <Area
                type="monotone"
                dataKey="creditsTotal"
                stroke={defaultEntryColor}
                fillOpacity={1}
                fill="url(#colorSurvivors)"
                strokeWidth={2}
                activeDot={{
                  strokeWidth: 3,
                  stroke: '#fff',
                  r: 7,
                  fill: defaultEntryColor,
                }}
              />

              <Tooltip content={<CustomTooltip />} cursor={false} />

              <XAxis
                dataKey="weekNumber"
                axisLine={false}
                tickLine={false}
                dy={10}
                style={{ opacity: 1 }}
              />

              <YAxis
                allowDecimals={false}
                dataKey="creditsTotal"
                axisLine={false}
                tickLine={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          <p className={styles.xAxisName}>Week</p>
        </div>
      )}
    </>
  )
}

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  const tooltipRef = useRef<HTMLDivElement>(null)

  // useEffect нужен для стилизации номера недели
  useEffect(() => {
    let currentTick: SVGTSpanElement | null = null

    if (!!active && !!payload?.length && tooltipRef.current) {
      const svgElement = tooltipRef.current.parentElement?.parentElement

      if (svgElement) {
        const { week } = payload[0].payload

        const ticksList = svgElement.querySelectorAll(
          '.recharts-layer.recharts-cartesian-axis.recharts-xAxis.xAxis > .recharts-cartesian-axis-ticks > .recharts-layer.recharts-cartesian-axis-tick',
        )

        for (let i = 0; i < ticksList.length; i++) {
          if (currentTick !== null) break

          const elem = ticksList[i]
          if (elem.querySelector('tspan')?.textContent === String(week)) {
            currentTick = elem.querySelector('tspan')
          }
        }

        if (currentTick) currentTick.style.opacity = '1'
      }
    }

    return () => {
      if (currentTick) currentTick.style.opacity = ''
    }
  }, [active, payload, tooltipRef])

  if (!active || !payload?.length) return null

  const { weekNumber, creditsTotal } = payload[0].payload

  return (
    <div className={styles.customTooltip} ref={tooltipRef}>
      <p className={styles.customTooltipTitle}>Week {weekNumber}</p>

      <p className={styles.customTooltipCredits}>
        <span>Credits</span>
        <span>{creditsTotal}</span>
      </p>
    </div>
  )
}

const numberOfCreditsOptions = [
  { title: 'Sort by number of credits', name: 'Sort by number of credits' },
  { title: 'Sort by wins', name: 'Sort by wins' },
  { title: 'Sort by date of join', name: 'Sort by date of join' },
  { title: 'Sort by name', name: 'Sort by name' },
]

type FilterProps = {
  poolUsersData: User[]
  searchValue: string
  setSearchValue: Dispatch<SetStateAction<string>>
  members: string[]
  setMembers: Dispatch<SetStateAction<string[]>>
  numberOfCredits: string
  setNumberOfCredits: Dispatch<SetStateAction<string>>
}

function Filter({
  poolUsersData,
  searchValue,
  setSearchValue,
  members,
  setMembers,
  numberOfCredits,
  setNumberOfCredits,
}: FilterProps) {
  const memberOptions = poolUsersData.map((item) => ({
    title: item.username,
    name: String(item.id),
  }))

  return (
    <div className={styles.filterWrapper}>
      <Input
        value={searchValue}
        onChange={setSearchValue}
        type="search"
        placeholder="Search"
      />

      <SelectWithCheckboxes
        value={members}
        onChange={setMembers}
        options={memberOptions}
        placeholder="All members"
      />

      <Select2
        wrapperClassName={styles.numberOfCreditsSelect}
        value={numberOfCredits}
        onChange={setNumberOfCredits}
        options={numberOfCreditsOptions}
      />
    </div>
  )
}
