import classNames from 'classnames'
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react'

import { Pool, PoolTypes } from '@/api'
import { Input, SelectWithCheckboxes, Select2, Range } from '@/features/ui'
import { SelectProps } from '@/features/ui/Select/Select'
import { useGetPoolUsers } from '@/helpers'

import styles from './FilterByEntryAndMembersAndWeeks.module.scss'

export type FilterByEntryAndMembersAndWeeksProps = {
  poolData: Pool<PoolTypes>
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  members: string[]
  setMembers: Dispatch<SetStateAction<string[]>>
  wholeSeason?: string | 'whole-season' | 'week-range'
  setWholeSeason?: Dispatch<SetStateAction<string | undefined>>
  setRangeValue?: Dispatch<SetStateAction<[number | null, number | null]>>
  setMembersOptions?: Dispatch<SetStateAction<SelectProps['options']>>
  setWeekOptions?: Dispatch<SetStateAction<SelectProps['options']>>
  isWithWeekRange?: boolean
  isDisabled?: boolean
}

export default function FilterByEntryAndMembersAndWeeks({
  poolData,
  search = '',
  setSearch,
  members = [],
  setMembers,
  wholeSeason = '',
  setWholeSeason,
  setRangeValue,
  setMembersOptions,
  setWeekOptions,
  isWithWeekRange = false,
  isDisabled = false,
}: FilterByEntryAndMembersAndWeeksProps) {
  const defaultWeekOption = useMemo(
    () =>
      [
        { title: 'Whole season', name: 'whole-season' },
        isWithWeekRange
          ? { title: 'Week range', name: 'week-range' }
          : undefined,
      ].filter((item) => !!item) as SelectProps['options'],
    [isWithWeekRange],
  )

  const { poolUsersData } = useGetPoolUsers(poolData.id)

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

    if (
      !pickPool ||
      !('start_week' in pickPool) ||
      !('current_week' in pickPool)
    )
      return []

    return [
      ...defaultWeekOption,
      ...availableWeek
        .slice(
          availableWeek.indexOf(Number(pickPool.start_week)),
          availableWeek.indexOf(pickPool.current_week + 1),
        )
        .map((item) => ({ title: `Week ${item}`, name: String(item) })),
    ]
  }, [poolData, defaultWeekOption])

  useEffect(() => {
    if (setWeekOptions && weekOptions.length) {
      setWeekOptions(weekOptions)
    }
  }, [setWeekOptions, weekOptions])

  useEffect(() => {
    if (setWholeSeason) {
      if (!wholeSeason.trim()) setWholeSeason(defaultWeekOption[0].name)
    }
  }, [wholeSeason, setWholeSeason, defaultWeekOption])

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
        className={classNames(styles.membersSelect, {
          [styles.rangeVisible]: wholeSeason === 'week-range',
        })}
        dropdownClassName={styles.membersSelectDropdown}
        placeholder="All members"
      />

      {setWholeSeason && (
        <Select2
          options={weekOptions}
          value={wholeSeason}
          onChange={setWholeSeason}
        />
      )}

      {wholeSeason === 'week-range' &&
        setRangeValue &&
        !!poolData.pick_pool &&
        'start_week' in poolData.pick_pool &&
        'current_week' in poolData.pick_pool && (
          <Range
            min={
              poolData.available_week[
                poolData.available_week.indexOf(
                  Number(poolData.pick_pool.start_week),
                )
              ]
            }
            max={
              poolData.available_week[
                poolData.available_week.indexOf(poolData.pick_pool.current_week)
              ]
            }
            onChange={(min, max) => setRangeValue([min, max])}
            className={styles.rangeInput}
            labelTextMin={(minValue) => `Week ${minValue}`}
            labelTextMax={(maxValue) => `Week ${maxValue}`}
          />
        )}
    </div>
  )
}
