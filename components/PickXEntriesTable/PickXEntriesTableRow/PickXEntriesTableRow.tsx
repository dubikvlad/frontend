import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { GolfPickXEntriesItem, Pool } from '@/api'
import { UnknownPlayer, VerticalDots } from '@/assets/icons'
import { routes } from '@/config/constants'
import {
  getShortName,
  moneyFormatter,
  renameEntry,
  deleteEntry,
} from '@/config/constants'
import { useGetPoolEntries, useGetUser } from '@/helpers'

import { EntrySettings } from '../../EntrySettings'

import styles from './PickXEntriesTableRow.module.scss'

export function PickXEntriesTableRow({
  entry,
  poolData,
}: {
  entry: GolfPickXEntriesItem
  poolData: Pool<'golf_pick_x'>
}) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [showConfirmDeletion, setShowConfirmDeletion] = useState(false)
  const [isFocus, setIsFocus] = useState<boolean>(false)
  const [value, setValue] = useState<string>(entry.name)

  const {
    query: { poolId },
  } = useRouter()
  const { userData } = useGetUser()
  const { poolEntriesMutate } = useGetPoolEntries<'golf_pick_x'>({
    poolId: Number(poolId),
    userId: userData?.id,
  })

  const currentUserCanEdit = userData?.id === entry.user_id

  const inputRef = useRef<HTMLInputElement>(null)
  const players_limit = poolData.pick_pool.players_picked_limit

  const makeYourPicksLink = routes.account.makePick.index(entry.pool_id, {
    entry_id: entry.id,
  })

  function renderEmptyPick() {
    return new Array(players_limit).fill(0).map((_, key) => (
      <div key={key} className={styles.card}>
        <UnknownPlayer />
      </div>
    ))
  }

  const rename = () => {
    setIsFocus(false)

    if (entry.name.trim() !== value.trim()) {
      renameEntry({
        poolId: Number(poolId),
        entryId: entry.id,
        newName: value,
        mutateArray: [poolEntriesMutate],
        actionAfterEntryCreation: setValue,
      })
    }
  }

  useEffect(() => {
    if (isFocus && inputRef.current) inputRef.current.focus()
  }, [isFocus])

  useEffect(() => {
    setShowConfirmDeletion(false)
  }, [dropdownIsOpen])

  useEffect(() => {
    setValue(entry.name)
  }, [entry])

  return (
    <div className={styles.row}>
      <div className={styles.entryName}>
        <div
          className="short-name-block"
          style={{ backgroundColor: entry.color }}
        >
          <p>{getShortName(entry.name)}</p>
        </div>
        <div className={styles.entryNameValue}>
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
              onKeyDown={(e) =>
                (e.key === 'Enter' && rename()) ||
                (e.key === 'Escape' &&
                  (() => {
                    setValue(entry.name)
                    setIsFocus(false)
                  })())
              }
            />
          ) : (
            <p>{value}</p>
          )}
        </div>
      </div>
      <Link
        href={currentUserCanEdit ? makeYourPicksLink : '#'}
        className={classNames(styles.cards, {
          [styles.grid]: players_limit >= 6,
          [styles.noLink]: !currentUserCanEdit,
        })}
      >
        {Object.values(entry.golf_pick_x_forecasts).length
          ? Object.values(entry.golf_pick_x_forecasts).map((forecast, i) => {
              return (
                <div key={i} className={styles.card}>
                  {forecast.player.image ? (
                    <Image
                      src={forecast.player.image}
                      alt={forecast.player.name}
                      width={60}
                      height={80}
                    />
                  ) : (
                    <UnknownPlayer />
                  )}
                  <p className={styles.playerName}>
                    {forecast.player.last_name}
                  </p>
                  <p className={styles.worldRank}>
                    {forecast.player.worldRank}
                  </p>
                </div>
              )
            })
          : renderEmptyPick()}
      </Link>

      <div className={styles.dots}>
        <div className={styles.line}></div>
        <div className={styles.infoWrapper}>
          <div className={styles.info}>
            <p>Winnings:</p>
            <p className={styles.infoPoints}>
              {moneyFormatter.format(entry?.winning)}
            </p>
          </div>
          <div className={styles.info}>
            <p>FedEx PTS:</p>{' '}
            <p className={styles.infoPoints}>
              {entry?.fedExPoints ? entry?.fedExPoints.toFixed(2) : 0}
            </p>
          </div>
        </div>
        {currentUserCanEdit && (
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
                  poolId: Number(poolId),
                  entryId: entry.id,
                  mutateArray: [poolEntriesMutate],
                })
              }
              wrapperClassName={styles.wrapperContainer}
            />
          </OutsideClickHandler>
        )}
      </div>
    </div>
  )
}
