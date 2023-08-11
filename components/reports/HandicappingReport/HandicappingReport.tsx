import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { generateParticipantImagePath } from '@/config/constants'
import { Input, Select2 } from '@/features/ui'
import { Option } from '@/features/ui/Select2/Select2'
import { useGetPoolEntries, useHandicapReport } from '@/helpers'

import styles from './HandicappingReport.module.scss'

const tableHead = ['', 'Team Name', 'Wins', 'Losses', 'Points']

export default function HandicappingReport() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolEntriesData } = useGetPoolEntries({ poolId: Number(poolId) })

  const [searchByTeamName, setSearchByTeamName] = useState<string>('')
  const [selectedEntry, setSelectedEntry] = useState<string>('')

  useEffect(() => {
    setSearchByTeamName('')
  }, [selectedEntry])

  const options: Option[] = poolEntriesData.map((item) => ({
    title: item.name,
    name: String(item.id),
  }))

  useEffect(() => {
    if (selectedEntry === '' && options.length) {
      setSelectedEntry(options[0].name)
    }
  }, [options, selectedEntry])

  const { handicapReportData, handicapReportIsLoading } = useHandicapReport({
    poolId: Number(poolId),
    entryId: Number(selectedEntry),
  })

  const data =
    searchByTeamName.trim() !== ''
      ? handicapReportData.filter((item) =>
          item.participant.name
            .toLowerCase()
            .includes(searchByTeamName.trim().toLowerCase()),
        )
      : handicapReportData

  return (
    <div className={styles.wrapper}>
      <div className={styles.filterWrapper}>
        <Input
          placeholder="Enter the Team Name"
          value={searchByTeamName}
          onChange={setSearchByTeamName}
          isDisabled={!handicapReportData.length}
        />

        <Select2
          value={selectedEntry}
          onChange={setSelectedEntry}
          options={options}
        />
      </div>

      <div className={styles.tableWrapper}>
        <div
          className={classNames(styles.tableHeader, {
            [styles.hide]: !data.length,
          })}
        >
          {tableHead.map((title, i) => (
            <p
              key={i}
              className={classNames({
                [styles.teamNameText]: i === 1,
                [styles.winsText]: i === 2,
              })}
            >
              {title}
            </p>
          ))}
        </div>

        {!!data.length
          ? data.map((item, i) => {
              const { involving, picked, against } = item

              const src = generateParticipantImagePath(
                item.participant.external_id,
              )

              const shortName =
                item.participant.short_name ??
                item.participant.name.slice(0, 3).toUpperCase()

              return (
                <div key={i} className={styles.tableRow}>
                  <div className={styles.img}>
                    {!!src && (
                      <Image
                        src={src}
                        width={55}
                        height={55}
                        alt={item.participant.name}
                      />
                    )}
                  </div>

                  <div className={styles.teamNameWrapper}>
                    <div className={styles.wrapper1}>
                      <p className={styles.wrapper1Title}>{shortName}</p>
                      <p className={styles.wrapper1Text}>
                        {item.participant.name}
                      </p>
                    </div>

                    <div className={styles.wrapper2}>
                      <p>Games Involving</p>
                      <p>When Team Picked</p>
                      <p>When Team Picked Against</p>
                    </div>
                  </div>

                  <div className={styles.score}>
                    <div className={styles.scoreWrapper}>
                      <div className={styles.scoreWrapperItem}>
                        {involving.win}
                      </div>
                      <div className={styles.scoreWrapperItem}>
                        {involving.lose}
                      </div>
                      <div className={styles.scoreWrapperItem}>
                        {involving.points}
                      </div>
                    </div>

                    <div className={styles.scoreWrapper}>
                      <div className={styles.scoreWrapperItem}>
                        {picked.win}
                      </div>
                      <div className={styles.scoreWrapperItem}>
                        {picked.lose}
                      </div>
                      <div className={styles.scoreWrapperItem}>
                        {picked.points}
                      </div>
                    </div>

                    <div className={styles.scoreWrapper}>
                      <div className={styles.scoreWrapperItem}>
                        {against.win}
                      </div>
                      <div className={styles.scoreWrapperItem}>
                        {against.lose}
                      </div>
                      <div className={styles.scoreWrapperItem}>
                        {against.points}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          : !handicapReportIsLoading && (
              <p className={styles.notFound}>
                Sorry, we couldn&apos;t find any relevant information for the
                entry{' '}
                <span>
                  &quot;
                  {
                    options.find((option) => option.name === selectedEntry)
                      ?.title
                  }
                  &quot;
                </span>
                . Try to change your search criteria
              </p>
            )}
      </div>
    </div>
  )
}
