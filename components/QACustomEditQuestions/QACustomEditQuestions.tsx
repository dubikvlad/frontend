/* eslint-disable react-hooks/exhaustive-deps */
import classNames from 'classnames'
import { useState, useEffect, memo, Dispatch, SetStateAction } from 'react'
import {
  UseFormSetValue,
  FieldValues,
  UseFormHandleSubmit,
} from 'react-hook-form'
import { KeyedMutator } from 'swr'

import {
  Pool,
  ResponseData,
  PoolResponse,
  Question,
  api,
  Answer,
  PoolSettingsDataResponse,
} from '@/api'
import { DownArrow, Trashcan } from '@/assets/icons'
import { handlingDeadline } from '@/config/constants'
import { Input } from '@/features/ui'

import styles from './QACustomEditQuestions.module.scss'

type ChangeAnswerData = { questionId: string; answerIndex: number } & (
  | { field: 'answer_title'; value: string }
  | { field: 'answer_value'; value: number }
)

type ChangeQuestionData = { questionId: string; answerIndex?: never } & (
  | { field: 'question_title'; value: string }
  | { field: 'point'; value: number }
)

type Stage = 'edit' | 'correct'

export const QACustomEditQuestions = ({
  poolData,
  questions,
  updateSettings,
  setValue,
  onSubmit,
  sendData,
}: {
  poolData: Pool<'qa'>
  poolMutate: KeyedMutator<ResponseData<PoolResponse<'qa'>> | null>
  questions?: Question[]
  updateSettings: KeyedMutator<ResponseData<PoolSettingsDataResponse> | null>
  setValue: UseFormSetValue<FieldValues>
  onSubmit: UseFormHandleSubmit<FieldValues>
  sendData: () => void
}) => {
  const [questionsData, setQuestionsData] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>('edit')

  const deadline = handlingDeadline(poolData.pick_pool.pick_deadline)

  const getCurrentStage = () => {
    if (deadline === 'PASSED') {
      return (
        <QuestionCorrectChangeBlock
          questionsData={questionsData}
          setQuestionsData={setQuestionsData}
          onSubmit={onSubmit}
          sendData={sendData}
          setStage={setStage}
          passed
        />
      )
    }

    switch (stage) {
      case 'edit':
        return (
          <QuestionChangeBlock
            isLoading={isLoading}
            poolData={poolData}
            questionsData={questionsData}
            setError={setError}
            setIsLoading={setIsLoading}
            setQuestionsData={setQuestionsData}
            updateSettings={updateSettings}
            setStage={setStage}
          />
        )
      case 'correct':
        return (
          <QuestionCorrectChangeBlock
            questionsData={questionsData}
            setQuestionsData={setQuestionsData}
            onSubmit={onSubmit}
            sendData={sendData}
            setStage={setStage}
          />
        )
    }
  }

  useEffect(() => {
    if (questions && questions.length) {
      if (questions.length > questionsData.length && questionsData.length) {
        const slicedQuestions = questions.slice(questionsData.length)
        setQuestionsData((prev) => [...prev, ...slicedQuestions])
      } else if (questions.length < questionsData.length) {
        setQuestionsData(questions.slice(0, questions.length))
      } else {
        setQuestionsData(questions)
      }
    } else {
      setQuestionsData([])
    }
  }, [questions])

  useEffect(() => {
    const newQuestions = questionsData.map((question) => {
      const { id: _, ...restQuestion } = question

      return {
        ...restQuestion,
        answers: restQuestion.answers.map((ans) => ({
          ...ans,
          is_right: false,
        })),
      }
    })
    setValue('questions', newQuestions)
  }, [questionsData, setValue])

  return (
    <div className={styles.questionsMain}>
      {getCurrentStage()}
      <div className={styles.error}>{error}</div>
    </div>
  )
}

const QuestionCorrectChangeBlock = ({
  questionsData,
  setQuestionsData,
  onSubmit,
  sendData,
  setStage,
  passed,
}: {
  setQuestionsData: Dispatch<SetStateAction<Question[]>>
  questionsData: Question[]
  sendData: () => void
  onSubmit: UseFormHandleSubmit<FieldValues>
  setStage: Dispatch<SetStateAction<Stage>>
  passed?: boolean
}) => {
  const changeCorrectAnswer = (questionId: string, answerIndex: number) => {
    const questionsCopy = structuredClone(questionsData)
    const foundQuestionIndex = questionsCopy.findIndex(
      (q) => q.id === questionId,
    )

    if (~foundQuestionIndex) {
      questionsCopy[foundQuestionIndex].answers = questionsCopy[
        foundQuestionIndex
      ].answers.map((ans) => ({ ...ans, right: false }))
      questionsCopy[foundQuestionIndex].answers[answerIndex].right = true

      setQuestionsData(questionsCopy)
    }
  }

  return (
    <>
      <div className={styles.upperTitleContainer}>
        <div className={styles.upperTitle}>
          <div>Questions</div>
          {!passed ? (
            <div className={styles.backLink} onClick={() => setStage('edit')}>
              Back to edit
            </div>
          ) : null}
        </div>
      </div>
      {questionsData.map((q, index) => (
        <EditCorrectQuestionBlock
          key={index}
          index={index + 1}
          question={q}
          changeCorrectAnswer={changeCorrectAnswer}
        />
      ))}
      <div className={styles.buttonWrapper}>
        <div>
          <button className={styles.buttonBig} onClick={onSubmit(sendData)}>
            Recalculate
          </button>
        </div>
      </div>
    </>
  )
}

const EditCorrectQuestionBlock = memo(function EditQuestionBlockToMemo({
  question,
  index,
  changeCorrectAnswer,
}: {
  question: Question
  index: number
  changeCorrectAnswer: (questionId: string, answerIndex: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={classNames(styles.question, styles.correct)}>
      <div className={styles.titleBlock}>
        <div className={styles.title}>Question #{index}</div>
      </div>
      <div className={styles.main}>
        <div
          className={classNames(styles.box, styles.title)}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <div>
            <DownArrow /> {question.question_title}
          </div>
          <div>{question.point} points</div>
        </div>

        {isExpanded
          ? question?.answers?.map((ans, index) => (
              <AnswerRowChangeCorrect
                key={index}
                answer={ans}
                changeCorrectAnswer={changeCorrectAnswer}
                index={index}
                question={question}
              />
            ))
          : null}
      </div>
    </div>
  )
})

const AnswerRowChangeCorrect = ({
  index,
  question,
  answer,
  changeCorrectAnswer,
}: {
  index: number
  question: Question
  answer: Answer
  changeCorrectAnswer: (questionId: string, answerIndex: number) => void
}) => {
  return (
    <div
      className={classNames(styles.questionInputContainer, {
        [styles.correct]: answer.right,
      })}
      onClick={() => changeCorrectAnswer(question.id, index)}
    >
      <div>
        <div className={styles.point}>&#9679;</div>
        <div>{answer.answer_title}</div>
      </div>
      <div>
        <div>X</div>
        <div>{answer.answer_value}</div>
      </div>
    </div>
  )
}

const QuestionChangeBlock = ({
  questionsData,
  setQuestionsData,
  isLoading,
  setIsLoading,
  updateSettings,
  poolData,
  setError,
  setStage,
}: {
  setQuestionsData: Dispatch<SetStateAction<Question[]>>
  questionsData: Question[]
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
  updateSettings: KeyedMutator<ResponseData<PoolSettingsDataResponse> | null>
  poolData: Pool<'qa'>
  setError: Dispatch<SetStateAction<string | null>>
  setStage: Dispatch<SetStateAction<Stage>>
}) => {
  const deleteQuestion = (questionId: string) => {
    if (isLoading) return

    setIsLoading(true)

    api.qa
      .removeQuestion(poolData.id, questionId)
      .then(() => updateSettings())
      .finally(() => setIsLoading(false))
  }

  const changeQuestion = ({
    questionId,
    field,
    value,
    answerIndex,
  }: ChangeAnswerData | ChangeQuestionData) => {
    const foundQuestionIndex = questionsData.findIndex(
      (q) => q.id === questionId,
    )

    if (~foundQuestionIndex) {
      const questionsCopy = structuredClone(questionsData)

      if (answerIndex !== undefined) {
        if (field === 'answer_title') {
          questionsCopy[foundQuestionIndex].answers[answerIndex].answer_title =
            value
        }

        if (field === 'answer_value') {
          if (isNaN(Number(value))) return

          questionsCopy[foundQuestionIndex].answers[answerIndex].answer_value =
            value
        }
      } else {
        if (field === 'question_title') {
          questionsCopy[foundQuestionIndex].question_title = value
        }

        if (field === 'point') {
          if (isNaN(Number(value))) return
          questionsCopy[foundQuestionIndex].point = value
        }
      }

      setQuestionsData(questionsCopy)
    }
  }

  const addNewAnswer = (questionId: string) => {
    const newAnswer: Answer = {
      answer_title: '',
      answer_value: 1,
      right: false,
    }

    const questionsCopy = structuredClone(questionsData)

    const foundQuestionIndex = questionsCopy.findIndex(
      (q) => q.id === questionId,
    )
    if (questionsCopy[foundQuestionIndex].answers) {
      questionsCopy[foundQuestionIndex].answers.push(newAnswer)
    } else {
      questionsCopy[foundQuestionIndex].answers = [newAnswer]
    }
    setQuestionsData(questionsCopy)
  }

  const removeAnswer = (questionId: string, answerIndex: number) => {
    const questionsCopy = structuredClone(questionsData)
    const foundQuestion = questionsCopy.find((q) => q.id === questionId)

    if (foundQuestion) {
      foundQuestion.answers.splice(answerIndex, 1)
      setQuestionsData(questionsCopy)
    }
  }

  const addNewQuestion = () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    const questionPayload: Pick<
      Question,
      'answers' | 'point' | 'question_title'
    > = {
      answers: [],
      point: 1,
      question_title: `Question ${questionsData.length + 1}`,
    }

    api.qa
      .addQuestion(poolData.id, questionPayload)
      .then(() => updateSettings())
      .finally(() => setIsLoading(false))
  }

  return (
    <>
      <div className={styles.upperTitleContainer}>
        <div className={styles.upperTitle}>Questions</div>
      </div>
      {questionsData.map((q, index) => (
        <EditQuestionBlock
          key={index}
          index={index + 1}
          question={q}
          changeQuestion={changeQuestion}
          addNewAnswer={addNewAnswer}
          deleteQuestion={deleteQuestion}
          removeAnswer={removeAnswer}
        />
      ))}
      <div className={styles.addNewOption} onClick={addNewQuestion}>
        <span>+ </span>
        <span>Add new question</span>
      </div>
      <div className={styles.buttonWrapper}>
        <div>
          <button
            className={styles.buttonBig}
            onClick={() => setStage('correct')}
          >
            Save changes
          </button>
        </div>
      </div>
    </>
  )
}

const EditQuestionBlock = memo(function EditQuestionBlockToMemo({
  question,
  index,
  changeQuestion,
  addNewAnswer,
  deleteQuestion,
  removeAnswer,
}: {
  question: Question
  index: number
  changeQuestion: ({
    questionId,
    field,
    value,
  }: ChangeAnswerData | ChangeQuestionData) => void
  addNewAnswer: (questionId: string) => void
  deleteQuestion: (questionId: string) => void
  removeAnswer: (questionId: string, answerIndex: number) => void
}) {
  return (
    <div className={styles.question}>
      <div className={styles.titleBlock}>
        <div className={styles.title}>Question #{index}</div>
        <div
          className={styles.deleteButton}
          onClick={() => deleteQuestion(question.id)}
        >
          <div className={styles.svgContainer}>
            <Trashcan width={18} />
          </div>
          <span>Delete Question</span>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.box}>
          <Input
            onChange={(v) =>
              changeQuestion({
                field: 'question_title',
                questionId: question.id,
                value: v,
              })
            }
            value={question.question_title}
            withLabel
            placeholder="Question*"
          />
          <Input
            onChange={(v) =>
              changeQuestion({
                field: 'point',
                questionId: question.id,
                value: Number(v),
              })
            }
            value={question.point.toString()}
            withLabel
            placeholder="Points per question*"
          />
        </div>

        {question?.answers?.map((ans, index) => (
          <AnswerRow
            key={index}
            answer={ans}
            changeQuestion={changeQuestion}
            index={index}
            question={question}
            removeAnswer={removeAnswer}
          />
        ))}
        <div
          className={styles.addNewOption}
          onClick={() => addNewAnswer(question.id)}
        >
          <span>+ </span>
          <span>Add new option</span>
        </div>
      </div>
    </div>
  )
})

const AnswerRow = ({
  changeQuestion,
  index,
  question,
  answer,
  removeAnswer,
}: {
  changeQuestion: ({
    questionId,
    field,
    value,
  }: ChangeAnswerData | ChangeQuestionData) => void
  index: number
  question: Question
  answer: Answer
  removeAnswer: (questionId: string, answerIndex: number) => void
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={styles.box}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.questionInputContainer}>
        {isHovered ? (
          <div
            className={styles.cross}
            onClick={() => removeAnswer(question.id, index)}
          >
            &#215;
          </div>
        ) : (
          <div className={styles.point}>&#9679;</div>
        )}
        <Input
          onChange={(v) =>
            changeQuestion({
              field: 'answer_title',
              questionId: question.id,
              value: v,
              answerIndex: index,
            })
          }
          value={answer.answer_title}
          withLabel
          placeholder={`Option ${index + 1}*`}
        />
      </div>
      <Input
        onChange={(v) =>
          changeQuestion({
            field: 'answer_value',
            questionId: question.id,
            value: Number(v),
            answerIndex: index,
          })
        }
        value={answer.answer_value.toString()}
        withLabel
        placeholder="Multiplier*"
      />
    </div>
  )
}
