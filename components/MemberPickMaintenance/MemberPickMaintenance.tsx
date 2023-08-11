import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import {
  BracketPlayoffEntryItem,
  EntriesItem,
  EntriesTypes,
  GolfPickXEntriesItem,
  Pool,
  PoolTypes,
  SurvivorEntriesItem,
  UserForManagementItem,
} from '@/api'
import { createEntry, deleteEntry, renameEntry } from '@/config/constants'
import {
  useGetPoolEntries,
  useMessage,
  usePool,
  useUsersForManagement,
} from '@/helpers'

import styles from './MemberPickMaintenance.module.scss'

const FilterByEntryAndMembersAndPastWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndPastWeeks'),
  { loading: () => <p>Loading...</p> },
)

const MemberPickMaintenanceMembersListLazy = dynamic(
  () =>
    import('@/features/components/MemberPickMaintenanceMembersList').then(
      (mod) => mod.MemberPickMaintenanceMembersList,
    ),
  { loading: () => <p>Loading...</p> },
)

// pool types
const PickemMemberPickMaintenanceEntriesListLazy = dynamic(
  () =>
    import(
      '@/features/components/MemberPickMaintenance/PickemMemberPickMaintenanceEntriesList'
    ).then((mod) => mod.PickemMemberPickMaintenanceEntriesList),
  { loading: () => <p>Loading...</p> },
)

const SurvivorMemberPickMaintenanceEntriesListLazy = dynamic(
  () =>
    import(
      '@/features/components/MemberPickMaintenance/SurvivorMemberPickMaintenanceEntriesList'
    ).then((mod) => mod.SurvivorMemberPickMaintenanceEntriesList),
  { loading: () => <p>Loading...</p> },
)

const BracketMemberPickMaintenanceEntriesListLazy = dynamic(
  () =>
    import(
      '@/features/components/MemberPickMaintenance/BracketMemberPickMaintenanceEntriesList'
    ).then((mod) => mod.BracketMemberPickMaintenanceEntriesList),
  { loading: () => <p>Loading...</p> },
)

const GolfPickXMemberPickMaintenanceEntriesListLazy = dynamic(
  () =>
    import(
      '@/features/components/MemberPickMaintenance/GolfPickXMemberPickMaintenanceEntriesList'
    ).then((mod) => mod.GolfPickXMemberPickMaintenanceEntriesList),
  { loading: () => <p>Loading...</p> },
)

type PoolEntriesType = EntriesTypes[keyof EntriesTypes][number][]

export function MemberPickMaintenance() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<PoolTypes>(Number(poolId))
  const { usersForManagementData, usersForManagementMutate } =
    useUsersForManagement(Number(poolId))

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])

  // переменная нужна для фильтрации энтрисов, которые по названию не подходят
  // к поисковому тексту
  // возвращает массив пользователей, у который список энтрисов не пустой
  const filteredUsersForManagementData = search.trim()
    ? usersForManagementData
        .reduce<UserForManagementItem[]>((acc, item) => {
          const copyItem: UserForManagementItem = Object.assign({}, item)
          copyItem.entries = []

          copyItem.entries = item.entries.filter(
            (entry) =>
              !!entry.name.toLowerCase().includes(search.trim().toLowerCase()),
          )
          acc.push(copyItem)
          return acc
        }, [])
        .filter((item) => !!item.entries.length)
    : usersForManagementData

  const [selectedWeek, setSelectedWeek] = useState<string>('')

  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)

  const [golfTournamentId, setGolfTournamentId] = useState<string>('')

  function getPoolEntriesPoolId() {
    if (!selectedMemberId || !poolId || !poolData) return

    if (poolData.type === 'golf_pick_x') {
      if (
        (poolData as Pool<'golf_pick_x'>).pick_pool.pick_frequency === 'weekly'
      ) {
        return golfTournamentId ? +poolId : undefined
      }

      return +poolId
    } else {
      return +poolId
    }
  }

  const { poolEntriesData, poolEntriesMutate, poolEntriesIsLoading } =
    useGetPoolEntries<PoolTypes>({
      poolId: getPoolEntriesPoolId(),
      weekNumber: selectedWeek ? Number(selectedWeek) : undefined,
      userId: selectedMemberId ? Number(selectedMemberId) : undefined,
      golf_tournament_id: golfTournamentId ? +golfTournamentId : undefined,
    })

  const filteredPoolEntriesData = search.trim()
    ? (poolEntriesData as PoolEntriesType).filter((item) =>
        item.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : poolEntriesData

  const [createEntryIsLoading, setCreateEntryIsLoading] = useState(false)

  const [error, setError] = useMessage()

  if (!poolData) return null

  const deleteEntryFunc = (entryId: number) =>
    deleteEntry({
      poolId: poolData.id,
      entryId,
      mutateArray: [poolEntriesMutate, usersForManagementMutate],
    })

  const renameEntryFunc = (entryId: number, newName: string) =>
    renameEntry({
      poolId: poolData.id,
      entryId,
      newName,
      mutateArray: [poolEntriesMutate],
    })

  const selectedUser = usersForManagementData.find(
    (item) => item.id === selectedMemberId,
  )

  const createEntryFunc = () =>
    createEntry({
      poolData,
      userData: selectedUser,
      poolEntriesData,
      setCreateEntryIsLoading,
      mutateArray: [poolEntriesMutate, usersForManagementMutate],
      setError,
      createEntryIsLoading,
    })

  const poolType = poolData.type

  return (
    <div className={styles.wrapper}>
      <FilterByEntryAndMembersAndPastWeeksLazy
        poolData={poolData}
        search={search}
        setSearch={setSearch}
        members={members}
        setMembers={setMembers}
        week={selectedWeek}
        setWeek={poolType === 'survivor' ? undefined : setSelectedWeek}
        isAllowComingWeeks
        golfTournamentId={golfTournamentId}
        setGolfTournamentId={setGolfTournamentId}
      />

      <div className={styles.membersAndEntriesWrapper}>
        <MemberPickMaintenanceMembersListLazy
          usersForManagementData={filteredUsersForManagementData}
          members={members}
          selectedMemberId={selectedMemberId}
          setSelectedMemberId={setSelectedMemberId}
        />

        <div>
          {!!error && (
            <div
              className={classNames('alert alert-danger', styles.alertDanger)}
            >
              {error}
            </div>
          )}

          {poolType === 'pick_em' && (
            <PickemMemberPickMaintenanceEntriesListLazy
              poolEntriesData={filteredPoolEntriesData as EntriesItem[]}
              renameEntry={renameEntryFunc}
              deleteEntry={deleteEntryFunc}
              createNewEntry={createEntryFunc}
              selectedWeek={selectedWeek}
              selectedMemberId={selectedMemberId}
              createEntryIsLoading={createEntryIsLoading}
              search={search}
            />
          )}

          {poolType === 'survivor' && (
            <SurvivorMemberPickMaintenanceEntriesListLazy
              poolEntriesData={filteredPoolEntriesData as SurvivorEntriesItem[]}
              renameEntry={renameEntryFunc}
              deleteEntry={deleteEntryFunc}
              createNewEntry={createEntryFunc}
              startWeek={(poolData as Pool<'survivor'>).pick_pool.start_week}
              selectedMemberId={selectedMemberId}
              createEntryIsLoading={createEntryIsLoading}
              poolData={poolData as Pool<'survivor'>}
              search={search}
            />
          )}

          {poolType === 'bracket' && (
            <BracketMemberPickMaintenanceEntriesListLazy
              poolEntriesData={
                filteredPoolEntriesData as BracketPlayoffEntryItem[]
              }
              renameEntry={renameEntryFunc}
              deleteEntry={deleteEntryFunc}
              createNewEntry={createEntryFunc}
              selectedMemberId={selectedMemberId}
              createEntryIsLoading={createEntryIsLoading}
              search={search}
            />
          )}

          {poolType === 'golf_pick_x' && (
            <GolfPickXMemberPickMaintenanceEntriesListLazy
              poolEntriesData={
                filteredPoolEntriesData as GolfPickXEntriesItem[]
              }
              renameEntry={renameEntryFunc}
              deleteEntry={deleteEntryFunc}
              createNewEntry={createEntryFunc}
              selectedMemberId={selectedMemberId}
              createEntryIsLoading={createEntryIsLoading}
              search={search}
              tournamentId={golfTournamentId}
              poolEntriesIsLoading={poolEntriesIsLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
