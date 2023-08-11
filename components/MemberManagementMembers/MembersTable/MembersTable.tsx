import classNames from 'classnames'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { utils, writeFileXLSX } from 'xlsx'

import { UserForManagementItem } from '@/api'
import { Excel } from '@/assets/icons'
import { Input, Sorting } from '@/features/ui'
import { SortingProps } from '@/features/ui/Sorting/Sorting'

import { MembersTableRow } from '../MembersTableRow'

import styles from './MembersTable.module.scss'

type SortType = {
  name: 'name' | 'email' | 'joined' | 'active' | null
  sort: SortingProps['active']
}

export function MembersTable({
  data,
  setShowAllMembers,
}: {
  data: UserForManagementItem[]
  setShowAllMembers: Dispatch<SetStateAction<boolean>>
}) {
  const [sort, setSort] = useState<SortType>({ name: null, sort: null })
  const [searchVal, setSearchVal] = useState('')

  const filteredData = filtration(data, searchVal)

  const sortedData =
    sort.sort === null ? filteredData : [...filteredData].sort(sorting)

  function filtration(data: UserForManagementItem[], search: string) {
    if (!data) return []

    if (!!search.trim()) {
      data = data.filter(
        (item) =>
          item.username
            .trim()
            .toLowerCase()
            .includes(search.trim().toLowerCase()) ||
          item.email.trim().toLowerCase().includes(search.trim().toLowerCase()),
      )
    }

    return data
  }

  function sorting(a: UserForManagementItem, b: UserForManagementItem) {
    if (sort.name === 'name') {
      if (sort.sort === 'bottom') {
        b.username.toLowerCase().localeCompare(a.username.toLowerCase())
      } else {
        a.username.toLowerCase().localeCompare(b.username.toLowerCase())
      }
    }

    if (sort.name === 'email') {
      if (sort.sort === 'bottom') {
        if (a.email > b.email) return -1
        if (a.email < b.email) return 1
        return 0
      } else {
        if (a.email > b.email) return 1
        if (a.email < b.email) return -1
        return 0
      }
    }

    if (sort.name === 'joined') {
      if (sort.sort === 'bottom') {
        if (a.joined > b.joined) return -1
        if (a.joined < b.joined) return 1
        return 0
      } else {
        if (a.joined > b.joined) return 1
        if (a.joined < b.joined) return -1
        return 0
      }
    }

    if (sort.name === 'active') {
      if (sort.sort === 'bottom') {
        if (a.active) return -1
        if (!a.active) return 1
        return 0
      } else {
        if (a.active) return 1
        if (!a.active) return -1
        return 0
      }
    }

    return 0
  }

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

  function exportExcel() {
    const ws = utils.json_to_sheet(sortedData)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Data')
    writeFileXLSX(wb, 'PoolMembers.xlsx')
  }

  return (
    <>
      <div className={styles.head}>
        <div>
          <Input
            type="search"
            placeholder="Search"
            value={searchVal}
            onChange={setSearchVal}
          />
        </div>
        <div className={styles.buttons}>
          <button
            className={classNames('button button-blue-outline', styles.button)}
            onClick={() => exportExcel()}
          >
            <Excel className={styles.icon} />
            Export to Excel
          </button>

          <button
            className={classNames(
              'button button-blue-outline',
              styles.button,
              styles.buttonBig,
            )}
            onClick={() => setShowAllMembers((prev) => !prev)}
          >
            Add / Copy Members
          </button>
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <div
                className={styles.title}
                onClick={() => handlingSortMemoized('name')}
              >
                Name{' '}
                <Sorting active={sort.name === 'name' ? sort.sort : null} />
              </div>
            </th>
            <th>
              <div
                className={styles.title}
                onClick={() => handlingSortMemoized('email')}
              >
                Email
                <Sorting active={sort.name === 'email' ? sort.sort : null} />
              </div>
            </th>
            <th>
              <div
                className={styles.title}
                onClick={() => handlingSortMemoized('joined')}
              >
                Joined
                <Sorting active={sort.name === 'joined' ? sort.sort : null} />
              </div>
            </th>
            <th>
              <div
                className={styles.title}
                onClick={() => handlingSortMemoized('active')}
              >
                Active
                <Sorting active={sort.name === 'active' ? sort.sort : null} />
              </div>
            </th>
            <th>Entries</th>
            <th>Picks</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((userData, i) => (
            <MembersTableRow key={i} userData={userData} />
          ))}
        </tbody>
      </table>
    </>
  )
}
