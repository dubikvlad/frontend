import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import {
  EntriesItem,
  LeaderboardStatisticItem,
  Pool,
  UserResponseData,
} from '@/api'
import { Pencil, VerticalDots } from '@/assets/icons'
import {
  createEntry,
  deleteEntry,
  generateParticipantImagePath,
  renameEntry,
  routes,
} from '@/config/constants'
import { EntrySettings } from '@/features/components/EntrySettings'
import { FilterByWeek } from '@/features/components/FilterByWeek'
import { useGetPoolEntries, useLeaderboard, useMessage } from '@/helpers'

import styles from './PickemManageEntriesMyPicks.module.scss'

export function PickemManageEntriesMyPicks({
  poolData,
  userData,
}: {
  poolData: Pool<'pick_em'>
  userData: UserResponseData
}) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  useEffect(() => {
    if (!!poolData && selectedWeek === null)
      setSelectedWeek(poolData.pick_pool.current_week)
  }, [poolData, selectedWeek])

  const { poolEntriesData, poolEntriesMutate, poolEntriesIsLoading } =
    useGetPoolEntries({
      poolId: poolData.id,
      weekNumber: selectedWeek !== null ? selectedWeek : undefined,
      userId: userData?.id,
    })

  const { leaderboardData } = useLeaderboard({
    poolId: poolData.id,
    weekNumber: selectedWeek,
  })

  const leaderboardStatistic = leaderboardData?.statistic

  const [date, setDate] = useState<string>('')

  const [createEntryIsLoading, setCreateEntryIsLoading] =
    useState<boolean>(false)

  const [error, setError] = useMessage()

  if (!poolData) return null

  const isCompleted = selectedWeek
    ? selectedWeek < poolData.pick_pool.current_week
    : true

  const createEntryFunc = () =>
    createEntry({
      poolData,
      userData,
      poolEntriesData,
      setCreateEntryIsLoading,
      mutateArray: [poolEntriesMutate],
      setError,
      createEntryIsLoading,
    })

  return (
    <div className={styles.wrapper}>
      <div className={styles.filterAndTimerWrapper}>
        {selectedWeek && (
          <FilterByWeek
            tournamentId={poolData.tournament_id}
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            currentWeek={poolData.pick_pool.current_week}
            getDate={setDate}
          />
        )}
      </div>

      <div>
        {!!poolEntriesData.length && (
          <div className={styles.myEntriesInfo}>
            <p>
              My {poolEntriesData?.length} Entries WEEK {selectedWeek}{' '}
              <span>({date})</span>
            </p>

            <button
              className={classNames('button', 'button-blue-light-outline', {
                [styles.createEntryDisabled]:
                  createEntryIsLoading || poolEntriesIsLoading,
              })}
              onClick={createEntryFunc}
            >
              Create a New Entry
            </button>
          </div>
        )}

        {!!error && (
          <div className={classNames('alert alert-danger', styles.alertDanger)}>
            {error}
          </div>
        )}

        <div className={styles.entriesList}>
          {poolEntriesData.length
            ? poolEntriesData.map((entry) => (
                <EntriesListItem
                  key={entry.id}
                  item={entry}
                  leaderboardItem={leaderboardStatistic?.[entry.id]}
                  weekNumber={selectedWeek}
                  deleteEntry={() =>
                    deleteEntry({
                      poolId: poolData.id,
                      entryId: entry.id,
                      mutateArray: [poolEntriesMutate],
                    })
                  }
                  isCompleted={isCompleted}
                  renameEntry={(newName) =>
                    renameEntry({
                      poolId: poolData.id,
                      entryId: entry.id,
                      newName,
                      mutateArray: [poolEntriesMutate],
                    })
                  }
                />
              ))
            : !poolEntriesIsLoading && (
                <p className={styles.noEntriesText}>
                  You don&apos;t seem to have any entries. Try to{' '}
                  <span onClick={createEntryFunc}>Create a New Entry</span>
                </p>
              )}
        </div>
      </div>
    </div>
  )
}

type EntriesListItemProps = {
  item: EntriesItem
  leaderboardItem: LeaderboardStatisticItem | undefined
  weekNumber: number | null
  deleteEntry: () => void
  isCompleted: boolean
  renameEntry: (newName: string) => void
}

function EntriesListItem({
  item,
  leaderboardItem,
  weekNumber,
  deleteEntry,
  isCompleted,
  renameEntry,
}: EntriesListItemProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState<string>(item.name)
  const [isFocus, setIsFocus] = useState<boolean>(false)

  useEffect(() => {
    if (isFocus && inputRef.current) inputRef.current.focus()
  }, [isFocus])

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [showConfirmDeletion, setShowConfirmDeletion] = useState(false)

  const makeYourPicksLink = weekNumber
    ? routes.account.makePick.index(item.pool_id, {
        week_number: weekNumber,
        entry_id: item.id,
      })
    : '#'

  const rename = () => {
    setIsFocus(false)

    if (item.name.trim() !== value.trim()) {
      renameEntry(value)
    }
  }

  return (
    <div className={styles.entriesListItem}>
      <div className={styles.entryHead} style={{ backgroundColor: item.color }}>
        <div className={styles.entry} onClick={() => setIsFocus(true)}>
          {isFocus ? (
            <input
              ref={inputRef}
              className={classNames(
                styles.entryRenameInput,
                styles.entryRenameInputVisible,
              )}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={rename}
              onKeyDown={(e) => e.key === 'Enter' && rename()}
            />
          ) : (
            <p className={styles.entryRenameInput}>{value}</p>
          )}

          <Pencil className={classNames({ [styles.pencilVisible]: isFocus })} />
        </div>

        <div className={classNames(styles.dots, styles.entrySettings)}>
          <OutsideClickHandler
            onOutsideClick={() => setDropdownIsOpen(false)}
            display="contents"
          >
            <div
              onClick={() => setDropdownIsOpen((prev) => !prev)}
              className={styles.dotsWrapper}
            >
              <VerticalDots />
            </div>

            <EntrySettings
              dropdownIsOpen={dropdownIsOpen}
              setDropdownIsOpen={setDropdownIsOpen}
              showConfirmDeletion={showConfirmDeletion}
              setShowConfirmDeletion={setShowConfirmDeletion}
              editEntryLink={makeYourPicksLink}
              renameAction={() => setIsFocus(true)}
              deleteAction={deleteEntry}
            />
          </OutsideClickHandler>
        </div>
      </div>

      <div className={styles.entryBody}>
        {item?.pickem_forecasts?.length ? (
          <div className={styles.resultsWrapper}>
            <p className={styles.resultsText}>Results</p>

            <Link href={makeYourPicksLink}>
              <div className={styles.resultsList}>
                {item.pickem_forecasts.map((forecast, i) => {
                  const src = generateParticipantImagePath(
                    forecast.participant.external_id,
                  )
                  return (
                    <div
                      key={i}
                      className={classNames(styles.resultsListItem, {
                        [styles.win]: forecast.status === 'win',
                        [styles.lost]: forecast.status === 'lost',
                      })}
                    >
                      <Image
                        src={src}
                        width={30}
                        height={30}
                        alt={[
                          forecast?.participant?.city,
                          forecast?.participant?.name,
                        ]
                          ?.join(' ')
                          .trim()}
                      />
                    </div>
                  )
                })}
              </div>
            </Link>
          </div>
        ) : !isCompleted ? (
          <Link href={makeYourPicksLink} className={styles.makeYourPickButton}>
            <button
              className={classNames('button', 'button-blue-light-outline')}
            >
              Make Your Picks
            </button>
          </Link>
        ) : (
          <p className={styles.noPicks}>
            There are no picks for <span>{item.name}</span>
          </p>
        )}

        <div
          className={classNames(styles.weekResult, {
            [styles.weekResultHide]:
              !item?.pickem_forecasts?.length && isCompleted,
          })}
        >
          <p className={styles.weekResultHead}>W/L</p>
          <p className={styles.weekResultHead}>TBR</p>
          <p className={styles.weekResultHead}>PTS</p>

          {leaderboardItem ? (
            <>
              <p>
                {leaderboardItem.forecasts.win.count}/
                {leaderboardItem.forecasts.lost.count}
              </p>
              <p>{leaderboardItem.tiebreaker ?? '-'}</p>
              <p>{leaderboardItem.point}</p>
            </>
          ) : (
            <>
              <p>-/-</p>
              <p>-</p>
              <p>-</p>
            </>
          )}
        </div>

        <div
          className={styles.entryBodyLine}
          style={{ backgroundColor: item.color }}
        ></div>
      </div>
    </div>
  )
}
