import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { WeeklyMembersPicksTableReportItem } from '@/api'
import { generateParticipantImagePath } from '@/config/constants'
import { HorizontalFilterByWeek } from '@/features/components/HorizontalFilterByWeek'
import { Select } from '@/features/ui'
import { usePool, useWeeklyMembersPicksReport } from '@/helpers'

import styles from './SurvivorManageEntriesWeeklyPickSummary.module.scss'

export function SurvivorManageEntriesWeeklyPickSummary() {
  const {
    query: { poolId },
  } = useRouter()

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  const { poolData } = usePool(Number(poolId))

  const currentWeek = poolData?.pick_pool.current_week
  const availableWeeks = poolData?.available_week ?? []

  const { weeklyMembersPicksReportData, weeklyMembersPicksReportIsLoading } =
    useWeeklyMembersPicksReport({
      poolId: Number(poolId),
      weekNumber: selectedWeek,
    })

  const sortByOptions = [
    { title: 'Pick popularity', name: 'pick-popularity' },
    { title: 'Team name', name: 'team-name' },
    { title: 'The greatest survivors', name: 'the-greatest-survivors' },
    { title: 'The greatest eliminated', name: 'the-greatest-eliminated' },
  ]

  const [sortByValue, setSortByValue] = useState(sortByOptions[0].name)

  const select2Options = [
    { title: 'Any outcome', name: 'any-outcome' },
    { title: 'Only eliminated picks', name: 'only-eliminated-picks' },
    { title: 'Only survivor picks', name: 'only-survivor-picks' },
  ]

  const [select2Value, setSelect2Value] = useState(select2Options[0].name)

  function filterByOutcome(data: WeeklyMembersPicksTableReportItem[]) {
    if (select2Value === 'only-eliminated-picks') {
      return data.filter(
        (item) => item.status === 'lost' || item.id === 'no_pick',
      )
    }
    if (select2Value === 'only-survivor-picks') {
      return data.filter((item) => item.status === 'win')
    }
    return data
  }

  const dataFilteredByOutcome = weeklyMembersPicksReportData?.table_report
    ? filterByOutcome([...weeklyMembersPicksReportData.table_report])
    : []

  const select3Options = [
    { title: 'Quantity', name: 'quantity' },
    { title: 'Percentage', name: 'percentage' },
  ]

  const [select3Value, setSelect3Value] = useState(select3Options[0].name)

  function sortData(
    a: WeeklyMembersPicksTableReportItem,
    b: WeeklyMembersPicksTableReportItem,
  ) {
    if (sortByValue === 'pick-popularity') {
      return b.picked_count - a.picked_count
    }

    if (sortByValue === 'team-name') {
      if (a.name > b.name) {
        return 1
      } else {
        return -1
      }
    }

    if (sortByValue === 'the-greatest-survivors') {
      if (a.status === 'win' && b.status === 'win') {
        return b.picked_count - a.picked_count
      } else if (a.status === 'lost' && b.status === 'lost') {
        return a.picked_count - b.picked_count
      } else if (a.status === 'win' && b.status === 'lost') {
        return -1
      } else {
        return 1
      }
    }

    if (sortByValue === 'the-greatest-eliminated') {
      if (a.status === 'win' && b.status === 'win') {
        return a.picked_count - b.picked_count
      } else if (a.status === 'lost' && b.status === 'lost') {
        return b.picked_count - a.picked_count
      } else if (a.status === 'win' && b.status === 'lost') {
        return 1
      } else {
        return -1
      }
    }

    return 0
  }

  const sortedData = dataFilteredByOutcome.sort(sortData)

  const {
    common_surviving_entries = 0,
    weekly_eliminated_entries: lostCount = 0,
    weekly_picks_entered: entriesCount = 0,
    weekly_missing_picks: missedCount = 0,
    weekly_mulligans_issues = 0,
  } = weeklyMembersPicksReportData ?? {}

  const winCount = common_surviving_entries - weekly_mulligans_issues

  const isNoPicks = weeklyMembersPicksReportData?.table_report
    ? !!weeklyMembersPicksReportData.table_report.find(
        (item) => item.id === 'no_pick',
      )
    : false

  type ChartItem = {
    type: 'win' | 'lost' | 'missed'
    value: number
    color: string
  }

  const chartData: ChartItem[] = [
    { type: 'win', value: !isNoPicks ? winCount : 0, color: '#57AB6F' },
    { type: 'lost', value: !isNoPicks ? lostCount : 0, color: '#D67474' },
    { type: 'missed', value: missedCount, color: '#909090' },
  ]

  const [chartHoverType, setChartHoverType] = useState<
    'win' | 'lost' | 'missed' | 'none'
  >('none')

  const manyDots = Array(60).fill('.').join('')

  const infoData = [
    { title: 'Surviving', count: winCount },
    { title: 'Eliminated', count: lostCount },
    { title: 'Missed', count: missedCount },
    { title: 'Mulligans given', count: weekly_mulligans_issues },
  ]

  if (
    poolData &&
    Number(poolData.pick_pool.start_week) > poolData.pick_pool.current_week
  )
    return (
      <div className={styles.noData}>
        <p>
          The Pool starts in <span>Week {poolData.pick_pool.start_week}</span>.
          Statistics will be available after the end of the first week of the
          pool
        </p>
      </div>
    )

  const countNonNullValues = chartData.reduce((acc, item) => {
    if (item.value !== 0) acc++
    return acc
  }, 0)

  const isOneIndicator = countNonNullValues === 1 || isNoPicks

  const isReportNotReady =
    weeklyMembersPicksReportData?.table_report &&
    !weeklyMembersPicksReportData.table_report.length

  return (
    <div className={styles.wrapper}>
      {!!currentWeek && !!availableWeeks.length && (
        <HorizontalFilterByWeek
          availableWeeks={availableWeeks}
          currentWeek={currentWeek}
          setSelectedWeek={setSelectedWeek}
          slidesPerView={9}
          isDisableSelectionComingWeeks
        />
      )}

      {weeklyMembersPicksReportIsLoading ? null : isReportNotReady ? (
        <div className={styles.reportNotReady}>
          A summary for <span>Week {selectedWeek}</span> will be available after
          the deadline
        </div>
      ) : (
        <div className={styles.weekSummaryWrapper}>
          <div>
            <div className={styles.filterWrapper}>
              <Select
                value={sortByValue}
                onChange={setSortByValue}
                options={sortByOptions}
                titleDisplayFormat={(title) => `Sort by ${title.toLowerCase()}`}
              />

              <Select
                value={select2Value}
                onChange={setSelect2Value}
                options={select2Options}
              />

              <Select
                value={select3Value}
                onChange={setSelect3Value}
                options={select3Options}
              />
            </div>

            <div className={styles.teamsList}>
              {sortedData.length
                ? sortedData.map((item) => {
                    return (
                      <TeamItem
                        key={`${item.id}-${selectedWeek}-${item.picked_count}-${item.name}`}
                        item={item}
                        isQuantity={select3Value === 'quantity'}
                      />
                    )
                  })
                : !!weeklyMembersPicksReportData?.table_report &&
                  sortedData.length !==
                    weeklyMembersPicksReportData.table_report.length && (
                    <p>
                      No results were found for your request this week. Try to
                      change the filter parameters.
                    </p>
                  )}
            </div>
          </div>

          <div>
            <p className={styles.weekSummaryText}>
              Week {selectedWeek} summary
            </p>

            <div className={styles.pieChartWrapper}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  {countNonNullValues === 0 && (
                    <Pie
                      data={[{ value: 100 }]}
                      dataKey="value"
                      innerRadius={125}
                      outerRadius={150}
                      fill="#909090"
                      isAnimationActive={false}
                      stroke="none"
                    />
                  )}
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={125}
                    outerRadius={150}
                    paddingAngle={isOneIndicator ? 0 : 5}
                    isAnimationActive={false}
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        className={classNames(styles.pieCell, {
                          [styles.pieCellOpacity]:
                            chartHoverType !== 'none' &&
                            chartHoverType !== entry.type,
                        })}
                        key={`cell-${index}`}
                        fill={entry.color}
                        onMouseMove={() => setChartHoverType(entry.type)}
                        onMouseLeave={() => setChartHoverType('none')}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className={styles.commonCountEntriesWrapper}>
                <p
                  className={classNames(styles.commonCountEntries, {
                    [styles.winCount]: chartHoverType === 'win',
                    [styles.lostCount]: chartHoverType === 'lost',
                    [styles.missedCount]: chartHoverType === 'missed',
                  })}
                >
                  {chartHoverType === 'win' && winCount}
                  {chartHoverType === 'lost' && lostCount}
                  {chartHoverType === 'missed' && missedCount}
                  {chartHoverType === 'none' &&
                    (isNoPicks ? missedCount : entriesCount)}
                </p>
                <p className={styles.entriesText}>
                  {chartHoverType === 'win' && 'surviving'}
                  {chartHoverType === 'lost' && 'eliminated'}
                  {chartHoverType === 'missed' && 'missed'}
                  {chartHoverType === 'none' && 'entries'}
                </p>
                {!!weekly_mulligans_issues && chartHoverType === 'lost' && (
                  <p className={styles.mulligansGiven}>
                    {weekly_mulligans_issues} Mulligans given
                  </p>
                )}
              </div>
            </div>

            <div className={styles.infoBlockWrapper}>
              {infoData.map((item, i) => (
                <div key={i}>
                  <p className={styles.infoTitle}>{item.title}</p>
                  <p className={styles.manyDots}>{manyDots}</p>
                  <p className={styles.infoCount}>{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type TeamItemProps = {
  item: WeeklyMembersPicksTableReportItem
  isQuantity: boolean
}

function TeamItem({ item, isQuantity = true }: TeamItemProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const textValueRef = useRef<HTMLParagraphElement>(null)

  const src = item.external_id
    ? generateParticipantImagePath(item.external_id)
    : null

  const [isPickedValueTextDisabled, setIsPickedValueTextDisabled] =
    useState(false)

  useEffect(() => {
    if (barRef.current && textValueRef.current) {
      const barStyles = getComputedStyle(barRef.current)

      const barWidthWithoutPadding =
        barRef.current.clientWidth -
        (!isNaN(parseInt(barStyles.paddingLeft))
          ? parseInt(barStyles.paddingLeft)
          : 0) -
        (!isNaN(parseInt(barStyles.paddingRight))
          ? parseInt(barStyles.paddingRight)
          : 0)

      const textValueStyles = getComputedStyle(textValueRef.current)

      const textValuesGap = !isNaN(parseInt(textValueStyles.columnGap))
        ? parseInt(textValueStyles.columnGap)
        : 0

      const textValuesInnerElements =
        textValueRef.current.querySelectorAll('span')

      const textValueInnerElementsWidth = Array.from(
        textValuesInnerElements,
      ).reduce((acc, item) => (acc += item.scrollWidth), 0)

      setIsPickedValueTextDisabled(
        textValueInnerElementsWidth +
          (textValuesInnerElements.length
            ? (textValuesInnerElements.length - 1) * textValuesGap
            : 0) >
          barWidthWithoutPadding,
      )
    }
  }, [barRef, textValueRef, item, isQuantity])

  return (
    <div className={styles.teamItem}>
      <div
        className={classNames(styles.team, {
          [styles.teamNoPicks]: item.id === 'no_pick',
        })}
      >
        <div>
          {!!src && <Image src={src} width={40} height={40} alt={item.name} />}
        </div>
        <div className={styles.teamName}>{item.name}</div>
      </div>
      <div className={styles.barWrapper}>
        <div
          ref={barRef}
          className={classNames(styles.bar, {
            [styles.barWin]: item.status === 'win',
            [styles.barLost]: item.status === 'lost' || item.id === 'no_pick',
          })}
          style={{ width: `${item.picked_percent * 100}%` }}
        >
          <p
            ref={textValueRef}
            className={classNames(styles.pickedValue, {
              [styles.pickedValueTextDisabled]:
                isPickedValueTextDisabled || item.id === 'no_pick',
            })}
          >
            <span className={styles.pickedText}>Picked</span>
            <span className={styles.pickedCount}>
              {isQuantity
                ? item.picked_count
                : `${(item.picked_percent * 100).toFixed(1)}%`}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
