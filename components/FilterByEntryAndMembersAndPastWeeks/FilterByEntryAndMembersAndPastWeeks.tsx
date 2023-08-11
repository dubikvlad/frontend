import classNames from 'classnames'
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react'

import { Pool, PoolTypes } from '@/api'
import { dateFormattingEvent } from '@/config/constants'
import { Input, SelectWithCheckboxes, Select2 } from '@/features/ui'
import { SelectProps } from '@/features/ui/Select/Select'
import { useGetGolfTournaments, useGetPoolUsers, useGetUser } from '@/helpers'

import styles from './FilterByEntryAndMembersAndPastWeeks.module.scss'

export type FilterByEntryAndMembersAndPastWeeksProps = {
  poolData: Pool<PoolTypes>
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  members: string[]
  setMembers: Dispatch<SetStateAction<string[]>>
  week?: string
  setWeek?: Dispatch<SetStateAction<string>>
  setMembersOptions?: Dispatch<SetStateAction<SelectProps['options']>>
  setWeekOptions?: Dispatch<SetStateAction<SelectProps['options']>>
  isDisabled?: boolean
  isAllowComingWeeks?: boolean
  isCreateEntryShow?: boolean
  setIsCreateEntryShow?: Dispatch<SetStateAction<boolean>>
  isCreateEntryButtonDisabled?: boolean
  isCreateEntryButtonAlwaysActive?: boolean
  golfTournamentId?: string
  setGolfTournamentId?: Dispatch<SetStateAction<string>>
}

export default function FilterByEntryAndMembersAndPastWeeks({
  poolData,
  search = '',
  setSearch,
  members = [],
  setMembers,
  week = '',
  setWeek,
  setMembersOptions,
  setWeekOptions,
  isDisabled = false,
  isAllowComingWeeks = false,
  isCreateEntryShow,
  setIsCreateEntryShow,
  isCreateEntryButtonDisabled,
  isCreateEntryButtonAlwaysActive = false,
  golfTournamentId,
  setGolfTournamentId,
}: FilterByEntryAndMembersAndPastWeeksProps) {
  const { userData } = useGetUser()
  const { poolUsersData } = useGetPoolUsers(poolData.id)

  const isCommissioner = userData ? userData.id === poolData.user_id : false

  const membersOptions = useMemo(
    () =>
      poolUsersData.map((item) => ({
        title: `${item.username}`,
        name: String(item.id),
      })),
    [poolUsersData],
  )

  useEffect(() => {
    if (setMembersOptions && membersOptions.length) {
      setMembersOptions(membersOptions)
    }
  }, [setMembersOptions, membersOptions])

  const weekOptions = useMemo(() => {
    const availableWeek = poolData.available_week ?? []
    const pickPool = poolData.pick_pool

    if (!pickPool || !('start_week' in pickPool)) return []

    const startWeekIndex = availableWeek.indexOf(Number(pickPool.start_week))
    const currentWeekIndex = isAllowComingWeeks
      ? undefined
      : availableWeek.indexOf(pickPool.current_week)

    if (startWeekIndex === -1 || currentWeekIndex === -1) return []

    return [
      ...availableWeek
        .slice(
          startWeekIndex,
          currentWeekIndex
            ? currentWeekIndex + Number(isCommissioner)
            : currentWeekIndex,
        )
        .map((item) => ({ title: `Week ${item}`, name: String(item) })),
    ]
  }, [poolData, isAllowComingWeeks, isCommissioner])

  useEffect(() => {
    if (setWeekOptions && weekOptions.length) {
      setWeekOptions(weekOptions)
    }
  }, [setWeekOptions, weekOptions])

  useEffect(() => {
    if (!week.trim() && weekOptions.length && setWeek && poolData) {
      const pickPool = poolData.pick_pool

      if (!!pickPool && 'current_week' in pickPool) {
        const currentWeekOptionIndex = weekOptions.findIndex(
          (item) => item.name === String(pickPool.current_week),
        )

        setWeek(
          weekOptions[~currentWeekOptionIndex ? currentWeekOptionIndex : 0]
            .name,
        )
      }
    }
  }, [week, weekOptions, setWeek, poolData])

  const { golfAllTournaments } = useGetGolfTournaments({
    poolId:
      poolData.type === 'golf_pick_x' &&
      (poolData as Pool<'golf_pick_x'>).pick_pool.pick_frequency === 'weekly'
        ? poolData.id
        : undefined,
  })

  const golfTournamentsOptions = useMemo(() => {
    if (!golfAllTournaments.length || !poolData) return []

    return [...golfAllTournaments]
      .filter(
        (item) =>
          new Date(
            (
              poolData as Pool<'golf_pick_x'>
            ).pick_pool.next_golf_tournament.start_date,
          ).getTime() >= new Date(item.start_date).getTime(),
      )
      .sort((a, b) =>
        new Date(a.start_date).getTime() > new Date(b.start_date).getTime()
          ? -1
          : 1,
      )
      .map((item) => ({
        title: item.name,
        name: String(item.id),
        isDisabled: item.is_disabled,
      }))
  }, [golfAllTournaments, poolData])

  useEffect(() => {
    if (
      golfTournamentId !== undefined &&
      golfTournamentId.trim() === '' &&
      golfTournamentsOptions.length &&
      setGolfTournamentId
    ) {
      const activeTournament = golfTournamentsOptions.find(
        (tournament) => !tournament.isDisabled,
      )

      if (activeTournament) setGolfTournamentId(activeTournament.name)
    }
  }, [golfTournamentsOptions, golfTournamentId, setGolfTournamentId])

  return (
    <div
      className={classNames(styles.filterWrapper, {
        [styles.filterWrapperDisabled]: isDisabled,
      })}
    >
      <Input
        type="search"
        value={search}
        onChange={(value) => !isDisabled && setSearch(value)}
        placeholder="Search by Entries"
      />

      <SelectWithCheckboxes
        options={membersOptions}
        value={members}
        onChange={setMembers}
        className={styles.membersSelect}
        dropdownClassName={styles.membersSelectDropdown}
        placeholder="All members"
      />

      {!!weekOptions.length && week && setWeek && (
        <Select2
          options={weekOptions}
          value={week}
          onChange={setWeek}
          placeholder="Week"
        />
      )}

      {!!golfTournamentsOptions.length &&
        golfTournamentId !== undefined &&
        setGolfTournamentId && (
          <Select2
            options={golfTournamentsOptions}
            value={golfTournamentId}
            onChange={setGolfTournamentId}
            placeholder="Tournament name"
            customOptionTitle={(option) => {
              const currentTournament = golfAllTournaments.find(
                (item) => item.id === +option.name,
              )

              if (!currentTournament) return option.title

              return (
                <>
                  {option.title}{' '}
                  <span
                    className={classNames(styles.tournamentNameOptionDate, {
                      [styles.tournamentNameOptionDateCurrent]:
                        (poolData as Pool<'golf_pick_x'>).pick_pool
                          .next_golf_tournament.id === currentTournament.id,
                    })}
                  >
                    ({dateFormattingEvent(currentTournament.start_date)} -{' '}
                    {dateFormattingEvent(currentTournament.finish_date)})
                  </span>
                </>
              )
            }}
          />
        )}

      {isCreateEntryShow !== undefined && setIsCreateEntryShow !== undefined && (
        <div
          className={classNames(styles.buttonWrapper, {
            [styles.alwaysActive]: isCreateEntryButtonAlwaysActive,
          })}
        >
          <button
            className={classNames('button', 'button-blue-outline', {
              disabled: isCreateEntryButtonDisabled,
              [styles.createEntryButtonHide]: isCreateEntryShow,
            })}
            onClick={() => setIsCreateEntryShow(true)}
          >
            Create a New Entry
          </button>
        </div>
      )}
    </div>
  )
}
