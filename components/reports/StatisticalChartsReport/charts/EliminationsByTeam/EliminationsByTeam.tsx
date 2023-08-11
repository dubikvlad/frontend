import classNames from 'classnames'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import { ChartsResponseData, EliminationsByTeamItem } from '@/api'
import { generateParticipantImagePath } from '@/config/constants'
import { Select } from '@/features/ui'

import styles from './EliminationsByTeam.module.scss'

type EliminationsByTeamProps = {
  data: ChartsResponseData['eliminations_by_team']
}

type ChartItem = { external_id: string; name: string; count: number }

export function EliminationsByTeam({ data }: EliminationsByTeamProps) {
  // максимальное значение из пришедших данных
  const maxValueData = data.reduce((acc, item) => {
    if (item.count > acc) acc = item.count
    return acc
  }, 0)

  // изначальное максимальное значение
  const initialMax = 10
  // новое макс. значение шкалы
  const newMax =
    maxValueData <= initialMax
      ? initialMax
      : initialMax - (maxValueData % initialMax) + maxValueData

  // макс. знач. процентов относительно значения
  const maximumPercentage = (maxValueData / newMax) * 100

  // формула расчета
  const ratioСalc = (currentValue: number) =>
    (currentValue * maximumPercentage) / maxValueData

  const options = [
    { title: 'Team Name', name: 'team-name' },
    {
      title: 'Eliminated participants: high to low',
      name: 'eliminated-participants-high-to-low',
    },
    {
      title: 'Eliminated participants: low to high',
      name: 'eliminated-participants-low-to-high',
    },
  ]

  const [selectValue, setSelectValue] = useState(options[0].name)

  function sortData(a: EliminationsByTeamItem, b: EliminationsByTeamItem) {
    if (selectValue === 'team-name') {
      if (a.name > b.name) {
        return 1
      } else {
        return -1
      }
    }

    if (selectValue === 'eliminated-participants-high-to-low') {
      return b.count - a.count
    }

    if (selectValue === 'eliminated-participants-low-to-high') {
      return a.count - b.count
    }

    return 0
  }

  const sortedData = [...data].sort(sortData)

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>Eliminations by Team</p>

      <div className={styles.filterWrapper}>
        <Select
          options={options}
          value={selectValue}
          onChange={setSelectValue}
          titleDisplayFormat={(title) => `Sort by ${title}`}
        />
      </div>

      <div className={styles.chartWrapper}>
        <div className={styles.eliminationsWrapper}>
          <div></div>
          <div className={styles.eliminationsListWrapper}>
            {newMax > initialMax && <p className={styles.zero}>0</p>}
            <ul className={styles.eliminationsList}>
              {newMax <= initialMax ? (
                [...Array(initialMax).keys()].map((i) => (
                  <li key={i}>{i + 1}</li>
                ))
              ) : (
                <>
                  {[...Array(initialMax).keys()].map((i) => (
                    <li key={i}>
                      {(((i + 1) / initialMax) * newMax).toFixed()}
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        </div>

        <div className={styles.teamsWrapper}>
          {sortedData.map((item, i) => (
            <Bar key={i} item={item} ratioСalc={ratioСalc} />
          ))}
        </div>
      </div>
    </div>
  )
}

type BarProps = {
  item: ChartItem
  ratioСalc: (currentValue: number) => number
}

function Bar({ item, ratioСalc }: BarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLParagraphElement>(null)

  const src = generateParticipantImagePath(item.external_id)

  const [isCountMore, setIsCountMore] = useState(false)
  const [countLeft, setCountLeft] = useState(0)

  const calculateDifference = useCallback(() => {
    if (barRef.current && countRef.current) {
      const barWidth = barRef.current.clientWidth
      const countEliminationsWidth = countRef.current.clientWidth

      setIsCountMore(countEliminationsWidth > barWidth)
      setCountLeft(countEliminationsWidth > barWidth ? barWidth + 5 : 0)
    }
  }, [barRef, countRef])

  useEffect(() => {
    calculateDifference()
  }, [item, calculateDifference])

  return (
    <div className={styles.diagramWrapper}>
      <div className={styles.teamWrapper}>
        <div>
          {!!src && <Image src={src} width={40} height={40} alt={item.name} />}
        </div>
        <p>{item.name}</p>
      </div>

      <div className={styles.barWrapper}>
        <div
          ref={barRef}
          className={styles.bar}
          style={{ width: `${ratioСalc(item.count)}%` }}
          onMouseMove={calculateDifference}
        >
          <p
            ref={countRef}
            className={classNames(styles.countEliminations, {
              [styles.countMore]: isCountMore,
            })}
            style={{ marginLeft: `${countLeft}px` }}
          >
            {item.count} Eliminations
          </p>
        </div>
      </div>
    </div>
  )
}
