import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { PlayoffEntriesItem, Pool, UserResponseData, api } from '@/api'
import { Pencil, VerticalDots } from '@/assets/icons'
import {
  createEntry,
  generateParticipantImagePath,
  handlingDeadline,
  routes,
} from '@/config/constants'
import { EntrySettings } from '@/features/components'
import { useGetPoolEntries } from '@/helpers'

import styles from './PowerRankingPlayoffManageEntriesMyPicks.module.scss'

export function PowerRankingPlayoffManageEntriesMyPicks({
  poolData,
  userData,
}: {
  poolData: Pool<'playoff'>
  userData: UserResponseData
}) {
  const { poolEntriesData, poolEntriesMutate, poolEntriesIsLoading } =
    useGetPoolEntries<'playoff'>({
      poolId: poolData.id,
      userId: userData.id,
    })

  const [createEntryIsLoading, setCreateEntryIsLoading] = useState(false)

  const createEntryFunction = () =>
    createEntry({
      poolData,
      userData,
      poolEntriesData,
      setCreateEntryIsLoading,
      mutateArray: [poolEntriesMutate],
    })

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

  const isCompleted =
    handlingDeadline(poolData.pick_pool.pick_deadline) === 'PASSED'

  return (
    <div className={styles.wrapper}>
      {poolEntriesData.length ? (
        <div className={styles.entriesInfoWrapper}>
          <p>My {poolEntriesData.length} Entries</p>
          <button
            className={classNames('button button-blue-light-outline', {
              disabled: createEntryIsLoading,
            })}
            onClick={createEntryFunction}
          >
            Create a New Entry
          </button>
        </div>
      ) : (
        !poolEntriesIsLoading && (
          <p className={styles.noEntriesText}>
            You don&apos;t seem to have any entries. Try to{' '}
            <span
              onClick={() => !createEntryIsLoading && createEntryFunction()}
            >
              Create a New Entry
            </span>
          </p>
        )
      )}

      {poolEntriesData.map((entry) => (
        <EntriesListItem
          key={entry.id}
          item={entry}
          deleteEntry={deleteEntry}
          renameEntry={renameEntry}
          isCompleted={isCompleted}
        />
      ))}
    </div>
  )
}

type EntriesListItemProps = {
  item: PlayoffEntriesItem
  deleteEntry: (entryId: number) => void
  renameEntry: (entryId: number, newName: string) => void
  isCompleted: boolean
}

function EntriesListItem({
  item,
  deleteEntry,
  renameEntry,
  isCompleted,
}: EntriesListItemProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState<string>(item.name)
  const [isFocus, setIsFocus] = useState<boolean>(false)

  useEffect(() => {
    if (isFocus && inputRef.current) inputRef.current.focus()
  }, [isFocus])

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [showConfirmDeletion, setShowConfirmDeletion] = useState(false)

  const makeYourPicksLink = routes.account.makePick.index(item.pool_id, {
    entry_id: item.id,
  })

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

      <div
        className={classNames(styles.entryBody, {
          [styles.entryBodyNoPicks]: !item.playoff_forecasts.length,
        })}
      >
        {item.playoff_forecasts.length ? (
          <div
            className={classNames(styles.resultsListWrapper, {
              [styles.resultsListWrapperWithTiebreak]:
                !!item.playoff_tiebreaker,
            })}
          >
            <Link href={makeYourPicksLink}>
              <div className={styles.resultsList}>
                {item.playoff_forecasts.map((forecast, i) => {
                  const src = generateParticipantImagePath(
                    forecast.participant.external_id,
                  )

                  return (
                    <div key={i} className={styles.resultsListItem}>
                      <p>{forecast.assign_points}</p>

                      <div className={styles.imageWrapper}>
                        <Image
                          src={src}
                          width={45}
                          height={45}
                          alt={forecast.participant.name}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Link>

            {!!item.playoff_tiebreaker && (
              <div className={styles.tiebreakWrapper}>
                <p className={styles.tiebreakTitle}>SB Tiebreak</p>
                <p className={styles.tiebreakScore}>
                  {item.playoff_tiebreaker.score}
                </p>
              </div>
            )}
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
          className={styles.bottomLine}
          style={{ backgroundColor: item.color }}
        ></div>
      </div>
    </div>
  )
}
