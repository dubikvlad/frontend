import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'

import { api, MembersToImport } from '@/api'
import { CopyMembersIcon } from '@/assets/icons'
import { Checkbox, Sorting } from '@/features/ui'
import type { SortingProps } from '@/features/ui/Sorting'
import { useGetMembersToImport } from '@/helpers/hooks/useGetMembersToImport'

import styles from './CopyMembers.module.scss'
import { CopyMembersModal } from './CopyMembersModal'

type SortType = {
  name: 'id' | 'name' | 'type' | 'active-members' | null
  sort: SortingProps['active']
}

export function CopyMembers({
  search,
  hidePools,
}: {
  search: string
  hidePools: boolean
}) {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [countMembers, setCountMembers] = useState(0)
  const [isChecked, setIsChecked] = useState<number | false>(false)
  const {
    query: { poolId },
  } = useRouter()
  const { membersToImportData } = useGetMembersToImport(Number(poolId))

  async function sendData() {
    const res =
      isChecked &&
      (await api.pools.importMembersToPool(Number(poolId), {
        pool_id: isChecked,
      }))

    if (res && res.data) {
      setCountMembers(res.data.count_imported)
      setModalIsOpen(true)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        {membersToImportData && (
          <CopyMembersTable
            data={membersToImportData}
            search={search}
            hidePools={hidePools}
            setIsChecked={setIsChecked}
            isChecked={isChecked}
          />
        )}
      </div>
      <div className={styles.infoWrapper}>
        <div className={styles.info}>
          <div className={styles.titleWrapper}>
            <CopyMembersIcon />
            <h3 className={styles.title}>Copy Members</h3>
          </div>
          <p className={styles.infoText}>
            Select one of your other pools that you‘d like to copy members from.
            Members who already have an existing account in this pool with a
            matching email address will not be copied. Inactive members will not
            be copied. After copying your members, the new membership will
            automatically appear on their Memberships page when they login,
            however they will need to confirm their participation the first time
            they log in before they are considered a participating entry.
          </p>
        </div>
        <div className={styles.buttonWrapper}>
          <button
            className={classNames('button button-blue ', styles.button, {
              ['disabled']: !isChecked,
            })}
            onClick={sendData}
          >
            copy members
          </button>
        </div>
      </div>
      <CopyMembersModal
        modalIsOpen={modalIsOpen}
        closeModal={() => setModalIsOpen(false)}
        countMembers={countMembers}
        poolId={Number(isChecked)}
      />
    </div>
  )
}

function CopyMembersTable({
  data,
  search,
  hidePools,
  isChecked,
  setIsChecked,
}: {
  isChecked: false | number
  data: MembersToImport[]
  search: string
  hidePools: boolean
  setIsChecked: (val: number | false) => void
}) {
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

  const filteredData = filtration(data, search, hidePools)

  const sortedData = Object.values(filteredData).sort(sorting)

  function filtration(
    data: MembersToImport[],
    search: string,
    hidePools: boolean,
  ) {
    if (!data) return []

    if (!!search.trim()) {
      data = data.filter(
        (item) =>
          item.name
            .trim()
            .toLowerCase()
            .includes(search.trim().toLowerCase()) ||
          item.title.trim().toLowerCase().includes(search.trim().toLowerCase()),
      )
    }

    if (hidePools) {
      data = data.filter((item) => {
        item.active_count !== 0
      })
    }

    return data
  }

  function sorting(a: MembersToImport, b: MembersToImport) {
    if (sort.name === 'id') {
      if (sort.sort === 'bottom') {
        if (a.pool_id > b.pool_id) return 1
        if (a.pool_id < b.pool_id) return -1
        return 0
      } else {
        if (a.pool_id > b.pool_id) return -1
        if (a.pool_id < b.pool_id) return 1
        return 0
      }
    }

    if (sort.name === 'name') {
      if (sort.sort === 'bottom') {
        if (a.title > b.title) return 1
        if (a.title < b.title) return -1
        return 0
      } else {
        if (a.title > b.title) return -1
        if (a.title < b.title) return 1
        return 0
      }
    }

    if (sort.name === 'type') {
      if (sort.sort === 'bottom') {
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
      } else {
        if (a.name > b.name) return -1
        if (a.name < b.name) return 1
        return 0
      }
    }

    if (sort.name === 'active-members') {
      if (sort.sort === 'bottom') {
        if (a.active_count > b.active_count) return 1
        if (a.active_count < b.active_count) return -1
        return 0
      } else {
        if (a.active_count > b.active_count) return -1
        if (a.active_count < b.active_count) return 1
        return 0
      }
    }

    return 0
  }

  return (
    <>
      <div className={styles.table}>
        {!!data.length ? (
          !!sortedData.length ? (
            <>
              <div className={styles.tableHeadWrap}>
                <div className={styles.tableRow}>
                  <div className={styles.rowItem}>Select</div>
                  <div className={styles.rowItem}>
                    <div
                      className={classNames(styles.sortWrapper, {
                        [styles.active]: sort.name === 'id',
                      })}
                      onClick={() => handlingSortMemoized('id')}
                    >
                      Pool ID
                      <Sorting active={sort.name === 'id' ? sort.sort : null} />
                    </div>
                  </div>
                  <div className={styles.rowItem}>
                    <div
                      className={classNames(styles.sortWrapper, {
                        [styles.active]: sort.name === 'name',
                      })}
                      onClick={() => handlingSortMemoized('name')}
                    >
                      Pool Name
                      <Sorting
                        active={sort.name === 'name' ? sort.sort : null}
                      />
                    </div>
                  </div>
                  <div className={styles.rowItem}>
                    <div
                      className={classNames(styles.sortWrapper, {
                        [styles.active]: sort.name === 'type',
                      })}
                      onClick={() => handlingSortMemoized('type')}
                    >
                      Pool Type
                      <Sorting
                        active={sort.name === 'type' ? sort.sort : null}
                      />
                    </div>
                  </div>
                  <div className={styles.rowItem}>
                    <div
                      className={classNames(styles.sortWrapper, {
                        [styles.active]: sort.name === 'active-members',
                      })}
                      onClick={() => handlingSortMemoized('active-members')}
                    >
                      Active Member Count
                      <Sorting
                        active={
                          sort.name === 'active-members' ? sort.sort : null
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.tableBodyWrap}>
                {sortedData.length &&
                  sortedData.map((item) => (
                    <div
                      className={classNames(styles.tableRow, styles.clickable, {
                        [styles.disabled]: item.active_count === 0,
                      })}
                      key={item.pool_id}
                      onClick={() =>
                        item.active_count !== 0 &&
                        (item.pool_id === isChecked
                          ? setIsChecked(false)
                          : setIsChecked(item.pool_id))
                      }
                    >
                      <div className={styles.rowItem}>
                        <Checkbox
                          value={item.pool_id === isChecked}
                          onChange={() => null}
                          disabled={item.active_count === 0}
                        />
                      </div>
                      <div className={styles.rowItem}>{item.pool_id}</div>
                      <div className={styles.rowItem}>{item.name}</div>
                      <div className={styles.rowItem}>{item.title}</div>
                      <div className={styles.rowItem}>{item.active_count}</div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className={styles.noData}>
              <p>
                <strong>No matching pools</strong> were found by the search
                results
              </p>
            </div>
          )
        ) : (
          <div className={styles.noData}>
            <p>
              There are <strong>no appropriate pools</strong> to copy the
              members from
            </p>
          </div>
        )}
      </div>
    </>
  )
}
