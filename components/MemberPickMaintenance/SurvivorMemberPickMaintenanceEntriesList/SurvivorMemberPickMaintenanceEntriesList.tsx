import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import {
  Pool,
  SurvivorEntriesItem,
  SurvivorEntriesItemForecastItem,
} from '@/api'
import {
  SmallRightArrowWithBorder,
  SmallRoundWithBorder,
  VerticalDots,
} from '@/assets/icons'
import { routes, generateParticipantImagePath } from '@/config/constants'
import { EntrySettings } from '@/features/components/EntrySettings'
import { CreateNewEntryButton } from '@/features/components/MemberPickMaintenance'

import styles from './SurvivorMemberPickMaintenanceEntriesList.module.scss'

type SurvivorMemberPickMaintenanceEntriesListProps = {
  poolEntriesData: SurvivorEntriesItem[]
  renameEntry: (entryId: number, newName: string) => void
  deleteEntry: (entryId: number) => void
  createNewEntry: () => void
  selectedMemberId: number | null
  createEntryIsLoading: boolean
  startWeek: string
  poolData: Pool<'survivor'>
  search: string
}

export function SurvivorMemberPickMaintenanceEntriesList({
  poolEntriesData,
  renameEntry,
  deleteEntry,
  createNewEntry,
  selectedMemberId,
  createEntryIsLoading = false,
  startWeek,
  poolData,
  search,
}: SurvivorMemberPickMaintenanceEntriesListProps) {
  const currentWeek = poolData.pick_pool.current_week
  const availableWeek = poolData.available_week

  const listOfWeeks = availableWeek.slice(
    0,
    availableWeek.indexOf(currentWeek) + 1,
  )

  const entriesLimit =
    poolData.tournament.name === 'NFL'
      ? poolData.allow_multiple_entries === 0
        ? 'unlimited'
        : poolData.allow_multiple_entries
      : poolData.allow_multiple_entries
      ? 1
      : 'unlimited'

  const createEntryIsDisabled = !(
    entriesLimit === 'unlimited' || poolEntriesData.length < entriesLimit
  )

  return (
    <div className={styles.entriesWrapper}>
      <div className={styles.entriesHead}>
        <p>Entry Name</p>
        <p>Picks</p>
        <p>Surviving weeks</p>
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
              startWeek={startWeek}
              listOfWeeks={listOfWeeks}
              doublePicks={poolData.pick_pool.double_picks}
            />
          ))
        ) : (
          <div className={styles.emptyBlock}>
            No matching entries were found for your request
          </div>
        )}
      </div>

      {!search.trim() &&
        (createEntryIsDisabled ? (
          <p className={styles.limitText}>
            The limit for making entries in this pool{' '}
            <span>has been reached for this user</span> (max. {entriesLimit})
          </p>
        ) : (
          <CreateNewEntryButton
            createEntryIsDisabled={createEntryIsLoading}
            createNewEntry={createNewEntry}
          />
        ))}
    </div>
  )
}

type EntryItemProps = {
  item: SurvivorEntriesItem
  deleteEntry: (entryId: number) => void
  renameEntry: (entryId: number, newName: string) => void
  selectedMemberId: number | null
  startWeek: string
  listOfWeeks: number[]
  doublePicks: Pool<'survivor'>['pick_pool']['double_picks']
}

function EntryItem({
  item,
  deleteEntry,
  renameEntry,
  selectedMemberId,
  startWeek,
  listOfWeeks = [],
  doublePicks = [],
}: EntryItemProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [showConfirmDeletion, setShowConfirmDeletion] = useState(false)

  const [isFocus, setIsFocus] = useState<boolean>(false)
  const [value, setValue] = useState<string>(item.name)

  useEffect(() => {
    setValue(item.name)
  }, [item])

  useEffect(() => {
    if (isFocus && inputRef.current) inputRef.current.focus()
  }, [isFocus])

  const rename = () => {
    setIsFocus(false)

    if (item.name.trim() !== value.trim()) {
      renameEntry(item.id, value)
    }

    setValue(item.name)
  }

  const editEntryLink = (weekNumber: number) =>
    routes.account.makePick.index(item.pool_id, {
      week_number: Number(weekNumber),
      entry_id: item.id,
      isMaintenance: 1,
      user_id: selectedMemberId ? Number(selectedMemberId) : undefined,
    })

  const makePickLink = isNaN(Number(startWeek))
    ? '#'
    : editEntryLink(Number(startWeek))

  const survivorForecasts = [...item.forecasts]
    .filter((item) => item.status !== 'no_pick')
    .sort((a, b) => a.week_number - b.week_number)

  const survivingWeeks = survivorForecasts.reduce<number[]>(
    (survivingWeeks, item, _, arr) => {
      if (survivingWeeks.includes(item.week_number)) return survivingWeeks

      if (doublePicks.includes(String(item.week_number))) {
        const forecasts = arr.filter(
          (arrItem) => arrItem.week_number === item.week_number,
        )

        const isWin =
          forecasts.reduce((result, forecast) => {
            if (forecast.status === 'win' || !!forecast.is_mulligan) result++
            return result
          }, 0) === forecasts.length

        if (isWin) survivingWeeks.push(item.week_number)
        return survivingWeeks
      }

      if (item.status === 'win') {
        survivingWeeks.push(item.week_number)
      }

      return survivingWeeks
    },
    [],
  ).length

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
          [styles.forecastsWrapperNotForecasts]: !survivorForecasts.length,
        })}
      >
        {survivorForecasts.length ? (
          listOfWeeks.map((weekNumber: number) => {
            const isDoublePick = doublePicks.includes(String(weekNumber))

            const link = editEntryLink(weekNumber)

            // предыдущая ставка
            const prevForecasts = survivorForecasts.filter(
              (forecast) => forecast.week_number === weekNumber - 1,
            )

            // ставка разрешена на первой неделе и последующей неделе, но только
            // в том случае, если предыдущая ставка выиграла или если у проигравшей
            // ставки mulligan = true
            const isAllowPick =
              weekNumber !== Number(startWeek)
                ? prevForecasts.length
                  ? prevForecasts.reduce((count, item) => {
                      if (item.status === 'win' || !!item?.is_mulligan) count++
                      return count
                    }, 0) === prevForecasts.length
                  : false
                : true

            return isDoublePick ? (
              <DoubleSurvivorForecastItem
                weekNumber={weekNumber}
                survivorForecasts={survivorForecasts}
                link={link}
                isAllowPick={isAllowPick}
                key={weekNumber}
              />
            ) : (
              <SingleSurvivorForecastItem
                weekNumber={weekNumber}
                survivorForecasts={survivorForecasts}
                link={link}
                isAllowPick={isAllowPick}
                key={weekNumber}
              />
            )
          })
        ) : (
          <Link href={makePickLink} className={styles.makePickLink}>
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

      <p>{!!survivorForecasts.length && survivingWeeks}</p>

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
            editEntryLink={makePickLink}
            renameAction={() => setIsFocus(true)}
            deleteAction={() => deleteEntry(item.id)}
          />
        </OutsideClickHandler>
      </div>
    </div>
  )
}

type DoubleSurvivorForecastItemProps = {
  weekNumber: number
  survivorForecasts: SurvivorEntriesItemForecastItem[]
  link: string
  isAllowPick: boolean
}

function DoubleSurvivorForecastItem({
  weekNumber,
  survivorForecasts,
  link,
  isAllowPick,
}: DoubleSurvivorForecastItemProps) {
  const forecasts = survivorForecasts.filter(
    (forecast) => forecast.week_number === weekNumber,
  )

  const srcForecast1 = forecasts[0]
    ? generateParticipantImagePath(forecasts[0].participant.external_id)
    : undefined

  const srcForecast2 = forecasts[1]
    ? generateParticipantImagePath(forecasts[1].participant.external_id)
    : undefined

  const isForecastNotPicked = !forecasts.length && isAllowPick

  const isAutoPick = forecasts.reduce((isAutoPick, item) => {
    if (!!item.is_auto_pick && !isAutoPick) isAutoPick = true
    return isAutoPick
  }, false)

  const isMulligan = forecasts.reduce((isMulligan, item) => {
    if (!!item.is_mulligan && !isMulligan) isMulligan = true
    return isMulligan
  }, false)

  return (
    <div
      key={weekNumber}
      className={classNames(styles.forecastItem, styles.forecastDoublePick, {
        [styles.forecastNotLink]: !isAllowPick,
        [styles.forecastNotPicked]: isForecastNotPicked,
      })}
    >
      {!isAllowPick && <p className={styles.weekNumber}>{weekNumber}</p>}

      <div
        className={classNames(styles.doublePicksWrapper, {
          [styles.doublePicksWrapperHide]: !forecasts.length,
        })}
      >
        <div
          className={classNames(styles.forecast1Wrapper, {
            [styles.forecastWin]: forecasts[0]?.status === 'win',
            [styles.forecastLost]: forecasts[0]?.status === 'lost',
          })}
        ></div>

        {srcForecast1 && forecasts[0] && (
          <Image
            src={srcForecast1}
            width={30}
            height={30}
            alt={forecasts[0].participant.name}
            className={styles.forecastImg1}
          />
        )}

        <div
          className={classNames(styles.forecast2Wrapper, {
            [styles.forecastWin]: forecasts[1]?.status === 'win',
            [styles.forecastLost]: forecasts[1]?.status === 'lost',
          })}
        ></div>

        {srcForecast2 && forecasts[1] && (
          <Image
            src={srcForecast2}
            width={30}
            height={30}
            alt={forecasts[1].participant.name}
            className={styles.forecastImg2}
          />
        )}
      </div>

      {isForecastNotPicked && <p className={styles.notPickedText}>No picks</p>}

      {isAllowPick && (
        <Link href={link} className={styles.pickemForecastsLink} />
      )}

      <div className={styles.tooltip}>
        <p className={styles.tooltipWeekNumber}>Week {weekNumber}</p>

        {!!forecasts.length && (
          <>
            <p
              className={classNames(styles.tooltipText, {
                [styles.used]: isAutoPick,
              })}
            >
              Autopick used
            </p>

            <p
              className={classNames(styles.tooltipText, {
                [styles.used]: isMulligan,
              })}
            >
              Mulligan used
            </p>
          </>
        )}
      </div>

      {isAutoPick && (
        <SmallRightArrowWithBorder className={styles.autoPickIcon} />
      )}
      {isMulligan && <SmallRoundWithBorder className={styles.mulliganIcon} />}
    </div>
  )
}

type SingleSurvivorForecastItemProps = {
  weekNumber: number
  survivorForecasts: SurvivorEntriesItemForecastItem[]
  link: string
  isAllowPick: boolean
}

function SingleSurvivorForecastItem({
  weekNumber,
  survivorForecasts,
  link,
  isAllowPick,
}: SingleSurvivorForecastItemProps) {
  const forecast = survivorForecasts.find(
    (forecast) => forecast.week_number === weekNumber,
  )

  const src = forecast
    ? generateParticipantImagePath(forecast.participant.external_id)
    : undefined

  const isForecastNotPicked = !forecast && isAllowPick

  return (
    <div
      key={weekNumber}
      className={classNames(styles.forecastItem, {
        [styles.forecastItemWin]: forecast?.status === 'win',
        [styles.forecastItemLost]: forecast?.status === 'lost',
        [styles.forecastNotPicked]: isForecastNotPicked,
        [styles.forecastNotLink]: !isAllowPick,
      })}
    >
      {!isAllowPick && <p className={styles.weekNumber}>{weekNumber}</p>}

      {src && forecast && (
        <Image
          src={src}
          width={30}
          height={30}
          alt={forecast.participant.name}
        />
      )}

      {isForecastNotPicked && <p className={styles.notPickedText}>No picks</p>}

      {isAllowPick && (
        <Link href={link} className={styles.pickemForecastsLink} />
      )}

      <div className={styles.tooltip}>
        <p className={styles.tooltipWeekNumber}>Week {weekNumber}</p>

        {!!forecast && (
          <>
            <p
              className={classNames(styles.tooltipText, {
                [styles.used]: forecast.is_auto_pick,
              })}
            >
              Autopick used
            </p>

            <p
              className={classNames(styles.tooltipText, {
                [styles.used]: forecast.is_mulligan,
              })}
            >
              Mulligan used
            </p>
          </>
        )}
      </div>

      {!!forecast?.is_auto_pick && (
        <SmallRightArrowWithBorder className={styles.autoPickIcon} />
      )}

      {!!forecast?.is_mulligan && (
        <SmallRoundWithBorder className={styles.mulliganIcon} />
      )}
    </div>
  )
}
