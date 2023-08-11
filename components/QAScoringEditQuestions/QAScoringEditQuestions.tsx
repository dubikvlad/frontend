import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { UseFormSetValue, FieldValues } from 'react-hook-form'

import { Question } from '@/api'
import { DownArrow } from '@/assets/icons'
import { Input } from '@/features/ui'

import styles from './QAScoringEditQuestions.module.scss'

export function QAScoringEditQuestions({
  questions,
  setValue,
}: {
  questions: Question[]
  setValue: UseFormSetValue<FieldValues>
}) {
  const [questionsState, setQuestionsState] = useState<Question[]>(
    () => questions,
  )

  const changeQuestion = ({
    questionId,
    value,
  }: {
    questionId: string
    value: number
  }) => {
    const foundQuestionIndex = questionsState.findIndex(
      (q) => q.id === questionId,
    )

    if (~foundQuestionIndex) {
      const questionsCopy = structuredClone(questionsState)

      if (isNaN(Number(value))) return
      questionsCopy[foundQuestionIndex].point = value

      setQuestionsState(questionsCopy)
    }
  }

  useEffect(() => {
    const newQuestions = Object.fromEntries(
      questionsState.map((question) => {
        const { id, ...restQuestion } = question

        return [id, restQuestion.point]
      }),
    )
    setValue('questions_with_points', newQuestions)
  }, [questionsState, setValue])

  return (
    <div className={styles.main}>
      {questionsState.map((q, index) => (
        <QuestionRow question={q} key={index} changeQuestion={changeQuestion} />
      ))}
    </div>
  )
}

const QuestionRow = ({
  question,
  changeQuestion,
}: {
  question: Question
  changeQuestion: ({
    questionId,
    value,
    answerIndex,
  }: {
    questionId: string
    value: number
    answerIndex?: number
  }) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.question}>
      <div className={styles.questionInner}>
        <div
          className={classNames(styles.questionTitle, styles.flex, {
            [styles.open]: isOpen,
          })}
        >
          <div
            className={classNames(styles.flex)}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <div className={styles.titleArrow}>
              <DownArrow />
            </div>
            <div className={styles.titleText}>{question.question_title}</div>
          </div>
          <div className={styles.pointInput}>
            <Input
              onChange={(value) =>
                changeQuestion({
                  questionId: question.id,
                  value: Number(value),
                })
              }
              value={question.point.toString()}
            />
          </div>
        </div>
        {isOpen && (
          <div className={styles.rowContainer}>
            {question?.answers?.map((ans, index) => (
              <div key={index} className={styles.row}>
                <div>
                  <div className={styles.point}>&#9679;</div>
                  <div>{ans.answer_title}</div>
                </div>
                <div>
                  <div className={styles.multiplier}>X</div>
                  <div className={styles.answerValue}>{ans.answer_value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
