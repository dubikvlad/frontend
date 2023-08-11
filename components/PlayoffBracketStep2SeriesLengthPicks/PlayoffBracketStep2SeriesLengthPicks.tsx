import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import {
  api,
  BracketPlayoffEntryItem,
  BracketSeriesStage,
  BracketTeam,
  MatchSeriesArrayItem,
  Pool,
} from '@/api'
import {
  generateParticipantImagePath,
  NBAStageNames,
  routes,
} from '@/config/constants'
import { useSeriesLength } from '@/helpers'

import styles from './PlayoffBracketStep2SeriesLengthPicks.module.scss'

export const PlayoffBracketStep2SeriesLengthPicks = ({
  poolData,
  entry,
}: {
  poolData: Pool<'bracket'>
  entry: BracketPlayoffEntryItem
}) => {
  const {
    forecasts: entryForecasts,
    length_options,
    seriesLengthLoading,
  } = useSeriesLength({
    poolId: poolData.id,
    entryId: entry.id,
  })
  const [isLoading, setIsLoading] = useState(false)

  const {
    push,
    query: { isMaintenance },
  } = useRouter()

  const [seriesToUpdateArray, setSeriesToUpdateArray] = useState<
    MatchSeriesArrayItem[]
  >([])

  useEffect(() => {
    if (length_options?.length && entryForecasts) {
      const updateArray: MatchSeriesArrayItem[] = []

      Object.values(entryForecasts).forEach((value) =>
        value.forEach((match) => {
          updateArray.push({
            id: match.id,
            series_length:
              match.number_of_games?.toString() || length_options[0].toString(),
          })
        }),
      )

      setSeriesToUpdateArray(updateArray)
    }
  }, [entryForecasts, length_options])

  const updateSeriesArray = (match: BracketSeriesStage, value: string) => {
    setSeriesToUpdateArray((prev) =>
      prev.map((seriesItem) => ({
        ...seriesItem,
        series_length:
          match.id === seriesItem.id ? value : seriesItem.series_length,
      })),
    )
  }

  const submitSeries = () => {
    if (isLoading) return null

    setIsLoading(true)

    const apiRequest = isMaintenance
      ? api.entries.maintenanceSeriesLength
      : api.entries.updateSeriesLength

    apiRequest(poolData.id, entry.id, {
      forecasts: seriesToUpdateArray,
    }).then((data) => {
      if (data.error) {
      } else {
        push(routes.account.overview(poolData.id))
      }
    })
  }

  if (seriesLengthLoading || !entryForecasts) return <div>Loading..</div>

  return (
    <div className={styles.main}>
      <div className={styles.picksContainer}>
        {Object.entries(entryForecasts).map(([key, value]) => (
          <div key={key} className={styles.matchesContainer}>
            <div className={styles.containerTitle}>
              <div>{NBAStageNames[key as keyof typeof NBAStageNames]}</div>
              <div>Series Length</div>
            </div>
            {value &&
              value.map((match, index) => {
                const matchSeries = seriesToUpdateArray.find(
                  (serie) => serie.id === match.id,
                )

                return (
                  <MatchContainer
                    key={index}
                    match={match}
                    length_options={length_options}
                    updateSeriesArray={updateSeriesArray}
                    matchSeries={matchSeries}
                  />
                )
              })}
          </div>
        ))}
      </div>
      <div className={styles.buttonContainer}>
        <div>
          <button
            className="button button-blue"
            onClick={submitSeries}
            disabled={isLoading || seriesLengthLoading}
          >
            Submit series length
          </button>
        </div>
      </div>
    </div>
  )
}

const MatchContainer = ({
  match,
  length_options,
  updateSeriesArray,
  matchSeries,
}: {
  match: BracketSeriesStage
  length_options?: Array<number>
  updateSeriesArray: (match: BracketSeriesStage, value: string) => void
  matchSeries?: MatchSeriesArrayItem
}) => {
  const mainParticipant = match.participant
  const overParticipant = match.group_participants.find(
    (part) => part.id !== mainParticipant.id,
  )

  return (
    <div className={styles.matchContainer}>
      <div className={styles.teamsContainer}>
        <Team team={mainParticipant} />
        <div className={styles.separator}>@</div>
        <Team team={overParticipant} />
      </div>
      <div className={styles.seriesContainer}>
        {length_options?.length &&
          length_options.map((item) => (
            <div
              className={classNames(styles.series, {
                [styles.selected]:
                  matchSeries?.series_length === item.toString(),
              })}
              key={item}
              onClick={() => updateSeriesArray(match, item.toString())}
            >
              {item}
            </div>
          ))}
      </div>
    </div>
  )
}

const Team = ({ team }: { team?: BracketTeam }) => {
  if (!team) return <></>

  const image = generateParticipantImagePath(team.external_id)
  const teamNameSplit = team.name
    ? [
        team.name.slice(0, team.name.lastIndexOf(' ')),
        team.name.slice(team.name.lastIndexOf(' ') + 1),
      ]
    : []

  return (
    <div className={styles.team}>
      <div className={styles.teamName}>{teamNameSplit[0]}</div>
      <div className={styles.teamLogo}>
        <Image src={image} width={40} height={40} alt={team.name} />
      </div>
    </div>
  )
}
