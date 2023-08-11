import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import {
  FinalFourPredictionData,
  FinalFourPredictionEntry,
  StageType,
} from '@/api'
import { CheckedGray, CheckedGreen } from '@/assets/icons'
import { generateParticipantImagePath } from '@/config/constants'
import { useLoadingWindow } from '@/contexts'
import { useFinalFourPredictionReport } from '@/helpers'

import styles from './FinalFourPredictionReport.module.scss'

export function FinalFourPredictionReport() {
  // /api/pools/reports/33/final-four-prediction
  const {
    query: { poolId },
  } = useRouter()

  const { finalFourSeasonData: teams, finalFourSeasonDataLoading: isLoading } =
    useFinalFourPredictionReport({
      poolId: Number(poolId),
    })

  const { setIsLoadingShow } = useLoadingWindow()

  if (isLoading) {
    setIsLoadingShow(true)
    return <></>
  } else {
    setIsLoadingShow(false)
  }

  return (
    <div>
      <div className={classNames(styles.thead, styles.row)}>
        <div></div>
        <div className={styles.team}>Team</div>
        <div>Team Picked</div>
        <div>Reack Final Four</div>
        <div>Reach finals</div>
        <div>Win Championship</div>
      </div>
      <div className={styles.tbody}>
        {teams?.length ? (
          teams?.map((team, index) => <TeamRow key={index} team={team} />)
        ) : (
          <div className={classNames(styles.noTeams)}>No teams found</div>
        )}
      </div>
    </div>
  )
}

const TeamRow = ({ team }: { team: FinalFourPredictionData }) => {
  const [showEntries, setShowEntries] = useState(false)

  const teamNameSplit = team.participant.name
    ? [
        team.participant.name.slice(0, team.participant.name.lastIndexOf(' ')),
        team.participant.name.slice(team.participant.name.lastIndexOf(' ') + 1),
      ]
    : []

  const teamImagePath = generateParticipantImagePath(
    team.participant.external_id,
  )

  return (
    <div
      className={classNames(styles.teamRow, {
        [styles.closed]: !showEntries,
      })}
      onClick={() => setShowEntries(!showEntries)}
    >
      <div className={styles.row}>
        <div className={styles.teamLogo}>
          <Image
            alt={team.participant.name}
            src={teamImagePath}
            width={55}
            height={55}
          />
        </div>
        <div className={styles.teamName}>
          <div>{teamNameSplit[0]}</div>
          <div>{teamNameSplit[1]}</div>
        </div>
        <div className={classNames(styles.teamCol, styles.bold)}>
          {team.entries.length} entries
        </div>
        <div className={styles.teamCol}>
          {team.stages_picks_count.PLAY_OFF_STAGE_1_4} picks
        </div>
        <div className={styles.teamCol}>
          {team.stages_picks_count.PLAY_OFF_STAGE_1_2} picks
        </div>
        <div className={styles.teamCol}>
          {team.stages_picks_count.PLAY_OFF_STAGE_FINAL} picks
        </div>
      </div>
      {showEntries && (
        <div className={styles.entriesRow}>
          <div></div>
          <div></div>
          <RowEntriesTable entries={team.entries} />
        </div>
      )}
    </div>
  )
}

const RowEntriesTable = ({
  entries,
}: {
  entries: FinalFourPredictionEntry[]
}) => {
  const checkEntrySelected = (
    entry: FinalFourPredictionEntry,
    type: StageType,
  ) => (entry.stages.includes(type) ? <CheckedGreen /> : <CheckedGray />)

  if (!entries.length) return <></>

  return (
    <div className={styles.entriesTable}>
      {entries.map((entry, index) => (
        <div className={styles.tableRow} key={index}>
          <div>{entry.name}</div>
          <div>{checkEntrySelected(entry, 'PLAY_OFF_STAGE_1_4')}</div>
          <div>{checkEntrySelected(entry, 'PLAY_OFF_STAGE_1_2')}</div>
          <div>{checkEntrySelected(entry, 'PLAY_OFF_STAGE_FINAL')}</div>
        </div>
      ))}
    </div>
  )
}
