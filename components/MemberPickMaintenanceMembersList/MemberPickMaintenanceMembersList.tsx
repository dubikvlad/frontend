import classNames from 'classnames'
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
} from 'react'

import { UserForManagementItem } from '@/api'
import { Sorting } from '@/features/ui'
import { SortingProps } from '@/features/ui/Sorting/Sorting'

import styles from './MemberPickMaintenanceMembersList.module.scss'

type SortType = {
  name: 'name' | 'entries-count' | null
  sort: SortingProps['active']
}

type MembersListProps = {
  usersForManagementData: UserForManagementItem[]
  members: string[]
  selectedMemberId: number | null
  setSelectedMemberId: Dispatch<
    SetStateAction<MembersListProps['selectedMemberId']>
  >
}

export function MemberPickMaintenanceMembersList({
  usersForManagementData = [],
  members = [],
  selectedMemberId,
  setSelectedMemberId,
}: MembersListProps) {
  const [sort, setSort] = useState<SortType>({ name: null, sort: null })

  const handlingSortMemoized = useCallback(
    (sortName: SortType['name']) => {
      if (sortName === sort.name) {
        if (sort.sort === null) setSort((prev) => ({ ...prev, sort: 'top' }))
        if (sort.sort === 'top')
          setSort((prev) => ({ ...prev, sort: 'bottom' }))
        if (sort.sort === 'bottom') setSort({ name: null, sort: null })
        return
      }

      setSort({ name: sortName, sort: 'top' })
    },
    [sort],
  )

  type UserDataItem = {
    id: number
    name: string
    entriesCount: number
  }

  const usersData: UserDataItem[] = usersForManagementData.map((item) => ({
    id: item.id,
    name: item.username,
    entriesCount: item.entries.length,
  }))

  const sortedUsersData = members.length
    ? usersData
        .filter((item) => members.includes(String(item.id)))
        .sort(sorting)
    : usersData.sort(sorting)

  useEffect(() => {
    if (
      selectedMemberId !== null &&
      !sortedUsersData.find(
        (item) => item.id === selectedMemberId && setSelectedMemberId,
      )
    ) {
      setSelectedMemberId(null)
    }
  }, [selectedMemberId, sortedUsersData, setSelectedMemberId])

  useEffect(() => {
    if (
      sortedUsersData.length &&
      selectedMemberId === null &&
      setSelectedMemberId
    ) {
      setSelectedMemberId(sortedUsersData[0].id)
    }
  }, [sortedUsersData, selectedMemberId, setSelectedMemberId])

  function sorting(a: UserDataItem, b: UserDataItem) {
    if (sort.name === 'name') {
      if (sort.sort === 'bottom') {
        if (a.name > b.name) return -1
        if (a.name < b.name) return 1
        return 0
      } else {
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
      }
    }

    if (sort.name === 'entries-count') {
      return sort.sort === 'bottom'
        ? b.entriesCount - a.entriesCount
        : a.entriesCount - b.entriesCount
    }

    return 0
  }

  return (
    <div className={styles.membersWrapper}>
      <div className={styles.membersHead}>
        <div
          className={classNames(styles.sortWrapper, {
            [styles.active]: sort.name === 'name',
          })}
          onClick={() => handlingSortMemoized('name')}
        >
          Name
          <Sorting active={sort.name === 'name' ? sort.sort : null} />
        </div>

        <div
          className={classNames(styles.sortWrapper, {
            [styles.active]: sort.name === 'entries-count',
          })}
          onClick={() => handlingSortMemoized('entries-count')}
        >
          Entries #
          <Sorting active={sort.name === 'entries-count' ? sort.sort : null} />
        </div>
      </div>

      {sortedUsersData.length ? (
        sortedUsersData.map((item) => (
          <div
            key={item.id}
            className={classNames(styles.membersRow, {
              [styles.membersRowActive]: item.id === selectedMemberId,
            })}
            onClick={() => setSelectedMemberId(item.id)}
          >
            <p>{item.name}</p>
            <p>{item.entriesCount}</p>
          </div>
        ))
      ) : (
        <div className={styles.emptyBlock}></div>
      )}
    </div>
  )
}
