import classNames from 'classnames'
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { api, Pool, QAEntriesItem, QAForecast, UserResponseData } from '@/api'
import { Pencil, VerticalDots } from '@/assets/icons'
import { createEntry } from '@/config/constants'
import { EntrySettings } from '@/features/components'
import { useGetPoolEntries } from '@/helpers'

import styles from './QAManageEntriesMyPicks.module.scss'

export function QAManageEntriesMyPicks({
  poolData,
  userData,
}: {
  poolData: Pool<'qa'>
  userData: UserResponseData
}) {
  const { poolEntriesData, poolEntriesMutate, poolEntriesIsLoading } =
    useGetPoolEntries<'qa'>({
      poolId: poolData.id,
      userId: userData?.id,
    })

  const [createEntryIsLoading, setCreateEntryIsLoading] =
    useState<boolean>(false)

  const createEntryFunc = () =>
    createEntry({
      poolData,
      userData,
      poolEntriesData,
      setCreateEntryIsLoading,
      mutateArray: [poolEntriesMutate],
      createEntryIsLoading,
    })

  async function deleteEntry(entryId: number) {
    await api.entries.delete(poolData.id, entryId)
    poolEntriesMutate()
  }

  async function renameEntry(entryId: number, newName: string) {
    await api.entries.changeFields(poolData.id, entryId, {
      name: newName,
    })
    poolEntriesMutate()
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.myEntriesInfo}>
        <p>My {poolEntriesData?.length} Entries</p>

        <button
          className={classNames('button', 'button-blue-light-outline', {
            [styles.createEntryDisabled]:
              createEntryIsLoading || poolEntriesIsLoading,
          })}
          onClick={createEntryFunc}
        >
          Create a New Entry
        </button>
      </div>

      <div className={styles.entries}>
        {poolEntriesData.length
          ? poolEntriesData.map((item) => (
              <EntryItem
                key={item.id}
                item={item}
                deleteEntry={deleteEntry}
                renameEntry={renameEntry}
                poolData={poolData}
              />
            ))
          : !poolEntriesIsLoading && (
              <p className={styles.noEntriesText}>
                You don&apos;t seem to have any entries. Try to{' '}
                <span onClick={createEntryFunc}>Create a New Entry</span>
              </p>
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

  return (
    <div className={styles.entry}>
      <div className={styles.entryHeader}>
        <div
          className={styles.leftBorder}
          style={{ backgroundColor: item.color }}
        ></div>
        <div className={styles.entryName} onClick={() => setIsFocus(true)}>
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

        <Settings
          item={item}
          deleteEntry={deleteEntry}
          setIsFocus={setIsFocus}
        />
      </div>
      {entryDetails ? (
        <EntryDetails
          forecasts={item.q_a_forecast!.answers}
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
