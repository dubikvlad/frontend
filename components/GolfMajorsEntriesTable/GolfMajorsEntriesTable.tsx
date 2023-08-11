import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'
import { KeyedMutator } from 'swr'

import {
  EntriesPoolEntriesData,
  GolfMajorsEntriesItem,
  GolfMajorsForecastsItem,
  Pool,
  ResponseData,
  UserResponseData,
} from '@/api'
import { UnknownPlayer, VerticalDots } from '@/assets/icons'
import {
  renameEntry,
  routes,
  getShortName,
  deleteEntry,
} from '@/config/constants'
import { EntrySettings } from '@/features/components'

import styles from './GolfMajorsEntriesTable.module.scss'

type GolfMajorsEntriesTableProps = {
  poolEntriesData: GolfMajorsEntriesItem[]
  poolData: Pool<'golf_majors'>
  poolEntriesMutate: KeyedMutator<ResponseData<
    EntriesPoolEntriesData<'golf_majors'>
  > | null>
  userData: UserResponseData | undefined
}

export function GolfMajorsEntriesTable({
  poolEntriesData,
  poolData,
  poolEntriesMutate,
  userData,
}: GolfMajorsEntriesTableProps) {
  if (!userData || !poolEntriesData.length) return null

  return (
    <div className={styles.table}>
      <div className={styles.tableHead}>
        <p></p>
        <p>Entry Name</p>

        <div className={styles.tierTextWrapper}>
          <p className={styles.tierText}>Tier 1</p>
          <p className={styles.tierText}>Tier 2</p>
          <p className={styles.tierText}>Tier 3</p>
          <p className={styles.tierText}>Tier 4</p>
          <p className={styles.tierText}>Tier 5</p>
          <p className={styles.tierText}>Tier 6</p>
        </div>

        <p></p>
      </div>

      <div className={styles.tableBody}>
        {poolEntriesData.map((entry) => (
          <EntryItem
            key={entry.id}
            entry={entry}
            poolId={poolData.id}
            poolEntriesMutate={poolEntriesMutate}
            userData={userData}
          />
        ))}
      </div>
    </div>
  )
}

type EntryItemProps = {
  entry: GolfMajorsEntriesItem
  poolId: number
  poolEntriesMutate: KeyedMutator<ResponseData<
    EntriesPoolEntriesData<'golf_majors'>
  > | null>
  userData: UserResponseData
}

function EntryItem({
  entry,
  poolId,
  poolEntriesMutate,
  userData,
}: EntryItemProps) {
  const isUserEntry = userData.id === entry.user_id

  const inputRef = useRef<HTMLInputElement>(null)

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [showConfirmDeletion, setShowConfirmDeletion] = useState(false)

  const [isFocus, setIsFocus] = useState<boolean>(false)
  const [value, setValue] = useState<string>(entry.name)

  useEffect(() => {
    if (isFocus && inputRef.current && isUserEntry) inputRef.current.focus()
  }, [isFocus, isUserEntry])

  const rename = () => {
    setIsFocus(false)

    if (entry.name.trim() !== value.trim()) {
      renameEntry({
        poolId,
        entryId: entry.id,
        newName: value,
        mutateArray: [poolEntriesMutate],
      })
    }
  }

  const makeYourPicksLink = routes.account.makePick.index(entry.pool_id, {
    entry_id: entry.id,
  })

  return (
    <div className={styles.entryItem}>
      <div
        className={styles.entryBlock}
        style={{ backgroundColor: entry.color }}
      >
        {getShortName(entry.name)}
      </div>

      <div className={styles.entryNameWrapper}>
        {isFocus && isUserEntry ? (
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

        {isUserEntry && (
          <p
            className={classNames(styles.renameEntryText, {
              [styles.renameEntryTextHide]: isFocus,
            })}
            onClick={() => setIsFocus(true)}
          >
            Rename entry
          </p>
        )}
      </div>

      {isUserEntry ? (
        <Link href={makeYourPicksLink} className={styles.forecastWrapper}>
          <ForecastItems forecastsData={entry.golf_majors_forecasts} />
        </Link>
      ) : (
        <div className={styles.forecastWrapper}>
          <ForecastItems forecastsData={entry.golf_majors_forecasts} />
        </div>
      )}

      <div className={styles.tiebreakWrapper}>
        <p className={styles.tiebreakTitle}>TBR</p>
        <p className={styles.tiebreakValue}>{entry.tiebreaker.score ?? '-'}</p>
      </div>

      {isUserEntry && (
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
                  mutateArray: [poolEntriesMutate],
                })
              }
            />
          </OutsideClickHandler>
        </div>
      )}
    </div>
  )
}

type ForecastItemsProps = {
  forecastsData: GolfMajorsForecastsItem[]
}

function ForecastItems({ forecastsData }: ForecastItemsProps) {
  return (
    <>
      {forecastsData.length
        ? forecastsData.map((forecast) => (
            <div key={forecast.id} className={styles.forecastItem}>
              <div>
                {forecast.player.image ? (
                  <Image
                    src={forecast.player.image}
                    width={60}
                    height={80}
                    alt={forecast.player.name}
                  />
                ) : (
                  <UnknownPlayer className={styles.unknownPlayerImage} />
                )}
              </div>

              <p className={styles.playerName}>{forecast.player.name}</p>

              <p className={styles.worldRank}>{forecast.player.worldRank}</p>
            </div>
          ))
        : Array(6)
            .fill(0)
            .map((_, i) => (
              <UnknownPlayer key={i} className={styles.unknownPlayerImage} />
            ))}
    </>
  )
}
