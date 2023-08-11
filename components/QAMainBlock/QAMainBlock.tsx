import { useRouter } from 'next/router'
import React, { useState, useEffect, useMemo, CSSProperties } from 'react'
import { KeyedMutator } from 'swr'

import {
  Pool,
  QAEntriesItem,
  ResponseData,
  EntriesPoolEntriesData,
} from '@/api'
import { handlingDeadline, routes } from '@/config/constants'

import { QuestionBlock } from '../QuestionBlock'
import { QuestionsTrail } from '../QuestionsTrail'

import styles from './QAMainBlock.module.scss'

export function QAMainBlock({
  poolData,
  currentEntry,
  mutateEntries,
  sx,
}: {
  poolData: Pool<'qa'>
  currentEntry: QAEntriesItem | null
  mutateEntries: KeyedMutator<ResponseData<EntriesPoolEntriesData<'qa'>> | null>
  sx?: CSSProperties
}) {
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null,
  )

  const { push } = useRouter()

  useEffect(() => {
    if (poolData.pick_pool.questions_with_points.length) {
      setCurrentQuestionId(poolData.pick_pool.questions_with_points[0].id)
    }
  }, [poolData.pick_pool.questions_with_points])

  const handleChangeQuestionId = () => {
    const foundQuestionIndex =
      poolData.pick_pool.questions_with_points.findIndex(
        (q) => currentQuestionId === q.id,
      )

    if (~foundQuestionIndex) {
      if (
        foundQuestionIndex ===
        poolData.pick_pool.questions_with_points.length - 1
      ) {
        push(routes.account.overview(poolData.id))
        return
      }
      setCurrentQuestionId(
        poolData.pick_pool.questions_with_points[foundQuestionIndex + 1].id,
      )
    }
  }

  const [currentQuestion, currentQuestionIndex] = useMemo(() => {
    if (currentQuestionId) {
      const foundIndex = poolData.pick_pool.questions_with_points.findIndex(
        (q) => q.id === currentQuestionId,
      )

      if (~foundIndex) {
        return [
          poolData.pick_pool.questions_with_points[foundIndex],
          foundIndex,
        ]
      }
      return [null, null]
    }

    return [null, null]
  }, [currentQuestionId, poolData.pick_pool.questions_with_points])

  const deadline = handlingDeadline(poolData.pick_pool.pick_deadline)
  const isDeadlinePassed = deadline === 'PASSED'

  if (!currentEntry) return null

  if (!poolData.pick_pool.questions_with_points.length)
    return <NoQuestionsBlock />

  return (
    <div style={sx}>
      <QuestionsTrail
        currentQuestionId={currentQuestionId}
        questions={poolData.pick_pool.questions_with_points}
        setCurrentQuestionId={setCurrentQuestionId}
        entry={currentEntry}
        sx={{ marginBottom: '10px' }}
        isDeadlinePassed={isDeadlinePassed}
      />
      <QuestionBlock
        question={currentQuestion}
        index={currentQuestionIndex}
        entry={currentEntry}
        handleAddQuestionId={handleChangeQuestionId}
        mutateEntries={mutateEntries}
        isDeadlinePassed={isDeadlinePassed}
      />
    </div>
  )
}

const NoQuestionsBlock = () => (
  <div className={styles.container}>
    There are <span>no questions</span> in this pool. Please contact your
    commissioner.
  </div>
)
