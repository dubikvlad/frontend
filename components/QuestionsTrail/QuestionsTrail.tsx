import classNames from 'classnames'
import React, { CSSProperties, Dispatch, SetStateAction } from 'react'

import { QAEntriesItem, Question } from '@/api'

import styles from './QuestionsTrail.module.scss'

export function QuestionsTrail({
  questions,
  currentQuestionId,
  setCurrentQuestionId,
  entry,
  sx,
  isDeadlinePassed,
}: {
  questions: Question[]
  currentQuestionId: string | null
  setCurrentQuestionId: Dispatch<SetStateAction<string | null>>
  entry?: QAEntriesItem
  sx?: CSSProperties
  isDeadlinePassed?: boolean
}) {
  return (
    <div
      className={classNames(styles.trail, {
        [styles.disabled]: isDeadlinePassed,
      })}
      style={sx}
    >
      {questions.map((q, index) => (
        <QuestionNumberBlock
          question={q}
          index={index + 1}
          key={q.id}
          left={index >= questions.length / 2}
          active={currentQuestionId === q.id}
          answered={
            entry?.q_a_forecast?.answers.some(
              (ans) => ans.question_id === q.id,
            ) || false
          }
          setCurrentQuestionId={setCurrentQuestionId}
        />
      ))}
    </div>
  )
}

const QuestionNumberBlock = ({
  question,
  index,
  left,
  answered,
  active,
  setCurrentQuestionId,
}: {
  question: Question
  index: number
  left: boolean
  answered: boolean
  active: boolean
  setCurrentQuestionId: Dispatch<SetStateAction<string | null>>
}) => {
  return (
    <div
      className={classNames(styles.block, {
        [styles.answered]: answered,
        [styles.active]: active,
      })}
      onClick={() => setCurrentQuestionId(question.id)}
    >
      {index}
      <div className={classNames(styles.tipText, { [styles.left]: left })}>
        {question.question_title}
      </div>
    </div>
  )
}
