import classNames from 'classnames'
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react'

import { Pool, PoolTypes } from '@/api'
import { dateFormattingEvent } from '@/config/constants'
import { Select2 } from '@/features/ui'
import { useGetGolfTournaments } from '@/helpers'

import styles from './GolfSelectByTournaments.module.scss'

export function GolfSelectByTournaments({
  showDataId,
  changeShowTournament,
  poolData,
  setShowTournamentTitle,
  withTabYearToDate = false,
}: {
  showDataId: string
  changeShowTournament: (id: string) => void
  poolData: Pool<PoolTypes>
  setShowTournamentTitle?: Dispatch<SetStateAction<string>>
  withTabYearToDate?: boolean
}) {
  const { golfAllTournaments, lastPastTournament } = useGetGolfTournaments({
    poolId: poolData.id,
  })

  useEffect(() => {
    if (lastPastTournament && lastPastTournament.id) {
      changeShowTournament(String(lastPastTournament.id))
    }
  }, [lastPastTournament, changeShowTournament])

  const tabsData = useMemo(() => {
    if (!golfAllTournaments.length) return []

    const pickPool = poolData.pick_pool

    if (!pickPool || !('next_golf_tournament' in pickPool)) return []

    return [...golfAllTournaments]
      .filter(
        (item) =>
          new Date(pickPool.next_golf_tournament.start_date).getTime() >=
          new Date(item.start_date).getTime(),
      )
      .sort((a, b) =>
        new Date(a.start_date).getTime() > new Date(b.start_date).getTime()
          ? -1
          : 1,
      )
      .map((item) => ({
        title: item.name,
        name: String(item.id),
        isDisabled: item.is_disabled,
      }))
  }, [golfAllTournaments, poolData])

  useEffect(() => {
    if (setShowTournamentTitle) {
      const currentTournamentTitle = tabsData.find(
        (tab) => tab.name === showDataId,
      )?.title

      if (currentTournamentTitle) {
        setShowTournamentTitle(currentTournamentTitle)
      }
    }
  }, [showDataId, setShowTournamentTitle, tabsData])

  return (
    <>
      {tabsData.length ? (
        <div
          className={classNames(styles.selectWrap, {
            [styles.withTabYearToDate]: withTabYearToDate,
          })}
        >
          <Select2
            value={showDataId}
            onChange={changeShowTournament}
            options={tabsData}
            placeholder="TOURNAMENT"
            isTitleBold
            customOptionTitle={(option) => {
              const currentTournament = golfAllTournaments.find(
                (item) => item.id === +option.name,
              )

              if (!currentTournament) return option.title

              return (
                <>
                  {option.title}{' '}
                  <span>
                    ({dateFormattingEvent(currentTournament.start_date)} -{' '}
                    {dateFormattingEvent(currentTournament.finish_date)})
                  </span>
                </>
              )
            }}
          />
        </div>
      ) : (
        <></>
      )}
    </>
  )
}
