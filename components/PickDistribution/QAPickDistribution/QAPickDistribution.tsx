import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'

import { Pool } from '@/api'
import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import { useGetPickSummary } from '@/helpers'

const QuestionsTrailLazy = dynamic(
  () => import('@/features/components').then((mod) => mod.QuestionsTrail),
  { loading: () => <p>Loading...</p> },
)

import styles from './QAPickDistribution.module.scss'

export function QAPickDistribution({ poolData }: { poolData: Pool<'qa'> }) {
  const {
    query: { poolId },
  } = useRouter()

  const { pickSummaryData: data } = useGetPickSummary(Number(poolId))

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null,
  )

  const pickSummaryData = useMemo(() => {
    if (data && data.stats && Array.isArray(data?.stats)) {
      return [...data.stats]
    }

    return []
  }, [data])

  useEffect(() => {
    if (pickSummaryData.length) {
      setCurrentQuestionId(pickSummaryData[0].id)
    }
  }, [pickSummaryData])

  const currentQuestion = useMemo(() => {
    if (currentQuestionId) {
      const foundIndex = pickSummaryData.findIndex(
        (q) => q.id === currentQuestionId,
      )

      if (~foundIndex) {
        return {
          data: pickSummaryData[foundIndex],
          index: foundIndex,
        }
      }
    }
  }, [currentQuestionId, pickSummaryData])

  if (!currentQuestion)
    return (
      <div className={styles.notFound}>
        Unfortunately, we did not find any suitable entries
      </div>
    )

  const disabledPrevBtn = currentQuestion.index === 0

  const disabledNextBtn = currentQuestion.index + 1 === pickSummaryData.length

  function changeQuestionId(action: 'prev' | 'next') {
    if (currentQuestion) {
      if (!disabledPrevBtn && action === 'prev') {
        setCurrentQuestionId(pickSummaryData[--currentQuestion.index].id)
      }
      if (!disabledNextBtn && action === 'next') {
        setCurrentQuestionId(pickSummaryData[++currentQuestion.index].id)
      }
    }
  }

  return (
    <>
      {!(new Date() < new Date(poolData.pick_pool.pick_deadline)) ? (
        <div className={styles.container}>
          <QuestionsTrailLazy
            currentQuestionId={currentQuestionId}
            questions={poolData.pick_pool.questions_with_points}
            setCurrentQuestionId={setCurrentQuestionId}
            sx={{ marginBottom: '10px' }}
          />
          <div className={styles.main}>
            <div className={styles.questionBlock}>
              <div className={styles.index}>#{currentQuestion.index + 1}</div>
              <div className={styles.title}>
                {currentQuestion?.data.question_title}
              </div>
            </div>
            <div className={styles.answersBlock}>
              <div className={styles.actions}>
                <p
                  className={classNames(styles.next, {
                    [styles.disabled]: disabledPrevBtn,
                  })}
                  onClick={() => changeQuestionId('prev')}
                >
                  <MonthLeftArrow />
                  Previous
                </p>
                <p
                  className={classNames(styles.next, {
                    [styles.disabled]: disabledNextBtn,
                  })}
                  onClick={() => changeQuestionId('next')}
                >
                  Next
                  <MonthRightArrow />
                </p>
              </div>
              <div className={styles.answers}>
                {'answers' in currentQuestion.data ? (
                  <>
                    {currentQuestion &&
                      currentQuestion.data.answers.map((answer, i) => {
                        const pickPercent = (
                          (answer.pick_count /
                            currentQuestion.data.total_pick_count) *
                          100
                        ).toFixed()

                        return (
                          <div key={i} className={styles.answer}>
                            <p>{answer.title}</p>
                            <div
                              className={styles.scale}
                              style={{
                                background: `linear-gradient(to right, var(--win-color-2) ${pickPercent}%, var(--border-color) ${pickPercent}%)`,
                              }}
                            >
                              <p
                                className={styles.pickCount}
                                style={{
                                  right: `${100 - Number(pickPercent) + 5}%`,
                                }}
                              >
                                {answer.pick_count}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                  </>
                ) : (
                  <>None of the members have answered this question yet.</>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.notFound}>
          This pick summary is not available until after the pick deadline
          passes and picks are no longer able to be made or changed.
        </div>
      )}
    </>
  )
}
