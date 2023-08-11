import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  CSSProperties,
  useRef,
} from 'react'
import { XYCoord, useDrag, useDragLayer, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

import {
  Participant,
  PlayoffEntriesItem,
  Pool,
  PoolTypesObj,
  PowerRankingPlayoffForecastItem,
  api,
} from '@/api'
import {
  generateParticipantImagePath,
  writeErrorToState,
} from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { UserAndEntrySelects } from '@/features/components'
import { POOL_MODAL_TYPES } from '@/features/modals'
import { Input } from '@/features/ui'
import {
  useGetUser,
  useGetPoolEntries,
  useGetPlayoffTeams,
  useMessage,
} from '@/helpers'

import styles from './PowerRankingPlayoffMakePickPage.module.scss'

type DragItem = Participant & { index: number; width: number | undefined }

type PlayoffTeam = { id: number; point: number }

const emptyArr: PowerRankingPlayoffForecastItem[] = []

export function PowerRankingPlayoffMakePickPage({
  poolData,
}: {
  poolData: Pool<'playoff'>
}) {
  const {
    query: { isMaintenance, user_id },
  } = useRouter()

  const { openModal } = useOpenModal()

  const { userData } = useGetUser()

  const isEditMode =
    !!isMaintenance && Number(isMaintenance) === 1 && poolData.is_commissioner

  poolData.pick_pool.pick_deadline

  const isDeadline = isEditMode
    ? false
    : poolData.pick_pool.pick_deadline
    ? new Date(poolData.pick_pool.pick_deadline).getTime() <
      new Date().getTime()
    : true

  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    if (isEditMode && (user_id || userData) && userId === null) {
      const customUserId = user_id ?? userData?.id

      if (customUserId) setUserId(Number(customUserId))
    } else if (!isEditMode && userId === null && userData) {
      setUserId(userData.id)
    }
  }, [userData, userId, user_id, isEditMode])

  const { poolEntriesData, poolEntriesIsLoading, poolEntriesMutate } =
    useGetPoolEntries<PoolTypesObj['playoff']>({ poolId: poolData.id, userId })

  const [selectedEntry, setSelectedEntry] = useState<PlayoffEntriesItem | null>(
    null,
  )

  const playoffForecasts = selectedEntry?.playoff_forecasts ?? emptyArr

  const { playoffTeamsData, playoffTeamsTiebreakerData } = useGetPlayoffTeams(
    poolData.id,
  )

  const [playoffTeams, setPlayoffTeams] = useState<PlayoffTeam[]>([])

  useEffect(() => {
    if (!poolEntriesIsLoading) {
      if (playoffForecasts.length) {
        setPlayoffTeams(
          playoffForecasts.map((item) => ({
            id: item.participant.id,
            point: item.assign_points,
          })),
        )
      } else if (playoffTeamsData.length) {
        setPlayoffTeams(
          playoffTeamsData.map((item, i) => ({
            id: item.id,
            point: playoffTeamsData.length - i,
          })),
        )
      }
    }
  }, [playoffTeamsData, playoffForecasts, poolEntriesIsLoading])

  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  function divideIntoTwoParts(arr: PlayoffTeam[]) {
    const numberOfCutElements = Math.ceil(arr.length / 2)
    return [arr.slice(0, numberOfCutElements), arr.slice(numberOfCutElements)]
  }

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useMessage()

  const inputRef = useRef<HTMLInputElement>(null)

  const [tiebreak, setTiebreak] = useState('0')
  const [tiebreakError, setTiebreakError] = useState<undefined | string>()

  useEffect(() => {
    setTiebreak(
      selectedEntry?.playoff_tiebreaker?.score
        ? String(selectedEntry.playoff_tiebreaker.score)
        : '0',
    )
  }, [selectedEntry])

  async function setForecasts() {
    if (!playoffTeams.length || !selectedEntry) return

    try {
      if (playoffTeamsTiebreakerData) {
        if (isNaN(+tiebreak) || !tiebreak.trim() || tiebreak.trim() === '0') {
          setTiebreakError('')
          if (inputRef.current) inputRef.current.focus()
          return
        } else {
          setTiebreakError(undefined)
        }
      }

      setIsLoading(true)

      const res = await (isEditMode
        ? api.forecasts.putForecasts
        : api.forecasts.setForecasts)(poolData.id, selectedEntry.id, {
        forecasts: playoffTeams.map((item) => ({
          participant_id: item.id,
          points: item.point,
        })),
        tiebreaker: playoffTeamsTiebreakerData
          ? {
              tiebreaker_id: playoffTeamsTiebreakerData.id,
              tiebreaker_score: +tiebreak,
            }
          : undefined,
      })

      if (res.error) {
        writeErrorToState(res.error, setError)

        setIsLoading(false)
        return
      }

      await poolEntriesMutate()
      openModal({ type: POOL_MODAL_TYPES.MAKE_A_PICK_SUCCESS })
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
    }
  }

  const isWrapperDeadline =
    (isDeadline && !isEditMode && !playoffForecasts.length) ||
    !!poolEntriesIsLoading

  const isWrapperDeadlineWithForecasts =
    isDeadline && !isEditMode && !!playoffForecasts.length

  return (
    <div>
      <h1>Make a POWER RANKING PLAYOFF pick</h1>

      <p className={styles.description}>
        Rank all 14 NFL teams competing in the NFL Playoffs from strongest (14
        points) to weakest (1 point)
      </p>

      <div className={styles.filterAndDeadlineWrapper}>
        <UserAndEntrySelects
          entriesData={poolEntriesData}
          poolData={poolData}
          setSelectedEntry={setSelectedEntry}
          mutateEntries={poolEntriesMutate}
          pickDeadline={poolData.pick_pool.pick_deadline}
        />
      </div>

      {!!error && (
        <div className={classNames('alert alert-danger', styles.alertDanger)}>
          {error}
        </div>
      )}

      {!!playoffTeams.length && !!selectedEntry && (
        <>
          <div
            className={classNames(styles.playoffTeamsWrapper, {
              [styles.playoffTeamsWrapperDeadline]: isWrapperDeadline,
              [styles.playoffTeamsWrapperDeadlineWithForecasts]:
                isWrapperDeadlineWithForecasts,
            })}
          >
            {divideIntoTwoParts(playoffTeams).map((teams, i) => (
              <div key={i} className={styles.playoffTeamWrapperColumn}>
                <p>Points Assigned</p>

                <div className={styles.playoffTeamWrapper}>
                  {teams.map((playoffTeam, index) => {
                    const team = playoffTeamsData.find(
                      (team) => team.id === playoffTeam.id,
                    )

                    const teamIndex = playoffTeams.findIndex(
                      (team) => team.id === playoffTeam.id,
                    )

                    if (!team || !~teamIndex) return

                    return (
                      <PlayoffTeamItem
                        key={team.id}
                        index={teamIndex}
                        team={team}
                        point={playoffTeamsData.length / (i + 1) - index}
                        hoverIndex={hoverIndex}
                        setHoverIndex={setHoverIndex}
                        setPlayoffTeams={setPlayoffTeams}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {!!playoffTeamsTiebreakerData && (
            <div
              className={classNames(styles.tiebreakWrapper, {
                [styles.tiebreakWrapperDeadline]: isWrapperDeadline,
              })}
            >
              <p>
                Tiebreak{' '}
                <span>
                  (combined points in Pittsburg Penguins - Boston Bruins game)
                </span>
                :
              </p>

              <Input
                inputRef={inputRef}
                value={tiebreak}
                onChange={(value) => setTiebreak(value.trim() ? value : '0')}
                type="number"
                placeholder="0"
                textAlign="center"
                className={styles.tiebreakInput}
                isDisabled={isWrapperDeadline || isWrapperDeadlineWithForecasts}
                error={tiebreakError}
                isErrorSign={false}
              />
            </div>
          )}

          {!!playoffTeamsData.length &&
            (!isDeadline || !!playoffForecasts.length || isEditMode) && (
              <button
                className={classNames(
                  'button button-blue-light',
                  styles.submitButton,
                  { disabled: isLoading || (!isEditMode && isDeadline) },
                )}
                onClick={() => !isLoading && setForecasts()}
              >
                Submit
              </button>
            )}
        </>
      )}

      <CustomDragLayer />
    </div>
  )
}

function PlayoffTeamItem({
  team,
  index,
  point,
  hoverIndex,
  setHoverIndex,
  setPlayoffTeams,
}: {
  team: Participant
  index: number
  point: number
  hoverIndex: number | null
  setHoverIndex: Dispatch<SetStateAction<number | null>>
  setPlayoffTeams: Dispatch<SetStateAction<PlayoffTeam[]>>
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  const [width, setWidth] = useState<number | undefined>()

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.clientWidth)
    }
  }, [ref])

  const [{ isDragging }, dragRef, dragPreview] = useDrag(
    () => ({
      type: 'playoff-team',
      item: () => ({ ...team, index, width }),
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [team, index, width],
  )

  const [{ isOver }, dropRef] = useDrop({
    accept: 'playoff-team',
    hover: () => setHoverIndex(index),
    drop: (dragItem: DragItem) => {
      setPlayoffTeams((teams) => {
        if (hoverIndex === null) return teams

        const dragTeam = teams[dragItem.index]
        const hoverTeam = teams[hoverIndex]

        if (dragTeam.id === hoverTeam.id) return teams

        const newTeams = [...teams]
        newTeams[dragItem.index] = { ...dragTeam, id: hoverTeam.id }
        newTeams[hoverIndex] = { ...hoverTeam, id: dragTeam.id }

        return newTeams
      })
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  })

  const imgSrc = generateParticipantImagePath(team.external_id)

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true })
  }, [dragPreview])

  return (
    <>
      <div
        className={classNames(styles.playoffTeamItem, {
          [styles.playoffTeamItemOver]: isOver,
          [styles.playoffTeamItemDragging]: isDragging,
        })}
      >
        <div className={styles.pointWrapper}>{point}</div>

        <div
          className={styles.teamWrapper}
          ref={(node) => {
            dragRef(dropRef(node))
            ref.current = node
          }}
        >
          <div>
            {!!imgSrc && (
              <Image src={imgSrc} width={60} height={60} alt={team.name} />
            )}
          </div>

          <div className={styles.team}>
            {team.city && <p className={styles.teamCity}>{team.city}</p>}
            <p className={styles.teamName}>{team.name}</p>
          </div>
        </div>
      </div>
    </>
  )
}

const layerStyles: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
}

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
) {
  if (initialOffset == null || currentOffset == null) {
    return {
      display: 'none',
    }
  }

  const { x, y } = currentOffset

  const transform = `translate(${x}px, ${y}px)`

  return {
    transform,
    WebkitTransform: transform,
  }
}

function CustomDragLayer() {
  type DragLayerType = {
    item: DragItem
    initialOffset: XYCoord | null
    currentOffset: XYCoord | null
    isDragging: boolean
  }

  const { isDragging, item, initialOffset, currentOffset } =
    useDragLayer<DragLayerType>((monitor) => ({
      item: monitor.getItem(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }))

  if (!isDragging) return null

  const imgSrc = generateParticipantImagePath(item.external_id)

  return (
    <div style={layerStyles}>
      <div
        style={{
          ...getItemStyles(initialOffset, currentOffset),
          width: item.width,
        }}
        className={classNames(styles.teamWrapper, styles.teamWrapperDragging)}
      >
        <div>
          {!!imgSrc && (
            <Image src={imgSrc} width={60} height={60} alt={item.name} />
          )}
        </div>

        <div className={styles.team}>
          {item.city && <p className={styles.teamCity}>{item.city}</p>}
          <p className={styles.teamName}>{item.name}</p>
        </div>
      </div>
    </div>
  )
}
