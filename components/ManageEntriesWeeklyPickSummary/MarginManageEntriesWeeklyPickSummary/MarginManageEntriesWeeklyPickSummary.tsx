import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { MarginWeeklyMembersPicksParticipant } from '@/api'
import { generateParticipantImagePath } from '@/config/constants'
import { HorizontalFilterByWeek } from '@/features/components/HorizontalFilterByWeek'
import { Select } from '@/features/ui'
import { usePool, useWeeklyMembersPicksReport } from '@/helpers'

import styles from './MarginManageEntriesWeeklyPickSummary.module.scss'

export function MarginManageEntriesWeeklyPickSummary() {
  const {
    query: { poolId },
  } = useRouter()

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  const { poolData } = usePool(Number(poolId))

  const currentWeek = poolData?.pick_pool.current_week
  const availableWeeks = poolData?.available_week ?? []

  const { weeklyMembersPicksReportData } =
    useWeeklyMembersPicksReport<'margin'>({
      poolId: Number(poolId),
      weekNumber: selectedWeek,
    })

  const sortByOptions = [
    { title: 'Pick popularity', name: 'pick-popularity' },
    {
      title: 'Descending picks popularity',
      name: 'descending-picks-popularity',
    },
    { title: 'Team name', name: 'team-name' },
  ]

  const [sortByValue, setSortByValue] = useState(sortByOptions[0].name)

  const select2Options = [
    { title: 'Any outcome', name: 'any-outcome' },
    { title: 'Only correctly picked', name: 'only-correctly-picked' },
    { title: 'Only wrongly picked', name: 'only-wrongly-picked' },
  ]

  const [select2Value, setSelect2Value] = useState(select2Options[0].name)

  function filterByOutcome(data: MarginWeeklyMembersPicksParticipant[]) {
    if (select2Value === 'only-wrongly-picked') {
      return data.filter(
        (item) => item.status === 'lost' || item.id === 'no_pick',
      )
    }
    if (select2Value === 'only-correctly-picked') {
      return data.filter((item) => item.status === 'win')
    }
    return data
  }

  const weeklyMembersPicksReportDataParticipants =
    weeklyMembersPicksReportData?.participants ?? []

  const dataFilteredByOutcome = filterByOutcome([
    ...weeklyMembersPicksReportDataParticipants,
  ])

  const select3Options = [
    { title: 'Quantity', name: 'quantity' },
    { title: 'Percentage', name: 'percentage' },
  ]

  const [select3Value, setSelect3Value] = useState(select3Options[0].name)

  function sortData(
    a: MarginWeeklyMembersPicksParticipant,
    b: MarginWeeklyMembersPicksParticipant,
  ) {
    if (sortByValue === 'pick-popularity') {
      return b.picked_count - a.picked_count
    }

    if (sortByValue === 'descending-picks-popularity') {
      return a.picked_count - b.picked_count
    }

    if (sortByValue === 'team-name') {
      return a.name > b.name ? 1 : -1
    }

    return 0
  }

  const sortedData = dataFilteredByOutcome.sort(sortData)

  const { count_entries = 0, count_missing_entries = 0 } =
    weeklyMembersPicksReportData ?? {}

  const isNoPicks = !!weeklyMembersPicksReportDataParticipants.find(
    (item) => item.id === 'no_pick',
  )

  type ChartItem = {
    type: 'Correctly picked' | 'Wrongly picked' | 'Missed'
    value: number
    color: string
  }

  const correctlyPicked = !isNoPicks
    ? weeklyMembersPicksReportDataParticipants.reduce(
        (acc, participant) =>
          (acc += participant.status === 'win' ? participant.picked_count : 0),
        0,
      )
    : 0

  const wronglyPicked = !isNoPicks
    ? weeklyMembersPicksReportDataParticipants.reduce(
        (acc, participant) =>
          (acc += participant.status === 'lost' ? participant.picked_count : 0),
        0,
      )
    : 0

  const chartData: ChartItem[] = [
    { type: 'Correctly picked', value: correctlyPicked, color: '#57AB6F' },
    { type: 'Wrongly picked', value: wronglyPicked, color: '#D67474' },
    { type: 'Missed', value: count_missing_entries, color: '#909090' },
  ]

  const [chartHoverType, setChartHoverType] = useState<
    ChartItem['type'] | 'none'
  >('none')

  const manyDots = Array(60).fill('.').join('')

  const infoData = [
    { title: 'Correctly picked', count: correctlyPicked },
    { title: 'Wrongly picked', count: wronglyPicked },
    { title: 'Missed', count: count_missing_entries },
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
    weeklyMembersPicksReportData?.participants &&
    !weeklyMembersPicksReportData.participants.length

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

      {isReportNotReady ? (
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
                : !!weeklyMembersPicksReportData?.participants &&
                  sortedData.length !==
                    weeklyMembersPicksReportData.participants.length && (
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
                    [styles.winCount]: chartHoverType === 'Correctly picked',
                    [styles.lostCount]: chartHoverType === 'Wrongly picked',
                    [styles.missedCount]: chartHoverType === 'Missed',
                  })}
                >
                  {chartHoverType === 'Correctly picked' && correctlyPicked}
                  {chartHoverType === 'Wrongly picked' && wronglyPicked}
                  {chartHoverType === 'Missed' && count_missing_entries}
                  {chartHoverType === 'none' && count_entries}
                </p>
                <p className={styles.entriesText}>
                  {chartHoverType === 'Correctly picked' && 'correctly'}
                  {chartHoverType === 'Wrongly picked' && 'wrongly'}
                  {chartHoverType === 'Missed' && 'missed'}
                  {chartHoverType === 'none' && 'entries'}
                </p>
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
  item: MarginWeeklyMembersPicksParticipant
  isQuantity: boolean
}

function TeamItem({ item, isQuantity = true }: TeamItemProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const textValueRef = useRef<HTMLParagraphElement>(null)

  const src =
    item.external_id && item.external_id !== 'no_pick'
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
        <div className={styles.teamName}>
          {item.id === 'no_pick' ? 'NO PICK' : item.name}
        </div>
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
