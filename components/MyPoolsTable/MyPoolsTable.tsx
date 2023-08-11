import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { Dispatch, SetStateAction, useRef, useState } from 'react'

import type { PoolData } from '@/api'
import { FiltersSm, Members, Search } from '@/assets/icons'
import type { DashboardPageTabs } from '@/features/pages/DashboardPage'
import { Input, Select } from '@/features/ui'
import { useAdaptiveBreakpoints } from '@/helpers'

import styles from './MyPoolsTable.module.scss'

const DashboardTableRowLazy = dynamic(
  () =>
    import('@/features/components/DashboardTableRow').then(
      (mod) => mod.DashboardTableRow,
    ),
  { loading: () => <p>Loading...</p> },
)

const DashboardNoDataLazy = dynamic(
  () =>
    import('@/features/components/DashboardNoData').then(
      (mod) => mod.DashboardNoData,
    ),
  { loading: () => <p>Loading...</p> },
)

const options = [
  { title: 'Sort by date', name: 'sort_by_date' },
  { title: 'Sort by name', name: 'sort_by_name' },
]

function filtration(data: PoolData[], search: string) {
  if (!data) return []
  let newData = data

  if (!!search.trim()) {
    newData = data.filter(
      (item) =>
        item.name.trim().toLowerCase().includes(search.trim().toLowerCase()) ||
        item.pool_type.title
          .trim()
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
  }

  return newData
}

type MyPoolsTable = {
  poolsData: PoolData[]
  activeTab: DashboardPageTabs
  poolsMutate: () => void
  setActiveTab: Dispatch<SetStateAction<DashboardPageTabs>>
}

export function MyPoolsTable({
  poolsData,
  activeTab,
  poolsMutate,
  setActiveTab,
}: MyPoolsTable) {
  const [inputSearch, setInputSearch] = useState<string>('')
  const [select, setSelect] = useState<string>(options[0].name)
  const [sortFromFirst, setSortSortFromFirst] = useState(true)

  const { breakpoint } = useAdaptiveBreakpoints(['sm', 'md'])

  function checkSort(value: string) {
    if (value === select) {
      setSortSortFromFirst(!sortFromFirst)
    } else {
      setSortSortFromFirst(true)
      setSelect(value)
    }
  }

  const filteredData: PoolData[] | undefined = filtration(
    poolsData,
    inputSearch,
  )

  const sortedData = filteredData ? [...filteredData].sort(sorting) : []

  function sorting(a: PoolData, b: PoolData) {
    const aId = a.id
    const bId = b.id

    const aName = a.name.toLocaleLowerCase()
    const bName = b.name.toLocaleLowerCase()

    if (select === 'sort_by_date') {
      if (sortFromFirst) {
        if (aId < bId) return 1
        if (aId > bId) return -1
      } else {
        if (aId > bId) return 1
        if (aId < bId) return -1
      }
    }

    if (select === 'sort_by_name') {
      if (sortFromFirst) {
        if (aName < bName) return 1
        if (aName > bName) return -1
        return 0
      } else {
        if (aName > bName) return 1
        if (aName < bName) return -1
        return 0
      }
    }
    return 0
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        {sortedData.length ? (
          <InputAndSelect
            select={select}
            setInputSearch={setInputSearch}
            inputSearch={inputSearch}
            checkSort={checkSort}
            breakpoint={breakpoint}
          />
        ) : (
          <></>
        )}

        {sortedData.length ? (
          <>
            {breakpoint !== 'sm' ? (
              <div
                className={classNames(styles.tableRow, styles.head, {
                  [styles.anotherGrid]: ['archived', 'join a pool'].includes(
                    activeTab,
                  ),
                })}
              >
                <div className={styles.name}>
                  <div></div>
                  <div className={styles.headTitle}>Pool Name</div>
                </div>
                <div className={classNames(styles.headTitle, styles.members)}>
                  <Members className={styles.membersIcon} />
                  Entries
                </div>
                <div className={styles.headTitle}>Start</div>
                <div className={styles.headTitle}>Commissioner</div>
                <div></div>
              </div>
            ) : (
              <></>
            )}

            {sortedData.map((pool, i) => {
              return (
                <DashboardTableRowLazy
                  key={i}
                  pool={pool}
                  poolsMutate={poolsMutate}
                  activeTab={activeTab}
                  breakpoint={breakpoint}
                />
              )
            })}
          </>
        ) : (
          <DashboardNoDataLazy
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </>
  )
}

function InputAndSelect({
  inputSearch,
  setInputSearch,
  select,
  checkSort,
  breakpoint,
}: {
  inputSearch: string
  setInputSearch: Dispatch<SetStateAction<string>>
  select: string
  checkSort: (value: string) => void
  breakpoint: 'sm' | 'md' | 'source' | null
}) {
  const [toggleFilter, setToggleFilter] = useState<boolean>(true)

  const filtersSmRef = useRef<HTMLDivElement>(null)

  function toggle() {
    if (filtersSmRef.current) {
      const first = filtersSmRef.current.firstElementChild as HTMLDivElement
      const second = filtersSmRef.current.lastElementChild as HTMLDivElement

      if (toggleFilter) {
        first.style.width = '51px'
        second.style.width = '100%'
      } else {
        first.style.width = '100%'
        second.style.width = '51px'
      }
    }

    setTimeout(() => {
      setToggleFilter((p) => !p)
    }, 500)
  }

  if (!breakpoint) return <></>

  if (breakpoint === 'sm') {
    return (
      <div ref={filtersSmRef} className={styles.filtersSm}>
        {toggleFilter ? (
          <>
            <div className={styles.inputWrap}>
              <Input
                type="search"
                value={inputSearch}
                onChange={setInputSearch}
                placeholder="Search My Pools"
              />
            </div>

            <div className={styles.toggleBtn} onClick={toggle}>
              <FiltersSm />
            </div>
          </>
        ) : (
          <>
            <div className={styles.toggleBtn} onClick={toggle}>
              <Search pathStroke="var(--text-color)" width={18} height={18} />
            </div>

            <div className={styles.selectWrapper}>
              <Select value={select} onChange={checkSort} options={options} />
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={styles.filters}>
      <Input
        type="search"
        value={inputSearch}
        onChange={setInputSearch}
        placeholder="Search My Pools"
      />

      <div className={styles.selectWrapper}>
        <Select value={select} onChange={checkSort} options={options} />
      </div>
    </div>
  )
}
