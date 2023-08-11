import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useState, useCallback } from 'react'

import { User } from '@/api'
import { Bell } from '@/assets/icons'
import { poolTypes } from '@/config/constants'
import { Sorting } from '@/features/ui'
import { SortingProps } from '@/features/ui/Sorting/Sorting'
import { useGetUserInfo, useGetPoolUsers, usePool } from '@/helpers'

import styles from './ManageEntriesPoolEntries.module.scss'

type SortType = {
  name: 'name' | 'date-joined' | 'entries' | 'pick-made' | null
  sort: SortingProps['active']
}

export default function ManageEntriesPoolEntries() {
  const {
    query: { poolId },
  } = useRouter()

  const { userInfoData } = useGetUserInfo()
  const { poolUsersData } = useGetPoolUsers(Number(poolId))
  const { poolData } = usePool(Number(poolId))

  const isHide = poolData?.type == poolTypes.playoff

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

  const sortedData =
    sort.sort === null ? poolUsersData : [...poolUsersData].sort(sorting)

  function sorting(a: User, b: User) {
    if (sort.name === 'name') {
      if (sort.sort === 'bottom') {
        if (a.username > b.username) return -1
        if (a.username < b.username) return 1
        return 0
      } else {
        if (a.username > b.username) return 1
        if (a.username < b.username) return -1
        return 0
      }
    }

    if (sort.name === 'date-joined') {
      const aJoinedTime = new Date(a.joined_date).getTime()
      const bJoinedTime = new Date(b.joined_date).getTime()

      if (sort.sort === 'bottom') {
        if (aJoinedTime > bJoinedTime) return -1
        if (aJoinedTime < bJoinedTime) return 1
        return 0
      } else {
        if (aJoinedTime > bJoinedTime) return 1
        if (aJoinedTime < bJoinedTime) return -1
        return 0
      }
    }

    if (sort.name === 'entries') {
      if (sort.sort === 'bottom') {
        if (a.entries_count > b.entries_count) return -1
        if (a.entries_count < b.entries_count) return 1
        return 0
      } else {
        if (a.entries_count > b.entries_count) return 1
        if (a.entries_count < b.entries_count) return -1
        return 0
      }
    }

    if (sort.name === 'pick-made') {
      const aDifference = a.entries_count - a.pick_entries_count
      const bDifference = b.entries_count - b.pick_entries_count

      if (sort.sort === 'bottom') {
        if (aDifference > bDifference) return -1
        if (aDifference < bDifference) return 1
        return 0
      } else {
        if (aDifference > bDifference) return 1
        if (aDifference < bDifference) return -1
        return 0
      }
    }

    return 0
  }

  if (!userInfoData) return null

  return (
    <div className={styles.table}>
      <div className={classNames(styles.tableHead, styles.tableRow)}>
        <div
          className={classNames(styles.sortableItem, {
            [styles.sortableItemActive]: sort.name === 'name',
          })}
          onClick={() => handlingSortMemoized('name')}
        >
          <p>Name</p>
          <Sorting active={sort.name === 'name' ? sort.sort : null} />
        </div>

        <div
          className={classNames(styles.sortableItem, {
            [styles.sortableItemActive]: sort.name === 'date-joined',
          })}
          onClick={() => handlingSortMemoized('date-joined')}
        >
          <p>Date Joined</p>
          <Sorting active={sort.name === 'date-joined' ? sort.sort : null} />
        </div>

        <div
          className={classNames(styles.sortableItem, styles.indented, {
            [styles.sortableItemActive]: sort.name === 'entries',
          })}
          onClick={() => handlingSortMemoized('entries')}
        >
          <p>Entries #</p>
          <Sorting active={sort.name === 'entries' ? sort.sort : null} />
        </div>

        <div
          className={classNames(styles.sortableItem, styles.indented, {
            [styles.sortableItemActive]: sort.name === 'pick-made',
          })}
          onClick={() => handlingSortMemoized('pick-made')}
        >
          <p>Pick Made</p>
          <Sorting active={sort.name === 'pick-made' ? sort.sort : null} />
        </div>

        <p className={styles.indented}>Contacts</p>
        <p></p>
      </div>

      <div className={styles.tableBody}>
        {sortedData.map((item) => {
          const joinedData = new Date(item.joined_date)
          const joinedDataString = `${joinedData.getDate()}/${
            joinedData.getMonth() + 1
          }/${joinedData.getFullYear()}`

          return (
            <div
              key={item.id}
              className={classNames(styles.tableRow, {
                [styles.tableRowUser]: userInfoData.id === item.id,
              })}
            >
              <p>{item.username}</p>
              <p>{joinedDataString}</p>
              <p className={classNames(styles.indented, styles.withBg)}>
                {item.entries_count}
              </p>
              <div className={styles.indented}>
                {!item.entries_count ? (
                  <p>-</p>
                ) : item.pick_entries_count === item.entries_count ? (
                  <p className={styles.yes}>Yes</p>
                ) : (
                  <p className={styles.no}>
                    <span>No</span>{' '}
                    {!isHide &&
                      `(${item.pick_entries_count}/
                    ${item.entries_count})`}
                  </p>
                )}
              </div>
              <p className={classNames(styles.indented, styles.withBg)}>
                {item.email}
              </p>
              <div className={styles.bell}>
                {item.pick_entries_count !== item.entries_count && <Bell />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
