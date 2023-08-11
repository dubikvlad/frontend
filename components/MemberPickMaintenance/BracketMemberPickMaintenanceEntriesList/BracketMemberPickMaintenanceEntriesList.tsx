import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import type { BracketPlayoffEntryItem } from '@/api'
import { VerticalDots } from '@/assets/icons'
import { routes, generateParticipantImagePath } from '@/config/constants'
import { EntrySettings } from '@/features/components'
import { CreateNewEntryButton } from '@/features/components/MemberPickMaintenance'

import styles from './BracketMemberPickMaintenanceEntriesList.module.scss'

type BracketMemberPickMaintenanceEntriesListProps = {
  poolEntriesData: BracketPlayoffEntryItem[]
  renameEntry: (entryId: number, newName: string) => void
  deleteEntry: (entryId: number) => void
  createNewEntry: () => void

  selectedMemberId: number | null
  createEntryIsLoading: boolean
  search: string
}

export function BracketMemberPickMaintenanceEntriesList({
  poolEntriesData,
  renameEntry,
  deleteEntry,
  createNewEntry,
  selectedMemberId,
  createEntryIsLoading = false,
  search,
}: BracketMemberPickMaintenanceEntriesListProps) {
  return (
    <div className={styles.entriesWrapper}>
      <div className={styles.entriesHead}>
        <p>Entry Name</p>
        <p>Picks</p>
        <p>Record W/L</p>
      </div>

      <div className={styles.entriesList}>
        {poolEntriesData.length ? (
          poolEntriesData.map((item) => (
            <EntryItem
              key={item.id}
              item={item}
              renameEntry={renameEntry}
              deleteEntry={deleteEntry}
              selectedMemberId={selectedMemberId}
            />
          ))
        ) : (
          <div className={styles.emptyBlock}>
            No matching entries were found for your request
          </div>
        )}
      </div>

      {!search.trim() && (
        <CreateNewEntryButton
          createEntryIsDisabled={createEntryIsLoading}
          createNewEntry={createNewEntry}
        />
      )}
    </div>
  )
}

type EntryItemProps = {
  item: BracketPlayoffEntryItem
  deleteEntry: (entryId: number) => void
  renameEntry: (entryId: number, newName: string) => void
  selectedMemberId: number | null
}

function EntryItem({
  item,
  deleteEntry,
  renameEntry,
  selectedMemberId,
}: EntryItemProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [showConfirmDeletion, setShowConfirmDeletion] = useState(false)

  const [isFocus, setIsFocus] = useState<boolean>(false)
  const [value, setValue] = useState<string>(item.name)

  useEffect(() => {
    if (isFocus && inputRef.current) inputRef.current.focus()
  }, [isFocus])

  const rename = () => {
    setIsFocus(false)

    if (item.name.trim() !== value.trim()) {
      renameEntry(item.id, value)
    }
  }

  const editEntryLink = routes.account.makePick.index(item.pool_id, {
    entry_id: item.id,
    isMaintenance: 1,
    user_id: selectedMemberId ? Number(selectedMemberId) : undefined,
  })

  const bracketForecasts = item.bracket_forecasts

  return (
    <div key={item.id} className={styles.entryItem}>
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
          <p className={styles.entryRenameInput}>{value}</p>
        )}

        <p
          className={classNames(styles.entryRenameText, {
            [styles.entryRenameTextHide]: isFocus,
          })}
          onClick={() => setIsFocus(true)}
        >
          Rename Entry
        </p>
      </div>

      <div
        className={classNames(styles.forecastsWrapper, {
          [styles.forecastsWrapperNotForecasts]: !bracketForecasts.length,
        })}
      >
        {bracketForecasts.length ? (
          <>
            {bracketForecasts.map((forecast, f) => {
              const src = generateParticipantImagePath(
                forecast.participant.external_id,
              )
              return (
                <div
                  key={f}
                  className={classNames(styles.forecastItem, {
                    [styles.forecastItemWin]: forecast.status === 'win',
                    [styles.forecastItemLost]: forecast.status === 'lost',
                  })}
                >
                  {src && (
                    <Image
                      src={src}
                      width={30}
                      height={30}
                      alt={forecast.participant.name}
                    />
                  )}
                </div>
              )
            })}

            <Link href={editEntryLink} className={styles.pickemForecastsLink} />
          </>
        ) : (
          <Link href={editEntryLink} className={styles.makePickLink}>
            <button
              className={classNames(
                'button button-blue-light',
                styles.makePickButton,
              )}
            >
              Make a Pick
            </button>
          </Link>
        )}
      </div>

      <div className={styles.entrySettingsWrapper}>
        <OutsideClickHandler
          onOutsideClick={() => setDropdownIsOpen(false)}
          display="contents"
        >
          <div
            onClick={() => setDropdownIsOpen((prev) => !prev)}
            className={styles.dotsWrapper}
          >
            <VerticalDots
              className={classNames(styles.dots, {
                [styles.dotsActive]: dropdownIsOpen,
              })}
            />
          </div>

          <EntrySettings
            dropdownIsOpen={dropdownIsOpen}
            setDropdownIsOpen={setDropdownIsOpen}
            showConfirmDeletion={showConfirmDeletion}
            setShowConfirmDeletion={setShowConfirmDeletion}
            editEntryLink={editEntryLink}
            renameAction={() => setIsFocus(true)}
            deleteAction={() => deleteEntry(item.id)}
          />
        </OutsideClickHandler>
      </div>
    </div>
  )
}
