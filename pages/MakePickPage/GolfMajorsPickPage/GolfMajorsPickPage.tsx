import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

import type { GolfMajorsEntriesItem, Pool } from '@/api'
import { dateFormattingEvent } from '@/config/constants'
import { UserAndEntrySelects } from '@/features/components'
import { SelectWithSearch } from '@/features/ui/SelectWithSearch'
import { useGetGolfTournaments, useGetPoolEntries } from '@/helpers'

import styles from './GolfMajorsPickPage.module.scss'

const GolfMajorsTiersPicksLazy = dynamic(
  () =>
    import('@/features/components/GolfMajorsTiersPick').then(
      (m) => m.GolfMajorsTiersPick,
    ),
  {
    loading: () => <div> Loading...</div>,
  },
)

const GolfMajorsSalaryPicksLazy = dynamic(
  () =>
    import('@/features/components/GolfMajorsSalaryPick').then(
      (m) => m.GolfMajorsSalaryPick,
    ),
  {
    loading: () => <div> Loading...</div>,
  },
)

const picksComponentByType = {
  tiered: GolfMajorsTiersPicksLazy,
  salary_cap: GolfMajorsSalaryPicksLazy,
}

export function GolfMajorsPickPage({
  poolData,
}: {
  poolData: Pool<'golf_majors'>
}) {
  const router = useRouter()

  const {
    query: { isMaintenance, tournament_id },
  } = router

  const [selectedEntry, setSelectedEntry] =
    useState<GolfMajorsEntriesItem | null>(null)

  const [isEditMode, setIsEditMode] = useState(false)

  const [tournamentId, setTournamentId] = useState(() =>
    isMaintenance && tournament_id && poolData.is_commissioner
      ? Number(tournament_id)
      : poolData.pick_pool.next_golf_tournament.id,
  )

  const {
    poolEntriesData: entries,
    poolEntriesMutate: mutateEntries,
    poolEntriesIsLoading: entriesLoading,
  } = useGetPoolEntries<'golf_majors'>({
    poolId: poolData.id,
    golf_tournament_id: tournamentId,
  })

  useEffect(() => {
    if (tournamentId.toString() !== tournament_id && isEditMode) {
      router.replace({
        query: { ...router.query, tournament_id: tournamentId.toString() },
      })
    }
  }, [isEditMode, router, tournamentId, tournament_id])

  const PickComponent = picksComponentByType[poolData.pick_pool.picksheet_type]

  if (!entries) return null

  if (!entries && entriesLoading) return <p>Loading...</p>

  return (
    <div>
      <div className={styles.poolHead}>
        <h1>Make a pick</h1>

        <div>
          Select one player from each Tier to make up your roster then click the
          ‘Submit Roster’ button. The pick deadline is the first tee time
          Thursday morning
        </div>
      </div>
      <TournamentSelect
        golfTournamentId={tournamentId}
        isEditMode={isEditMode}
        poolData={poolData}
        setGolfTournamentId={setTournamentId}
      />

      <div className={styles.selectContainer}>
        <UserAndEntrySelects
          poolData={poolData}
          entriesData={entries}
          mutateEntries={mutateEntries}
          setSelectedEntry={setSelectedEntry}
          setIsEditMode={setIsEditMode}
        />
      </div>

      <div>
        {PickComponent ? (
          <PickComponent
            poolData={poolData}
            entry={selectedEntry}
            isMaintenance={isEditMode}
            updateEntries={mutateEntries}
            tournamentId={tournamentId}
            entriesLoading={entriesLoading}
          />
        ) : (
          <div>Error with loading pick component</div>
        )}
      </div>
    </div>
  )
}

const TournamentSelect = ({
  golfTournamentId,
  setGolfTournamentId,
  isEditMode,
  poolData,
}: {
  isEditMode: boolean
  golfTournamentId: number
  setGolfTournamentId: Dispatch<SetStateAction<number>>
  poolData: Pool<'golf_majors'>
}) => {
  const { golfAllTournaments, golfTournamentByPoolIsLoading } =
    useGetGolfTournaments({ poolId: poolData.id })

  const golfTournamentsOptions = [...golfAllTournaments]
    .filter(
      (item) =>
        new Date(
          poolData.pick_pool.next_golf_tournament.start_date,
        ).getTime() >= new Date(item.start_date).getTime(),
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

  if (!golfAllTournaments && golfTournamentByPoolIsLoading) {
    return <p>Loading...</p>
  }

  return isEditMode ? (
    <div className={styles.selectContainer}>
      <SelectWithSearch
        options={golfTournamentsOptions}
        value={golfTournamentId.toString()}
        onChange={(value) => setGolfTournamentId(Number(value))}
        placeholder="Tournament name"
        customOptionTitle={(option) => {
          const currentTournament = golfAllTournaments.find(
            (item) => item.id === +option.name,
          )

          if (!currentTournament) return option.title

          return (
            <>
              {option.title}{' '}
              <span
                className={classNames(styles.tournamentNameOptionDate, {
                  [styles.tournamentNameOptionDateCurrent]:
                    poolData.pick_pool.next_golf_tournament.id ===
                    currentTournament.id,
                })}
              >
                ({dateFormattingEvent(currentTournament.start_date)} -{' '}
                {dateFormattingEvent(currentTournament.finish_date)})
              </span>
            </>
          )
        }}
      />
    </div>
  ) : null
}
