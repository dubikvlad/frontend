import { useRouter } from 'next/router'
import { useState } from 'react'

import { BracketStage } from '@/api'
import { useGetPickSummary, useGetTournamentResultsByPool } from '@/helpers'

import { SidebarInfo } from '../SidebarInfo'

import styles from './BracketPickNFL.module.scss'
import { GameWrapper } from './GameWrapper'

export function BracketPickNFL() {
  const [groupId, setGroupId] = useState(0)
  const [title, setTitle] = useState('')

  const {
    query: { poolId },
  } = useRouter()

  const { pickSummaryGroups } = useGetPickSummary(Number(poolId))

  const { tournamentResult: roundsData } = useGetTournamentResultsByPool(
    String(poolId),
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.table}>
        {roundsData &&
          Object.values(roundsData)
            .sort((a: BracketStage[], b: BracketStage[]) => b.length - a.length)
            .map((stage: BracketStage[], stageIndex: number) => (
              <div key={stageIndex} className={styles.row}>
                {stage.map((match: BracketStage, matchIndex: number) => {
                  return (
                    <GameWrapper
                      key={matchIndex}
                      matchIndex={matchIndex}
                      stage={stage}
                      pickSummaryGroups={pickSummaryGroups}
                      match={match}
                      groupId={groupId}
                      setGroupId={setGroupId}
                      setTitle={setTitle}
                    />
                  )
                })}
              </div>
            ))}
      </div>
      <SidebarInfo
        pickSummaryGroups={pickSummaryGroups}
        groupId={groupId}
        title={title}
      />
    </div>
  )
}
