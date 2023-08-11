import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'

import { WhoToRootForForecast } from '@/api'
import { generateParticipantImagePath } from '@/config/constants'
import { Checkbox, Select2 as Select } from '@/features/ui'
import { Option } from '@/features/ui/SelectWithSearch'
import { usePool } from '@/helpers'
import { useWhoToRootFor } from '@/helpers/hooks/useGetWhoToRootFor'

import styles from './WhoToRootForReport.module.scss'

const tableHeads = [
  'Team',
  'Picked by you',
  'Avg # picked by poolwide',
  'Rooting scale',
]

const pickConditions = [
  {
    title: 'All teams in Journey',
    name: 'allTeams',
  },
  {
    title: 'Only teams I picked',
    name: 'teamsIPicked',
  },
] as const

type PickConditions = (typeof pickConditions)[number]['name']

export function WhoToRootForReport() {
  const {
    query: { poolId },
  } = useRouter()

  const [selectedEntryId, setSelectedEntryId] = useState('')
  const [selectedCondition, setSelectedCondition] = useState<PickConditions>(
    pickConditions[0].name,
  )
  const [showSurvivingTeams, setShowSurvivingTeams] = useState(false)

  const { poolData } = usePool<'bracket'>(Number(poolId))

  const { whoToRootForReportItems, whoToRootForReportLoading } =
    useWhoToRootFor({
      poolId: Number(poolData?.id),
    })

  const selectEntriesData = useMemo(() => {
    if (whoToRootForReportItems?.length) {
      return whoToRootForReportItems.map((entry, index) => ({
        name: index.toString(),
        title: entry.name,
      }))
    }

    return []
  }, [whoToRootForReportItems])

  const reportItems = useMemo<WhoToRootForForecast[]>(() => {
    if (whoToRootForReportItems?.length) {
      let reportItems =
        whoToRootForReportItems[Number(selectedEntryId)].forecasts || []

      if (selectedCondition === 'teamsIPicked') {
        reportItems = reportItems.filter(
          (foreacst) => foreacst.picks_by_user !== 0,
        )
      }

      if (showSurvivingTeams) {
        reportItems = reportItems.filter((forecast) => forecast.is_surviving)
      }

      return reportItems.sort(
        (a, b) =>
          b.picks_by_user -
          b.picks_poolwide -
          (a.picks_by_user - a.picks_poolwide),
      )
    }
    return []
  }, [
    selectedCondition,
    selectedEntryId,
    showSurvivingTeams,
    whoToRootForReportItems,
  ])

  useEffect(() => {
    if (selectEntriesData.length && !selectedEntryId) {
      setSelectedEntryId(selectEntriesData[0].name)
    }
  }, [selectEntriesData, selectedEntryId])

  if (whoToRootForReportLoading) return <></>

  return (
    <div className={styles.mainWrapper}>
      <div className={styles.main}>
        <div className={styles.topSelects}>
          <div className={styles.flexContainer}>
            <Select
              onChange={setSelectedEntryId}
              options={selectEntriesData}
              value={selectedEntryId}
            />

            <Select
              onChange={setSelectedCondition as unknown as () => void}
              options={pickConditions as unknown as Option[]}
              value={selectedCondition}
            />
          </div>
          <label htmlFor="showSurvivingTeams" className={styles.headLabel}>
            <Checkbox
              onChange={setShowSurvivingTeams}
              value={showSurvivingTeams}
            />
            <div id="showSurvivingTeams">Show surviving teams</div>
          </label>
        </div>
        <div className={classNames(styles.row, styles.thead)}>
          <div></div>
          {tableHeads.map((thead, index) => (
            <div
              key={index}
              style={{ justifyContent: index === 0 ? 'flex-start' : 'center' }}
            >
              {thead}
            </div>
          ))}
        </div>
        <div className={styles.tbody}>
          {reportItems.map((report, index) => (
            <TeamRow report={report} key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

const TeamRow = ({ report }: { report: WhoToRootForForecast }) => {
  const rootingScaleNumber = Number(
    (report.picks_by_user - report.picks_poolwide).toFixed(2),
  )
  const imagePath = generateParticipantImagePath(report.external_id)

  const teamNameSplit = report.team_name
    ? [
        report.team_name.slice(0, report.team_name.lastIndexOf(' ')),
        report.team_name.slice(report.team_name.lastIndexOf(' ') + 1),
      ]
    : []

  return (
    <div className={classNames(styles.row)}>
      <div className={styles.teamCol} style={{ marginRight: '5px' }}>
        <Image alt={teamNameSplit[0]} src={imagePath} width={50} height={50} />
      </div>
      <div className={styles.teamName}>
        <div>{teamNameSplit[0]}</div>
        <div>{teamNameSplit[1]}</div>
      </div>
      <div className={styles.teamCol}>{report.picks_by_user}</div>
      <div className={styles.teamCol}>{report.picks_poolwide}</div>
      <div className={styles.teamCol}>
        <RootingScale rootingScaleNumber={rootingScaleNumber} />
      </div>
    </div>
  )
}

const RootingScale = ({
  rootingScaleNumber,
}: {
  rootingScaleNumber: number
}) => {
  const widthStep = 40

  const width = Math.abs(rootingScaleNumber * widthStep)

  const stripStyles = Object.assign(
    { width: `${width}px` },
    rootingScaleNumber < 0
      ? {
          marginRight: `${width}px`,
          borderRadius: '3px 0 0 3px',
          backgroundColor: 'var(--lost-color-2)',
        }
      : {
          marginLeft: `${width}px`,
          borderRadius: '0px 3px 3px 0',
          backgroundColor: 'var(--win-color-2)',
        },
  )
  return (
    <div className={styles.stripCol}>
      <div className={styles.stripAll}>
        <div className={styles.centerLine} />
        <div className={styles.stripContainer}>
          <div style={stripStyles} className={styles.strip}></div>
        </div>
      </div>
      <div className={styles.scale}> {rootingScaleNumber.toFixed(2)}</div>
    </div>
  )
}
