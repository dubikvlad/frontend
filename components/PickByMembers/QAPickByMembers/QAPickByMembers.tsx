import classNames from 'classnames'
import { useRouter } from 'next/router'
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { api, Pool, QAEntriesItem, QAForecast } from '@/api'
import { Pencil, VerticalDots } from '@/assets/icons'
import {
  EntrySettings,
  FilterByEntryAndMembersAndWeeks,
} from '@/features/components'
import { SelectProps } from '@/features/ui/Select/Select'
import { entriesFiltration, useGetPoolEntries, usePool } from '@/helpers'

import styles from './QAPickByMembers.module.scss'

export function QAPickByMembers() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'qa'>(Number(poolId))

  const { poolEntriesData, poolEntriesMutate } = useGetPoolEntries<'qa'>({
    poolId: Number(poolId),
  })

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])
  const [membersOptions, setMembersOptions] = useState<SelectProps['options']>(
    [],
  )

  async function deleteEntry(entryId: number) {
    if (!poolData) return

    await api.entries.delete(poolData.id, entryId)
    poolEntriesMutate()
  }

  async function renameEntry(entryId: number, newName: string) {
    if (!poolData) return

    await api.entries.changeFields(poolData.id, entryId, {
      name: newName,
    })
    poolEntriesMutate()
  }

  const filteredEntries = entriesFiltration<QAEntriesItem>({
    search: search,
    entries: poolEntriesData,
    members: members,
    pathForSearch: ['name'],
    pathForFiltersMembers: ['user_id'],
  })

  const isDisabledFilters: boolean =
    !filteredEntries?.length && !members.length && !search

  if (!poolData) return <></>

  return (
    <div className={styles.wrapper}>
      <FilterByEntryAndMembersAndWeeks
        search={search}
        setSearch={setSearch}
        members={members}
        setMembers={setMembers}
        setMembersOptions={setMembersOptions}
        poolData={poolData}
        isDisabled={isDisabledFilters}
      />
      <div className={styles.entries}>
        {filteredEntries.length ? (
          filteredEntries.map((item) => (
            <EntryItem
              key={item.id}
              item={item}
              deleteEntry={deleteEntry}
              renameEntry={renameEntry}
              poolData={poolData}
            />
          ))
        ) : (
          <div className={styles.notFound}>
            {search.trim() ? (
              <>
                Sorry, there were no results found for{' '}
                <span>&quot;{search}&quot;</span>
              </>
            ) : (
              <>
                Unfortunately, we did not find any suitable entries for{' '}
                <span>
                  {members.length
                    ? membersOptions
                        .reduce<string[]>((acc, option) => {
                          if (members.includes(option.name))
                            acc.push(option.title)
                          return acc
                        }, [])
                        .join(', ')
                    : 'All members'}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EntryItem({
  item,
  deleteEntry,
  renameEntry,
  poolData,
}: {
  item: QAEntriesItem
  deleteEntry: (entryId: number) => void
  renameEntry: (entryId: number, newName: string) => void
  poolData: Pool<'qa'>
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState<string>(item.name)
  const [isFocus, setIsFocus] = useState<boolean>(false)

  const [entryDetails, setEntryDetails] = useState(false)

  useEffect(() => {
    if (isFocus && inputRef.current) inputRef.current.focus()
  }, [isFocus])

  const rename = () => {
    setIsFocus(false)

    if (item.name.trim() !== value.trim()) {
      renameEntry(item.id, value)
    }
  }

  const isCommissioner = poolData.is_commissioner

  return (
    <div className={styles.entry}>
      <div
        className={classNames(styles.entryHeader, {
          [styles.notOwner]: !isCommissioner,
        })}
      >
        <div
          className={styles.leftBorder}
          style={{ backgroundColor: item.color }}
        ></div>
        <div
          className={styles.entryName}
          onClick={() => (isCommissioner ? setIsFocus(true) : null)}
        >
          {isCommissioner ? (
            <>
              {isFocus ? (
                <input
                  ref={inputRef}
                  className={classNames(
                    styles.entryRenameInput,
                    styles.entryRenameInputVisible,
                  )}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onBlur={rename}
                  onKeyDown={(e) => e.key === 'Enter' && rename()}
                />
              ) : (
                <p className={styles.entryRenameInput}>{value}</p>
              )}

              <Pencil
                className={classNames({ [styles.pencilVisible]: isFocus })}
                fill="var(--bg-color-8)"
                pathFill="var(--bg-color-8)"
              />
            </>
          ) : (
            <p className={styles.entryRenameInput}>{value}</p>
          )}
        </div>

        <span>
          <b>{item.q_a_forecast?.answers.length ?? 0}</b> of{' '}
          <b>{poolData.pick_pool.questions_with_points.length}</b> Questions
          Answered
        </span>

        <span
          className={classNames(styles.showDetails, {
            [styles.noAction]: !item.q_a_forecast,
          })}
          onClick={() => setEntryDetails((prev) => !prev)}
        >
          {entryDetails ? <>Hide Answers</> : <>Show Answers</>}
        </span>

        {isCommissioner && (
          <Settings
            item={item}
            deleteEntry={deleteEntry}
            setIsFocus={setIsFocus}
          />
        )}
      </div>
      {entryDetails && item.q_a_forecast ? (
        <EntryDetails
          forecasts={item.q_a_forecast.answers}
          poolData={poolData}
        />
      ) : (
        <></>
      )}
    </div>
  )
}

function EntryDetails({
  forecasts,
  poolData,
}: {
  forecasts: QAForecast['answers']
  poolData: Pool<'qa'>
}) {
  const poolQuestions = poolData.pick_pool.questions_with_points

  return (
    <div className={styles.table}>
      <div className={styles.tHead}>
        <div>Question</div>
        <div>Answer</div>
        <div>Points Recieved</div>
      </div>
      <div className={styles.tBody}>
        {forecasts.map((forecast) => {
          const forecastQuestion = poolQuestions.find(
            (q) => q.id === forecast.question_id,
          )

          return (
            <div key={forecast.question_id} className={styles.row}>
              <div>{forecastQuestion?.question_title}</div>
              <div>{forecast.selected_answer}</div>
              <div>{forecast.point_for_answer}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Settings({
  item,
  setIsFocus,
  deleteEntry,
}: {
  item: QAEntriesItem
  setIsFocus: Dispatch<SetStateAction<boolean>>
  deleteEntry: (entryId: number) => void
}) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const [showConfirmDeletion, setShowConfirmDeletion] = useState(false)

  return (
    <div className={classNames(styles.dots, styles.entrySettings)}>
      <OutsideClickHandler
        onOutsideClick={() => setDropdownIsOpen(false)}
        display="contents"
      >
        <div
          onClick={() => setDropdownIsOpen((prev) => !prev)}
          className={styles.dotsWrapper}
        >
          <VerticalDots fillCircle="var(--bg-color-8)" width={3} height={15} />
        </div>
        <EntrySettings
          dropdownIsOpen={dropdownIsOpen}
          setDropdownIsOpen={setDropdownIsOpen}
          showConfirmDeletion={showConfirmDeletion}
          setShowConfirmDeletion={setShowConfirmDeletion}
          renameAction={() => setIsFocus(true)}
          deleteAction={() => deleteEntry(item.id)}
        />
      </OutsideClickHandler>
    </div>
  )
}
