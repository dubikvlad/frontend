import classNames from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { CreditsWeeklyMembersPicksEntryItem } from '@/api'
import {
  defaultEntryColor,
  generateParticipantImagePath,
  getShortName,
} from '@/config/constants'
import { CreateEntryBlock } from '@/features/components'
import { usePool, useWeeklyMembersPicksReport } from '@/helpers'

import styles from './CreditsPickByMembers.module.scss'

const FilterByEntryAndMembersAndPastWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndPastWeeks'),
  { loading: () => <p>Loading...</p> },
)

export function CreditsPickByMembers() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'credits'>(Number(poolId))

  const [selectedWeek, setSelectedWeek] = useState<string>('')

  const { weeklyMembersPicksReportData, weeklyMembersPicksReportIsLoading } =
    useWeeklyMembersPicksReport<'credits'>({
      poolId: Number(poolId),
      weekNumber: selectedWeek.trim() ? +selectedWeek : undefined,
    })

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])

  const [isCreateEntryShow, setIsCreateEntryShow] = useState(false)

  if (!poolData) return null

  function filterData() {
    let data = weeklyMembersPicksReportData
      ? [...weeklyMembersPicksReportData]
      : []

    if (!!search.trim()) {
      data = data.filter((entry) =>
        entry.name.trim().toLowerCase().includes(search.trim().toLowerCase()),
      )
    }

    if (members.length) {
      data = data.filter((entry) => members.includes(String(entry.user_id)))
    }

    return data
  }

  const entriesData = filterData()

  return (
    <div>
      <FilterByEntryAndMembersAndPastWeeksLazy
        poolData={poolData}
        search={search}
        setSearch={setSearch}
        members={members}
        setMembers={setMembers}
        week={selectedWeek}
        setWeek={setSelectedWeek}
        isDisabled={
          !weeklyMembersPicksReportData?.length ||
          weeklyMembersPicksReportIsLoading
        }
        isCreateEntryShow={isCreateEntryShow}
        setIsCreateEntryShow={setIsCreateEntryShow}
      />

      <CreateEntryBlock
        isOpen={isCreateEntryShow}
        setIsOpen={setIsCreateEntryShow}
        wrapperClassName={styles.createEntryBlock}
      />

      {!!entriesData.length ? (
        <div className={styles.entriesListWrapper}>
          {entriesData.map((entry) => (
            <EntryItem key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        !weeklyMembersPicksReportIsLoading && (
          <p className={styles.noData}>
            {!weeklyMembersPicksReportData?.length
              ? 'You don’t seem to have any entries'
              : `Sorry, we couldn’t find any relevant entries this week. Please try
            another period`}
          </p>
        )
      )}
    </div>
  )
}

type EntryItemProps = { entry: CreditsWeeklyMembersPicksEntryItem }

function EntryItem({ entry }: EntryItemProps) {
  const eventsArr = Object.values(entry.events)

  return (
    <div className={styles.entryItem}>
      <div
        className={styles.line}
        style={{
          backgroundColor: entry.color ?? defaultEntryColor,
        }}
      ></div>

      <div className={styles.entryNameWrapper}>
        <p className={styles.columnName}>Entry Name</p>
        <div className={styles.entryName}>
          <div
            style={{
              backgroundColor: entry.color ?? defaultEntryColor,
            }}
          >
            {getShortName(entry.name)}
          </div>
          <p>{entry.name}</p>
        </div>
      </div>

      <div className={styles.resultsWrapper}>
        <p className={styles.columnName}>
          Results
          <span
            className={classNames(styles.points, {
              [styles.pointsWin]: entry.points > 0,
              [styles.pointsLost]: entry.points < 0,
            })}
          >
            {entry.points > 0 && '+'}
            {entry.points}
          </span>
        </p>

        <div
          className={classNames(styles.eventsWrapper, {
            [styles.eventsWrapperNoPick]: !eventsArr.length,
          })}
        >
          {eventsArr.length ? (
            eventsArr.map((event) => {
              const imgSrc = generateParticipantImagePath(
                event.participant_external_id,
              )

              const result =
                event.status === 'win'
                  ? `+${event.credits_won}`
                  : event.status === 'lost'
                  ? `-${event.credits_wagered}`
                  : event.status === 'none'
                  ? event.credits_wagered
                  : 0

              return (
                <div
                  key={event.id}
                  className={classNames(styles.event, {
                    [styles.eventWin]: event.status === 'win',
                    [styles.eventLost]: event.status === 'lost',
                  })}
                >
                  {!!imgSrc && (
                    <Image
                      src={imgSrc}
                      width={30}
                      height={30}
                      alt={String(event.id)}
                    />
                  )}
                  <p>{result}</p>
                </div>
              )
            })
          ) : (
            <p>This entry has no picks this week</p>
          )}
        </div>
      </div>

      <div className={styles.winLostWrapper}>
        <p className={styles.columnName}>W/L</p>
        <p
          className={classNames(styles.winLostText, {
            [styles.winLostTextNoPick]: !eventsArr.length,
          })}
        >
          {entry.count_win}/{entry.count_lost}
        </p>
      </div>

      <div className={styles.creditsWrapper}>
        <p className={styles.columnName}>Credits</p>
        <p className={styles.creditsText}>{entry.points_until_current_week}</p>
      </div>
    </div>
  )
}
