import classNames from 'classnames'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { KeyedMutator } from 'swr'

import {
  Answer,
  api,
  EntriesPoolEntriesData,
  QAEntriesItem,
  Question,
  ResponseData,
} from '@/api'

import styles from './QuestionBlock.module.scss'

export function QuestionBlock({
  index,
  question,
  entry,
  handleAddQuestionId,
  mutateEntries,
  isDeadlinePassed,
}: {
  index: number | null
  question: Question | null
  entry: QAEntriesItem
  mutateEntries: KeyedMutator<ResponseData<EntriesPoolEntriesData<'qa'>> | null>
  handleAddQuestionId: () => void
  isDeadlinePassed: boolean
}) {
  return (
    <div className={styles.questionMain}>
      <div className={isDeadlinePassed ? styles.disabled : ''}>
        <div className={styles.index}> #{(index ?? 0) + 1}</div>
        <div className={styles.title}>
          <div>{question?.question_title}</div>
        </div>
      </div>
      <AnswerBlock
        answers={question?.answers}
        entry={entry}
        question={question}
        handleAddQuestionId={handleAddQuestionId}
        mutateEntries={mutateEntries}
        isDeadlinePassed={isDeadlinePassed}
      />
    </div>
  )
}

const AnswerBlock = ({
  answers,
  question,
  entry,
  mutateEntries,
  handleAddQuestionId,
  isDeadlinePassed,
}: {
  answers?: Answer[]
  question: Question | null
  entry: QAEntriesItem
  mutateEntries: KeyedMutator<ResponseData<EntriesPoolEntriesData<'qa'>> | null>
  handleAddQuestionId: () => void
  isDeadlinePassed: boolean
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  const [error, setError] = useState<string | null>()

  const {
    query: { poolId },
  } = useRouter()

  useEffect(() => {
    const foundAnswerFromEntry = entry?.q_a_forecast?.answers.find(
      (ans) => ans.question_id === question?.id,
    )

    if (foundAnswerFromEntry) {
      setSelectedAnswer(foundAnswerFromEntry.selected_answer)
    } else {
      setSelectedAnswer(null)
    }
  }, [entry, question?.id])

  const handleSavePick = async () => {
    if (selectedAnswer && question) {
      setIsSubmitLoading(true)
      const payload = {
        forecasts: [
          { question_id: question.id, selected_answer: selectedAnswer },
        ],
      }

      const res = await api.forecasts
        .setForecasts(Number(poolId), entry.id, payload)
        .finally(() => setIsSubmitLoading(false))

      if (res) {
        if (res.error) {
          if ('message' in res.error) {
            setError(res.error.message)
          }

          if ('messages' in res.error) {
            setError(res.error.getFirstMessage())
          }

          return
        }

        setError(null)
        mutateEntries()
        handleAddQuestionId()
      }
    }
  }

  if (isDeadlinePassed)
    return (
      <div className={styles.deadlinePassed}>
        The deadline <span>has passed</span>, you can`t make a pick.
      </div>
    )

  return (
    <div className={classNames(styles.ansContainer)}>
      {answers?.map((ans, index) => (
        <div
          key={index}
          onClick={() => setSelectedAnswer(ans.answer_title)}
          className={classNames(styles.answer, {
            [styles.selected]: selectedAnswer === ans.answer_title,
          })}
        >
          <div className={styles.ansTitle}>{ans.answer_title}</div>
          <div className={styles.value}>worth {ans.answer_value} points </div>
        </div>
      ))}

      <div className={styles.btnContainer}>
        <div
          className={classNames('button button-blue', {
            disabled:
              selectedAnswer === null || isSubmitLoading || isDeadlinePassed,
          })}
          onClick={handleSavePick}
        >
          Next
        </div>
      </div>
      <div className={styles.error}>{error}</div>
    </div>
  )
}
