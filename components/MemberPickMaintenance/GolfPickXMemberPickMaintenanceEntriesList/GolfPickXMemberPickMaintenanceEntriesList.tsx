import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { GolfPickXEntriesItem } from '@/api'
import { UnknownPlayer, VerticalDots } from '@/assets/icons'
import { routes } from '@/config/constants'
import { EntrySettings } from '@/features/components'
import { CreateNewEntryButton } from '@/features/components/MemberPickMaintenance'

import styles from './GolfPickXMemberPickMaintenanceEntriesList.module.scss'

type GolfPickXMemberPickMaintenanceEntriesListProps = {
  poolEntriesData: GolfPickXEntriesItem[]
  renameEntry: (entryId: number, newName: string) => void
  deleteEntry: (entryId: number) => void
  createNewEntry: () => void
  selectedMemberId: number | null
  createEntryIsLoading: boolean
  search: string
  tournamentId: string
  poolEntriesIsLoading: boolean
}

export function GolfPickXMemberPickMaintenanceEntriesList({
  poolEntriesData,
  renameEntry,
  deleteEntry,
  createNewEntry,
  selectedMemberId,
  createEntryIsLoading = false,
  search,
  tournamentId,
  poolEntriesIsLoading,
}: GolfPickXMemberPickMaintenanceEntriesListProps) {
  const searchData = search
    ? poolEntriesData.filter((entry) => entry.name.includes(search))
    : poolEntriesData

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableHeader}>
        <p>Entry Name</p>
        <p>Roster</p>
      </div>

      <div className={styles.entriesWrapper}>
        {searchData.map((entry) => (
          <EntryItem
            key={entry.id}
            entry={entry}
            renameEntry={renameEntry}
            selectedMemberId={selectedMemberId}
            deleteEntry={deleteEntry}
            tournamentId={tournamentId}
          />
        ))}
      </div>

      <CreateNewEntryButton
        createEntryIsDisabled={createEntryIsLoading || poolEntriesIsLoading}
        createNewEntry={createNewEntry}
      />
    </div>
  )
}

type EntryItemProps = {
  entry: GolfPickXEntriesItem
  renameEntry: GolfPickXMemberPickMaintenanceEntriesListProps['renameEntry']
  selectedMemberId: GolfPickXMemberPickMaintenanceEntriesListProps['selectedMemberId']
  deleteEntry: GolfPickXMemberPickMaintenanceEntriesListProps['deleteEntry']
  tournamentId: GolfPickXMemberPickMaintenanceEntriesListProps['tournamentId']
}

function EntryItem({
  entry,
  renameEntry,
  selectedMemberId,
  deleteEntry,
  tournamentId,
}: EntryItemProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [showConfirmDeletion, setShowConfirmDeletion] = useState(false)

  const [isFocus, setIsFocus] = useState<boolean>(false)
  const [value, setValue] = useState<string>(entry.name)

  useEffect(() => {
    if (isFocus && inputRef.current) inputRef.current.focus()
  }, [isFocus])

  const rename = () => {
    setIsFocus(false)

    if (entry.name.trim() !== value.trim()) {
      renameEntry(entry.id, value)
    }
  }

  const editEntryLink = routes.account.makePick.index(entry.pool_id, {
    isMaintenance: 1,
    entry_id: entry.id,
    user_id: selectedMemberId ? Number(selectedMemberId) : undefined,
    tournament_id:
      tournamentId && !isNaN(+tournamentId) ? +tournamentId : undefined,
  })

  return (
    <div key={entry.id} className={styles.entryItem}>
      <div className={styles.entryNameWrapper}>
        <div>
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
            <p className={styles.entryRenameInput}>{entry.name}</p>
          )}
        </div>

        <p
          className={classNames(styles.renameEntryText, {
            [styles.renameEntryTextHide]: isFocus,
          })}
          onClick={() => !isFocus && setIsFocus(true)}
        >
          Rename Entry
        </p>
      </div>

      <div
        className={classNames(styles.forecastWrapper, {
          [styles.forecastWrapperNotForecasts]:
            !entry.golf_pick_x_forecasts.length,
        })}
      >
        {entry.golf_pick_x_forecasts.length ? (
          <>
            {entry.golf_pick_x_forecasts.map((forecast) => (
              <div key={forecast.id} className={styles.forecastItem}>
                <div className={styles.playerImage}>
                  {forecast.player.image ? (
                    <Image
                      src={forecast.player.image}
                      width={45}
                      height={60}
                      alt={forecast.player.name}
                    />
                  ) : (
                    <UnknownPlayer />
                  )}
                </div>

                <p className={styles.playerName}>{forecast.player.last_name}</p>

                <p className={styles.worldRankText}>
                  {forecast.player.worldRank}
                </p>
              </div>
            ))}

            <Link href={editEntryLink} className={styles.editEntryLink} />
          </>
        ) : (
          <Link href={editEntryLink} className={styles.makePickLink}>
            <button className="button button-blue-light">Make a Pick</button>
          </Link>
        )}
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
            editEntryLink={editEntryLink}
            renameAction={() => setIsFocus(true)}
            deleteAction={() => deleteEntry(entry.id)}
          />
        </OutsideClickHandler>
      </div>
    </div>
  )
}
