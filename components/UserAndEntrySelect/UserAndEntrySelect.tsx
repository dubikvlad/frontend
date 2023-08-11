import classNames from 'classnames'
import { Dispatch, SetStateAction, useState, useEffect, useMemo } from 'react'
import { KeyedMutator } from 'swr'

import {
  ResponseData,
  EntriesPoolEntriesData,
  api,
  Pool,
  KnownEntriesTypes,
  UserForManagementItem,
} from '@/api'
import { defaultEntryColor, handlingDeadline } from '@/config/constants'
import { SelectWithSearch, ColorPicker } from '@/features/ui'
import type { Option } from '@/features/ui/SelectWithSearch'
import { useEntrySelect, useGetUser, useUsersForManagement } from '@/helpers'

import styles from './UserAndEntrySelect.module.scss'

export const UserAndEntrySelects = <
  K extends keyof KnownEntriesTypes,
  T extends KnownEntriesTypes,
  EntryType extends T[K],
>({
  poolData,
  entriesData,
  mutateEntries,
  setSelectedEntry,
  pickDeadline,
  setIsEditMode,
  selectedWeek,
}: {
  poolData: Pool<K>
  entriesData: EntryType
  setSelectedEntry: Dispatch<SetStateAction<EntryType[number] | null>>
  mutateEntries?: KeyedMutator<ResponseData<EntriesPoolEntriesData<K>> | null>
  pickDeadline?: string | null
  setIsEditMode?: Dispatch<SetStateAction<boolean>>
  selectedWeek?: number | string
}) => {
  const [deadlineTime, setDeadlineTime] = useState<string | null>(null)

  const { userData } = useGetUser()

  const { usersForManagementData, usersForManagementIsLoading } =
    useUsersForManagement(poolData.is_commissioner ? poolData.id : undefined)

  const {
    selectedEntry: hookEntry,
    selectedEntryId,
    selectedUserId,
    setSelectedEntryId,
    setSelectedUserId,
    isEditMode,
    selectedUserEntriesArr,
  } = useEntrySelect({
    poolData,
    poolEntriesData: entriesData,
    userData,
    usersForManagementData,
  })

  const entriesOptions = useMemo<Option[]>(
    () =>
      selectedUserEntriesArr.map((entry) => ({
        title: entry.name,
        name: entry.id.toString(),
        isDisabled:
          !isEditMode && 'is_closed' in entry ? !!entry.is_closed : false,
      })),
    [selectedUserEntriesArr, isEditMode],
  )

  useEffect(() => {
    if (hookEntry) setSelectedEntry(hookEntry)
  }, [hookEntry, setSelectedEntry])

  useEffect(() => {
    if (setIsEditMode && isEditMode) setIsEditMode(isEditMode)
  }, [isEditMode, setIsEditMode])

  useEffect(() => {
    setDeadlineTime(handlingDeadline(pickDeadline))

    const timer = setInterval(
      () => setDeadlineTime(handlingDeadline(pickDeadline)),
      60000, // 1 minute
    )

    return () => clearInterval(timer)
  }, [pickDeadline])

  return (
    <div className={styles.topRow}>
      <div
        className={classNames(styles.selectsContainer, {
          [styles.selectsContainerEditMode]: isEditMode,
        })}
      >
        {isEditMode && (
          <UserSelect
            selectedUserId={selectedUserId}
            setselectedUserId={setSelectedUserId}
            isDisabled={usersForManagementIsLoading}
            usersForManagementData={usersForManagementData}
          />
        )}

        <EntrySelect
          entriesOptions={entriesOptions}
          selectedEntryId={selectedEntryId}
          setSelectedEntryId={setSelectedEntryId}
          isDisabled={usersForManagementIsLoading || !entriesOptions.length}
        />

        {!!mutateEntries && !!hookEntry?.color && (
          <ColorChange
            mutateEntries={mutateEntries}
            poolId={poolData.id}
            selectedEntryId={selectedEntryId}
            entryColor={hookEntry.color}
          />
        )}
      </div>

      <div className={styles.deadlineWrapper}>
        {pickDeadline ? (
          <>
            <p className={styles.weekDeadlineText}>
              {!!selectedWeek && `Week ${selectedWeek} `}Deadline
            </p>
            <p className={styles.weekDeadlineValue}>
              {deadlineTime?.trim() ? deadlineTime : '-'}
            </p>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

const EntrySelect = ({
  selectedEntryId,
  setSelectedEntryId,
  entriesOptions,
  isDisabled,
}: {
  selectedEntryId: number | null
  setSelectedEntryId: Dispatch<SetStateAction<number | null>>
  entriesOptions: Option[]
  isDisabled: boolean
}) => {
  return (
    <SelectWithSearch
      onChange={(v) => setSelectedEntryId(Number(v))}
      options={entriesOptions}
      value={selectedEntryId ? selectedEntryId.toString() : null}
      isDisabled={isDisabled}
    />
  )
}

const UserSelect = ({
  selectedUserId,
  setselectedUserId,
  isDisabled,
  usersForManagementData,
}: {
  selectedUserId: number | null
  setselectedUserId: Dispatch<SetStateAction<number | null>>
  isDisabled: boolean
  usersForManagementData: UserForManagementItem[]
}) => {
  const userOptions: Option[] = usersForManagementData.map((u) => ({
    name: u.id.toString(),
    title: `${u.first_name} ${u.last_name}`,
  }))

  return (
    <SelectWithSearch
      options={userOptions}
      onChange={(v) => setselectedUserId(Number(v))}
      value={selectedUserId ? selectedUserId.toString() : null}
      isDisabled={isDisabled || !userOptions.length}
    />
  )
}

const ColorChange = <K extends keyof KnownEntriesTypes>({
  poolId,
  mutateEntries,
  selectedEntryId,
  entryColor,
}: {
  poolId: number
  selectedEntryId: number | null
  entryColor?: string
  mutateEntries: KeyedMutator<ResponseData<EntriesPoolEntriesData<K>> | null>
}) => {
  const [isLoading, setisLoading] = useState(false)

  async function changeEntryColor(newColor: string) {
    if (!selectedEntryId || newColor === entryColor) return

    try {
      api.entries
        .changeFields(poolId, selectedEntryId, { color: newColor })
        .then(() => mutateEntries())
        .finally(() => setisLoading(false))
    } catch (e) {}
  }

  return (
    <ColorPicker
      onChange={changeEntryColor}
      value={entryColor ?? defaultEntryColor}
      isDisabled={isLoading}
    />
  )
}
