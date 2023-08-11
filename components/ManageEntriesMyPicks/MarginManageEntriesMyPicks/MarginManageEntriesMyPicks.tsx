import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import {
  api,
  MarginEntriesItem,
  MarginLeaderboardResponseDataItem,
  Pool,
  UserResponseData,
} from '@/api'
import { Pencil, VerticalDots } from '@/assets/icons'
import {
  createEntry,
  generateParticipantImagePath,
  routes,
} from '@/config/constants'
import { EntrySettings } from '@/features/components/EntrySettings'
import { FilterByWeek } from '@/features/components/FilterByWeek'
import { useGetPoolEntries, useLeaderboard } from '@/helpers'

import styles from './MarginManageEntriesMyPicks.module.scss'

export function MarginManageEntriesMyPicks({
  poolData,
  userData,
}: {
  poolData: Pool<'margin'>
  userData: UserResponseData
}) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  useEffect(() => {
    if (!!poolData && selectedWeek === null)
      setSelectedWeek(poolData.pick_pool.current_week)
  }, [poolData, selectedWeek])

  const { poolEntriesData, poolEntriesMutate, poolEntriesIsLoading } =
    useGetPoolEntries<'margin'>({
      poolId: poolData.id,
      weekNumber: selectedWeek !== null ? selectedWeek : undefined,
      userId: userData?.id,
    })

  const { leaderboardData } = useLeaderboard<'margin'>({
    poolId: poolData.id,
    weekNumber: selectedWeek,
  })

  const [date, setDate] = useState<string>('')

  const [createEntryIsLoading, setCreateEntryIsLoading] =
    useState<boolean>(false)

  if (!poolData) return null

  const isCompleted = selectedWeek
    ? selectedWeek < poolData.pick_pool.current_week
    : true

  async function deleteEntry(entryId: number) {
    await api.entries.delete(poolData.id, entryId)
    poolEntriesMutate()
  }

  async function renameEntry(entryId: number, newName: string) {
    await api.entries.changeFields(poolData.id, entryId, {
      name: newName,
    })
    poolEntriesMutate()
  }

  const createEntryFunc = () =>
    createEntry({
      poolData,
      userData,
      poolEntriesData,
      setCreateEntryIsLoading,
      mutateArray: [poolEntriesMutate],
      createEntryIsLoading,
    })

  return (
    <div className={styles.wrapper}>
      <div className={styles.filterAndTimerWrapper}>
        {selectedWeek !== null ? (
          <FilterByWeek
            tournamentId={poolData.tournament_id}
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            currentWeek={poolData.pick_pool.current_week}
            getDate={setDate}
          />
        ) : (
          <></>
        )}
      </div>

      <div>
        {!!poolEntriesData.length && (
          <div className={styles.myEntriesInfo}>
            <p>
              My {poolEntriesData?.length} Entries WEEK {selectedWeek}{' '}
              {date ? <span>({date})</span> : <></>}
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

        <div className={styles.entriesList}>
          {poolEntriesData.length
            ? poolEntriesData.map((item) => (
                <EntriesListItem
                  key={item.id}
                  item={item}
                  leaderboardItem={
                    leaderboardData?.all && leaderboardData?.all[item.id]
                  }
                  weekNumber={selectedWeek}
                  deleteEntry={deleteEntry}
                  isCompleted={isCompleted}
                  renameEntry={renameEntry}
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
  item: MarginEntriesItem
  leaderboardItem: MarginLeaderboardResponseDataItem | undefined
  weekNumber: number | null
  deleteEntry: (entryId: number) => void
  isCompleted: boolean
  renameEntry: (entryId: number, newName: string) => void
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
      renameEntry(item.id, value)
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
              deleteAction={() => deleteEntry(item.id)}
            />
          </OutsideClickHandler>
        </div>
      </div>

      <div className={styles.entryBody}>
        {item?.margin_forecasts?.length ? (
          <div className={styles.resultsWrapper}>
            <p className={styles.resultsText}>Results</p>

            <Link href={makeYourPicksLink}>
              <div className={styles.resultsList}>
                {item.margin_forecasts.map((forecast, i) => {
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
                      <p className={styles.resultsListPoints}>
                        {!!forecast.points
                          ? `+${forecast.points}`
                          : forecast.points}
                      </p>
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
              !item?.margin_forecasts?.length && isCompleted,
          })}
        >
          <p className={styles.weekResultHead}>W/L</p>
          <p className={styles.weekResultHead}>PTS</p>

          {leaderboardItem ? (
            <>
              <p>
                {leaderboardItem.count_win}/{leaderboardItem.count_lost}
              </p>
              <p>{leaderboardItem.points}</p>
            </>
          ) : (
            <>
              <p>-/-</p>
              <p>-</p>
            </>
          )}
        </div>
        <div
          className={styles.bottomLine}
          style={{ backgroundColor: item.color }}
        ></div>
      </div>
    </div>
  )
}
