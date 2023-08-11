import classNames from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { CSSProperties, useState } from 'react'

import {
  BracketForecasts,
  BracketPlayoffEntryItem,
  Pool,
  UserInfoResponseData,
} from '@/api'
import {
  defaultEntryColor,
  generateParticipantImagePath,
  getShortName,
  routes,
  tournamentName,
} from '@/config/constants'
import { CreateEntryBlock } from '@/features/components'
import { usePool, useGetPoolEntries, useGetUserInfo } from '@/helpers'

import styles from './BracketPickByMembers.module.scss'

const FilterByEntryAndMembersAndPastWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndPastWeeks'),
  { loading: () => <p>Loading...</p> },
)

const BracketNFLPickByMembersTreeLazy = dynamic(
  () => import('@/features/components/BracketNFLPickByMembersTree'),
  { loading: () => <p>Loading...</p> },
)

export function BracketPickByMembers() {
  const {
    query: { poolId },
  } = useRouter()

  const { userInfoData } = useGetUserInfo()
  const { poolData } = usePool<'bracket'>(poolId ? Number(poolId) : undefined)

  const { poolEntriesData, poolEntriesIsLoading } =
    useGetPoolEntries<'bracket'>({
      poolId: poolData?.id,
    })

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])

  const [isCreateEntryShow, setIsCreateEntryShow] = useState(false)

  if (!poolData || !userInfoData) return null

  const isCommissioner = userInfoData.id === poolData.user_id

  function filterData() {
    let data = [...poolEntriesData]

    if (!!search.trim()) {
      data = data.filter((entry) =>
        entry.name.trim().toLowerCase().includes(search.trim().toLowerCase()),
      )
    }

    if (members.length) {
      data = data.filter((entry) => members.includes(String(entry.user_id)))
    }

    return data
  }

  const entriesData = filterData()

  const isTournamentNotNBA = poolData.tournament.name !== tournamentName.NBA

  return (
    <>
      <FilterByEntryAndMembersAndPastWeeksLazy
        poolData={poolData}
        search={search}
        setSearch={setSearch}
        members={members}
        setMembers={setMembers}
        isDisabled={!poolEntriesData.length}
      />

      <CreateEntryBlock
        isOpen={isCreateEntryShow}
        setIsOpen={setIsCreateEntryShow}
        wrapperClassName={styles.bracketCreateEntryBlock}
        actionAfterEntryCreation={() => setIsCreateEntryShow(false)}
      />

      <div className={styles.entriesWrapper}>
        {poolEntriesData.length ? (
          entriesData.length ? (
            entriesData.map((entry) => (
              <EntryItem
                key={entry.id}
                entry={entry}
                isCommissioner={isCommissioner}
                userInfoData={userInfoData}
                isTournamentNotNBA={isTournamentNotNBA}
                poolData={poolData}
              />
            ))
          ) : (
            <p className={styles.noEntries}>
              No matching entries were found for your request
            </p>
          )
        ) : (
          !poolEntriesIsLoading &&
          !isCreateEntryShow && (
            <p className={styles.noEntries}>
              There are no entries in the current bracket.{' '}
              <span onClick={() => setIsCreateEntryShow(true)}>
                Create your first entry
              </span>{' '}
              for a bracket
            </p>
          )
        )}
      </div>
    </>
  )
}

type EntryItemProps = {
  entry: BracketPlayoffEntryItem
  isCommissioner: boolean
  userInfoData: UserInfoResponseData
  isTournamentNotNBA: boolean
  poolData: Pool<'bracket'>
}

function EntryItem({
  entry,
  isCommissioner = false,
  userInfoData,
  isTournamentNotNBA = false,
  poolData,
}: EntryItemProps) {
  const [isFull, setIsFull] = useState(false)
  const [isShowTreePick, setIsShowTreePick] = useState<boolean>(false)

  const makeYourPicksLink = routes.account.makePick.index(entry.pool_id, {
    entry_id: entry.id,
  })

  function getStagesObj(): [string, BracketForecasts[]][] {
    const obj = entry.bracket_forecasts.reduce<{
      [key: string]: BracketForecasts[]
    }>((acc, item) => {
      if (!(item.stage in acc)) acc[item.stage] = []
      acc[item.stage].push(item)
      return acc
    }, {})

    const sortedObj = Object.entries(obj).sort((a, b) => {
      if (a[0] === 'PLAY_OFF_STAGE_FINAL') return 0
      if (a[0] > b[0]) return -1
      if (a[0] < b[0]) return 1
      return 0
    })

    return sortedObj.map(([key, item]) => {
      if (key === 'PLAY_OFF_STAGE_1_8') return ['Conf. Quarters', item]
      if (key === 'PLAY_OFF_STAGE_1_4') return ['Conf. Semifinals', item]
      if (key === 'PLAY_OFF_STAGE_1_2') return ['Conf. Finals', item]
      if (key === 'PLAY_OFF_STAGE_FINAL') return ['Final', item]
      return [key, item]
    })
  }

  const stagesObj = getStagesObj()

  const isTournamentNameNFL: boolean =
    poolData.tournament.name === tournamentName.NFL

  return (
    <div
      className={classNames(styles.entryBody, {
        [styles.entryBodyNoPick]: !stagesObj.length,
        [styles.action]: entry.bracket_forecasts.length,
      })}
      style={
        {
          '--entry-body-color': entry.color ?? defaultEntryColor,
        } as CSSProperties
      }
      onClick={() =>
        isTournamentNameNFL && entry.bracket_forecasts.length
          ? setIsShowTreePick((prev) => !prev)
          : null
      }
    >
      <div className={styles.entryNameWrapper}>
        <p className={styles.entryNameTitle}>Entry Name</p>

        <div className={styles.entryName}>
          <div>
            <p>{getShortName(entry.name)}</p>
          </div>
          <p>{entry.name}</p>
        </div>
      </div>

      {stagesObj.length ? (
        <div
          className={classNames(styles.stagesWrapper, {
            [styles.stagesWrapperHide]: isFull,
          })}
          onClick={() => isTournamentNotNBA && setIsFull((prev) => !prev)}
        >
          {stagesObj.map(([key, item]) => {
            return (
              <div key={key} className={styles.forecastsWrapper}>
                <p>{key}</p>

                <div className={styles.forecastsContainer}>
                  {item.map((forecast) => {
                    const imgSrc = generateParticipantImagePath(
                      forecast.participant.external_id,
                    )

                    return (
                      <div key={forecast.id}>
                        {!!imgSrc && (
                          <Image
                            src={imgSrc}
                            width={30}
                            height={30}
                            alt={forecast.participant.name}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div
                  className={classNames(styles.sides, {
                    [styles.sidesFinal]: key === 'Final',
                  })}
                >
                  {key === 'Final' ? (
                    <div className={styles.champ}>
                      <p>Champ</p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.western}>
                        <p>Western</p>
                      </div>

                      <div className={styles.eastern}>
                        <p>Eastern</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}

          <div className={styles.tiebreakWrapper}>
            <p>Tiebreak</p>
            <p className={styles.tiebreakScore}>
              {entry.playoff_tiebreaker.score}
            </p>
          </div>

          {isTournamentNotNBA && isFull && (
            <div className={styles.fullWrapper}></div>
          )}

          {/* {(isCommissioner || userInfoData.id === entry.user_id) && (
            <Link
              href={makeYourPicksLink}
              className={styles.entryBodyLink}
            ></Link>
          )} */}
        </div>
      ) : (
        <div className={styles.noPickWrapper}>
          <p>
            No picks are selected for this entry
            {(isCommissioner || userInfoData.id === entry.user_id) && (
              <>
                . <Link href={makeYourPicksLink}>Make your first pick</Link> for
                this entry
              </>
            )}
          </p>
        </div>
      )}

      {isShowTreePick ? (
        <>
          <div></div>
          <BracketNFLPickByMembersTreeLazy
            poolData={poolData}
            currentEntry={entry}
          />
        </>
      ) : null}
    </div>
  )
}
