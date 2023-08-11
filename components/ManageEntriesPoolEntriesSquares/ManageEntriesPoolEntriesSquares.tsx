import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useCallback, useMemo } from 'react'

import { User } from '@/api'
import { Bell } from '@/assets/icons'
import { Star } from '@/assets/icons'
import { getShortName, routes } from '@/config/constants'
import { Input, SelectWithCheckboxes, Sorting } from '@/features/ui'
import { SortingProps } from '@/features/ui/Sorting/Sorting'
import { useGetUserInfo, useGetPoolUsers } from '@/helpers'

import styles from './ManageEntriesPoolEntriesSquares.module.scss'

type SortType = {
  name: 'name' | 'date-joined' | 'pick-made' | null
  sort: SortingProps['active']
}

export function ManageEntriesPoolEntriesSquares() {
  const [input, setInput] = useState('')
  const [members, setMembers] = useState<string[]>([])
  const [sort, setSort] = useState<SortType>({ name: null, sort: null })

  const {
    query: { poolId },
  } = useRouter()

  const { poolUsersData } = useGetPoolUsers(Number(poolId))
  const { userInfoData } = useGetUserInfo()

  const membersOptions = useMemo(() => {
    if (!poolUsersData) return []

    return poolUsersData.map((e) => ({
      title: e.username,
      name: String(e.id),
    }))
  }, [poolUsersData])

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

  const filteredEntries = filtration(poolUsersData, input, members)

  const renderEntriesData = !sort.sort
    ? filteredEntries
    : [...filteredEntries].sort(sorting)

  function sorting(a: User, b: User) {
    if (sort.name === 'name') {
      if (sort.sort === 'top') {
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

    if (sort.name === 'pick-made') {
      return sort.sort === 'top'
        ? a.entries_count - b.pick_entries_count
        : b.entries_count - a.pick_entries_count
    }

    return 0
  }

  return (
    <div className={styles.wrapper}>
      {renderEntriesData ? (
        <>
          <div className={styles.head}>
            <Input
              value={input}
              onChange={setInput}
              type="search"
              placeholder="Search"
            />

            <SelectWithCheckboxes
              options={membersOptions}
              value={members}
              onChange={setMembers}
              className={classNames(styles.membersSelect)}
              dropdownClassName={styles.membersSelectDropdown}
              placeholder="All members"
            />
          </div>
          <div className={styles.table}>
            <div className={classNames(styles.tableHead, styles.tableRow)}>
              <p></p>

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
                className={classNames(styles.sortableItem, styles.indented, {
                  [styles.sortableItemActive]: sort.name === 'date-joined',
                })}
                onClick={() => handlingSortMemoized('date-joined')}
              >
                <p>Date Joined</p>
                <Sorting
                  active={sort.name === 'date-joined' ? sort.sort : null}
                />
              </div>

              <div
                className={classNames(styles.sortableItem, styles.indented, {
                  [styles.sortableItemActive]: sort.name === 'pick-made',
                })}
                onClick={() => handlingSortMemoized('pick-made')}
              >
                <p>Squares Picked</p>
                <Sorting
                  active={sort.name === 'pick-made' ? sort.sort : null}
                />
              </div>

              <p className={styles.indented}>Contacts</p>
              <p></p>
            </div>

            <div className={styles.tableBody}>
              {!!renderEntriesData.length
                ? renderEntriesData.map((item) => {
                    const joinedData = new Date(item.joined_date)
                    const joinedDataString = `${joinedData.getDate()}/${
                      joinedData.getMonth() + 1
                    }/${joinedData.getFullYear()}`

                    return (
                      <div key={item.id} className={styles.tableRow}>
                        {userInfoData?.id === item.id ? (
                          <Star className={classNames(styles.iconFavorite)} />
                        ) : (
                          <div className={styles.shortName}>
                            {getShortName(item.username)}
                          </div>
                        )}
                        <p>{item.username}</p>
                        <p
                          className={classNames(styles.indented, styles.withBg)}
                        >
                          {joinedDataString}
                        </p>
                        <div className={styles.indented}>
                          <p
                            className={classNames({
                              [styles.nonePicks]: item.pick_entries_count === 0,
                            })}
                          >
                            {item.pick_entries_count}
                          </p>
                        </div>
                        <p
                          className={classNames(styles.indented, styles.withBg)}
                        >
                          {item.email}
                        </p>
                        <div className={styles.bell}>
                          {item.pick_entries_count !== item.entries_count && (
                            <Bell />
                          )}
                        </div>
                      </div>
                    )
                  })
                : input && (
                    <p className={styles.noSearch}>
                      No matching entries were found for &quot;{input}&quot;
                    </p>
                  )}
            </div>
          </div>
        </>
      ) : (
        <p className={styles.noData}>
          You have not created any entries.{' '}
          <Link href={routes.account.createGrid(Number(poolId))}>
            Click here
          </Link>{' '}
          to go to the &quot;Create a Grid&quot; page
        </p>
      )}
    </div>
  )
}

function filtration(data: User[], search: string, members: string[]) {
  if (!data) return []

  let newData = [...data]

  if (members.length) {
    newData = newData.filter((item) => members.includes(String(item.id)))
  }

  if (!!search.trim()) {
    newData = newData.filter(
      (item) =>
        item.username
          .trim()
          .toLowerCase()
          .includes(search.trim().toLowerCase()) ||
        item.email.trim().toLowerCase().includes(search.trim().toLowerCase()),
    )
  }

  return newData
}
