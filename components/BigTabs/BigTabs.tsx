import classNames from 'classnames'
import { Dispatch, SetStateAction } from 'react'

import styles from './BigTabs.module.scss'

type PlayoffOverviewTabsType<T> = {
  tabs: { title: string; value: T }[]
  activeTab: T
  setActiveTab: Dispatch<SetStateAction<T>>
  totalTab?: { title: string; value: T }
  onClickAddFunction?: () => void
}

export function BigTabs<T = string>({
  tabs,
  activeTab,
  setActiveTab,
  totalTab = undefined,
  onClickAddFunction,
}: PlayoffOverviewTabsType<T>) {
  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.total]: totalTab,
      })}
    >
      {totalTab && (
        <>
          <div
            className={classNames(styles.tab, {
              [styles.active]: activeTab === totalTab.value,
            })}
            onClick={() => setActiveTab(totalTab.value)}
          >
            {totalTab.title}
          </div>
          <div className={styles.separator}></div>
        </>
      )}
      <div
        className={classNames(styles.tabs, {
          [styles.lefty]: totalTab,
        })}
      >
        {tabs.map((tab) => (
          <div
            key={tab.value as string}
            className={classNames(styles.tab, {
              [styles.active]: activeTab === tab.value,
            })}
            onClick={() => {
              setActiveTab(tab.value)
              onClickAddFunction && onClickAddFunction()
            }}
          >
            {tab.title}
          </div>
        ))}
      </div>
    </div>
  )
}
