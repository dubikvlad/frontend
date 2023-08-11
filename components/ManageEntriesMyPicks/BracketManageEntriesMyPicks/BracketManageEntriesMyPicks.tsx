import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'
import { KeyedMutator } from 'swr'

import {
  BracketForecasts,
  BracketPlayoffEntryItem,
  EntriesPoolEntriesData,
  Pool,
  ResponseData,
  UserResponseData,
} from '@/api'
import { Pencil, VerticalDots } from '@/assets/icons'
import {
  deleteEntry,
  generateParticipantImagePath,
  renameEntry,
  routes,
} from '@/config/constants'
import { CreateEntryBlock, EntrySettings } from '@/features/components'
import { useGetPoolEntries } from '@/helpers'

import styles from './BracketManageEntriesMyPicks.module.scss'

type BracketManageEntriesMyPicksProps = {
  poolData: Pool<'bracket'>
  userData: UserResponseData
}

export function BracketManageEntriesMyPicks({
  poolData,
  userData,
}: BracketManageEntriesMyPicksProps) {
  const {
    poolEntriesData,
    poolEntriesIsLoading,
    poolEntriesMutate: currentUserPoolEntriesMutate,
  } = useGetPoolEntries<'bracket'>({
    poolId: poolData.id,
    userId: userData.id,
  })

  const { poolEntriesMutate } = useGetPoolEntries<'bracket'>({
    poolId: poolData.id,
  })

  const [isCreateEntryShow, setIsCreateEntryShow] = useState(false)

  return (
    <div className={styles.wrapper}>
      {!poolEntriesIsLoading && (
        <div className={styles.entriesInfoWrapper}>
          <p>
            {poolEntriesData.length
              ? `My ${poolEntriesData.length} Entries`
              : "You don't seem to have any entries."}
          </p>

          <button
            className={classNames('button', 'button-blue-outline', {
              disabled: poolEntriesIsLoading,
              [styles.createEntryButtonHide]: isCreateEntryShow,
            })}
            onClick={() => setIsCreateEntryShow(true)}
          >
            Create a New Entry
          </button>
        </div>
      )}

      <CreateEntryBlock
        isOpen={isCreateEntryShow}
        setIsOpen={setIsCreateEntryShow}
      />

      {!!poolEntriesData.length && (
        <div className={styles.entriesWrapper}>
          {poolEntriesData.map((entry) => (
            <EntryItem
              key={entry.id}
              entry={entry}
              currentUserPoolEntriesMutate={currentUserPoolEntriesMutate}
              poolEntriesMutate={poolEntriesMutate}
              poolId={poolData.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type EntryItemProps = {
  entry: BracketPlayoffEntryItem
  currentUserPoolEntriesMutate: KeyedMutator<ResponseData<
    EntriesPoolEntriesData<'bracket'>
  > | null>
  poolEntriesMutate: KeyedMutator<ResponseData<
    EntriesPoolEntriesData<'bracket'>
  > | null>
  poolId: number
}

function EntryItem({
  entry,
  currentUserPoolEntriesMutate,
  poolEntriesMutate,
  poolId,
}: EntryItemProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState<string>(entry.name)
  const [isFocus, setIsFocus] = useState<boolean>(false)

  useEffect(() => {
    if (isFocus && inputRef.current) inputRef.current.focus()
  }, [isFocus])

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [showConfirmDeletion, setShowConfirmDeletion] = useState(false)

  const makeYourPicksLink = routes.account.makePick.index(entry.pool_id, {
    entry_id: entry.id,
  })

  const rename = async () => {
    setIsFocus(false)

    if (entry.name.trim() !== value.trim()) {
      const res = await renameEntry({
        poolId,
        entryId: entry.id,
        newName: value.trim(),
        mutateArray: [currentUserPoolEntriesMutate, poolEntriesMutate],
      })

      setValue(res ?? entry.name)
    }
  }

  function getStagesObj(): [string, BracketForecasts[]][] {
    const obj = entry.bracket_forecasts.reduce<{
      [key: string]: BracketForecasts[]
    }>((acc, item) => {
      if (!(item.stage in acc)) acc[item.stage] = []
      acc[item.stage].push(item)
      return acc
    }, {})

    const sortedObj = Object.entries(obj).sort((a, b) => {
      if (a[0] === 'PLAY_OFF_STAGE_FINAL') return 0
      if (a[0] > b[0]) return -1
      if (a[0] < b[0]) return 1
      return 0
    })

    return sortedObj.map(([key, item]) => {
      if (key === 'PLAY_OFF_STAGE_1_8') return ['Conf. Quarters', item]
      if (key === 'PLAY_OFF_STAGE_1_4') return ['Conf. Semifinals', item]
      if (key === 'PLAY_OFF_STAGE_1_2') return ['Conf. Finals', item]
      if (key === 'PLAY_OFF_STAGE_FINAL') return ['Final', item]
      return [key, item]
    })
  }

  const stagesObj = getStagesObj()

  return (
    <div className={styles.entryItem} key={entry.id}>
      <div className={styles.entryHead}>
        <div className={styles.entryName} onClick={() => setIsFocus(true)}>
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
            <p>{value}</p>
          )}

          <Pencil className={classNames({ [styles.pencilVisible]: isFocus })} />
        </div>

        <div className={styles.dots}>
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
              deleteAction={() =>
                deleteEntry({
                  poolId,
                  entryId: entry.id,
                  mutateArray: [
                    currentUserPoolEntriesMutate,
                    poolEntriesMutate,
                  ],
                })
              }
            />
          </OutsideClickHandler>
        </div>
      </div>

      <div
        className={classNames(styles.entryBody, {
          [styles.entryBodyNoPick]: !stagesObj.length,
        })}
      >
        {stagesObj.length ? (
          <>
            {stagesObj.map(([key, item]) => {
              return (
                <div key={key} className={styles.forecastsWrapper}>
                  <p>{key}</p>

                  <div className={styles.forecastsContainer}>
                    {item.map((forecast) => {
                      const imgSrc = generateParticipantImagePath(
                        forecast.participant.external_id,
                      )

                      return (
                        <div key={forecast.id}>
                          {!!imgSrc && (
                            <Image
                              src={imgSrc}
                              width={40}
                              height={40}
                              alt={forecast.participant.name}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div
                    className={classNames(styles.sides, {
                      [styles.sidesFinal]: key === 'Final',
                    })}
                  >
                    {key === 'Final' ? (
                      <div className={styles.champ}>
                        <p>Champ</p>
                      </div>
                    ) : (
                      <>
                        <div className={styles.western}>
                          <p>Western</p>
                        </div>

                        <div className={styles.eastern}>
                          <p>Eastern</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}

            <div className={styles.tiebreakWrapper}>
              <p>SB Tiebreak</p>
              <p className={styles.tiebreakScore}>
                {entry.playoff_tiebreaker.score}
              </p>
            </div>

            <Link
              href={makeYourPicksLink}
              className={styles.entryBodyLink}
            ></Link>
          </>
        ) : (
          <div className={styles.noPickWrapper}>
            <p>There are no picks for this entry</p>
            <Link href={makeYourPicksLink}>
              <button className="button button-blue-outline">
                Make a Pick
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
