import Image from 'next/image'
import React from 'react'

import { GolfPlayer } from '@/api'
import { UnknownPlayer } from '@/assets/icons'
import { GolfMajorPickTiersState } from '@/config/constants'

import styles from './GolfMajorsPickedRosterTiered.module.scss'

export function GolfMajorsPickedRosterTiered({
  tiers,
}: {
  tiers: GolfMajorPickTiersState
}) {
  const tierPickedPlayerList = Object.entries(tiers).map(
    ([tierNumber, value]) => ({
      tierNumber,
      pickedPlayer: value.players.find((p) => p.id === value.selectedPlayerId),
    }),
  )

  return (
    <div className={styles.container}>
      <div className={styles.title}>Your roster</div>
      {tierPickedPlayerList.map((tier) => (
        <PlayerCard
          player={tier.pickedPlayer}
          tierNumber={tier.tierNumber}
          key={tier.tierNumber}
        />
      ))}
    </div>
  )
}

const PlayerCard = ({
  player,
  tierNumber,
}: {
  player?: GolfPlayer
  tierNumber: string
}) => {
  if (!player) {
    return (
      <div className={styles.unknownPlayer}>
        <div className={styles.photo}>
          <UnknownPlayer />
        </div>
        <div>Choose a player from Tier {tierNumber}</div>
      </div>
    )
  }

  return (
    <div className={styles.player}>
      <div className={styles.playerInfo}>
        <div className={styles.playerPhoto}>
          <Image src={player.image} alt={player.name} width={60} height={80} />
        </div>
        <div className={styles.playerName}>
          <div>{player.firstName}</div>
          <div>{player.lastName}</div>
        </div>
      </div>
      <div className={styles.playerRank}>
        World rank:<span>{player.worldRank}</span>
      </div>
    </div>
  )
}
