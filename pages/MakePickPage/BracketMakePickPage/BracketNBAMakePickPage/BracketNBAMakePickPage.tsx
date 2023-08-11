import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import type { BracketPlayoffEntryItem, Pool, UserResponseData } from '@/api'
import { Info } from '@/assets/icons'
import { bracketTreePageType, routes } from '@/config/constants'
import {
  BracketTournamentTreeNBA,
  UserAndEntrySelects,
} from '@/features/components'
import {
  useEventsForBracket,
  useGetPoolEntries,
  useGetUser,
  useSeriesLength,
} from '@/helpers'

import styles from './BracketNBAMakePickPage.module.scss'

export default function BracketNBAMakePickPage({
  poolData,
}: {
  poolData: Pool<'bracket'>
}) {
  const [currentEntry, setCurrentEntry] =
    useState<BracketPlayoffEntryItem | null>(null)
  const [currentUser, setCurrentUser] = useState<UserResponseData | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const {
    push,
    query: { isMaintenance },
  } = useRouter()

  const { userData } = useGetUser()

  const {
    poolEntriesData: entries,
    poolEntriesIsLoading: entriesLoading,
    poolEntriesMutate: updateEntries,
  } = useGetPoolEntries<'bracket'>({ poolId: poolData.id })

  const {
    bracketEvents: events,
    tiebreaker,
    deadline,
  } = useEventsForBracket({
    poolId: poolData.id.toString(),
    userId: currentEntry?.user_id.toString(),
  })

  const { updateForecasts } = useSeriesLength({
    poolId: poolData.id,
    entryId: currentEntry?.id || 0,
  })

  useEffect(() => {
    if (userData) {
      setCurrentUser(userData)
    }
  }, [userData])

  useEffect(() => {
    if (
      userData &&
      poolData &&
      isMaintenance &&
      userData.id !== poolData.owner.id
    ) {
      push(routes.account.makePick.index(poolData.id))
    }
  }, [isMaintenance, poolData, push, userData])

  if (entriesLoading && !entries) return <p> Loading...</p>

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>
        Make a PLAYOFF BRACKET pick <Info />
      </h1>
      <h2 className={styles.subTitle}>step 1/2 - pick teams</h2>
      <p className={styles.descriptionText}>{poolData.pool_type.description}</p>
      <UserAndEntrySelects
        entriesData={entries}
        poolData={poolData}
        setSelectedEntry={setCurrentEntry}
        mutateEntries={updateEntries}
        pickDeadline={poolData.pick_pool.pick_deadline}
        setIsEditMode={setIsEditMode}
      />
      <BracketTournamentTreeNBA
        pageType={bracketTreePageType.make_pick}
        roundsData={events?.rounds}
        poolData={poolData}
        tiebreaker={tiebreaker}
        deadline={deadline}
        currentEntry={currentEntry}
        currentUser={currentUser}
        isMaintenance={isEditMode}
        updateForecasts={updateForecasts}
      />
    </div>
  )
}
