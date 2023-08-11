import dynamic from 'next/dynamic'
import React from 'react'
import {
  UseFormSetValue,
  FieldValues,
  UseFormHandleSubmit,
} from 'react-hook-form'
import { KeyedMutator } from 'swr'

import {
  Pool,
  PoolResponse,
  PoolSettingsDataResponse,
  Question,
  ResponseData,
} from '@/api'

const QACustomEditQuestionsLazy = dynamic(
  () =>
    import('@/features/components/QACustomEditQuestions').then(
      (mod) => mod.QACustomEditQuestions,
    ),
  { loading: () => <div>Loading...</div> },
)

const QAScoringEditQuestionsLazy = dynamic(
  () =>
    import('@/features/components/QAScoringEditQuestions').then(
      (mod) => mod.QAScoringEditQuestions,
    ),
  { loading: () => <div>Loading...</div> },
)

export function SettingsEditQuestions({
  poolData,
  poolMutate,
  isCustom,
  questions,
  updateSettings,
  setValue,
  onSubmit,
  sendData,
}: {
  poolData: Pool<'qa'>
  poolMutate: KeyedMutator<ResponseData<PoolResponse<'qa'>> | null>
  isCustom?: boolean
  questions: Question[]
  setValue: UseFormSetValue<FieldValues>
  updateSettings: KeyedMutator<ResponseData<PoolSettingsDataResponse> | null>
  onSubmit: UseFormHandleSubmit<FieldValues>
  sendData: () => void
}) {
  const getCurrentEditComponent = () => {
    if (!isCustom) {
      return (
        <QAScoringEditQuestionsLazy questions={questions} setValue={setValue} />
      )
    }

    return (
      <QACustomEditQuestionsLazy
        questions={questions}
        poolData={poolData}
        poolMutate={poolMutate}
        updateSettings={updateSettings}
        setValue={setValue}
        onSubmit={onSubmit}
        sendData={sendData}
      />
    )
  }

  return (
    <div>
      <div>
        Enter the point value you would like to award for each correctly
        answered question. To exclude a question from the list altogether, enter
        0, and that question will not be shown to participants. You can also
        expand the value of each question and make each answer worth a
        multiplier times the value of the question (less or more).
      </div>
      {getCurrentEditComponent()}
    </div>
  )
}
