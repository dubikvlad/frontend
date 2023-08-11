/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { AccountTabs } from '@/features/components'
import { PoolBasicSettings } from '@/features/components'
import { useGetPoolSettings } from '@/helpers'

import styles from './PoolEditPage.module.scss'

export function PoolEditPage() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolSettingsData } = useGetPoolSettings(Number(poolId))
  const [accountTabsData, setAccountTabsData] = useState<string[]>([])

  const [activeTab, setActiveTab] = useState<string>(' ')

  useEffect(() => {
    poolSettingsData &&
      !accountTabsData.length &&
      setAccountTabsData(
        Object.values(poolSettingsData).map((item) => item.title),
      )
  }, [poolSettingsData])

  useEffect(() => {
    setActiveTab(accountTabsData[0])
  }, [accountTabsData])

  return (
    <div className={styles.wrapper}>
      <h1>EDIT POOL SETTINGS</h1>
      {poolSettingsData && accountTabsData && (
        <div className={styles.tableWrapper}>
          <AccountTabs
            tabsData={accountTabsData}
            isActive={activeTab}
            setIsActive={setActiveTab}
          />
          <div>
            <PoolBasicSettings
              data={poolSettingsData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabsData={accountTabsData}
            />
          </div>
        </div>
      )}
      {}
    </div>
  )
}
