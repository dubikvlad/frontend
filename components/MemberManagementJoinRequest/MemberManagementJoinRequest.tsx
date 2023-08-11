import classNames from 'classnames'
import { useRouter } from 'next/router'

import { api } from '@/api'
import { useGetJoinRequests } from '@/helpers'

import styles from './MemberManagementJoinRequest.module.scss'

export function MemberManagementJoinRequest() {
  const {
    query: { poolId },
  } = useRouter()

  const { joinRequestsData, joinRequestsMutate } = useGetJoinRequests(
    Number(poolId),
  )
  const data = joinRequestsData?.requests ?? []

  const currentDate = new Date()

  //todo: сделать api для подтверждения и отклонения запроса
  //todo: дождаться вывода firstname, lastname, email из joinRequestsData

  async function joinToPool(userEmail: string) {
    const res = await api.pools.attachUser(Number(poolId), {
      email_or_username: userEmail,
    })

    if (!res.error) {
      joinRequestsMutate()
    }
  }

  async function declineJoinToPool(userId: number) {
    const res = await api.pools.detachUser(Number(poolId), userId)

    if (!res.error) {
      joinRequestsMutate()
    }
  }

  return (
    <div className={styles.wrapper}>
      {data.length ? (
        data.map((item, i) => {
          const daysPassed = Math.floor(
            (currentDate.getTime() - new Date(item.updated_at).getTime()) /
              (60 * 60 * 24 * 1000),
          )

          return (
            <div className={styles.row} key={i}>
              <div className={styles.nameWrapper}>
                <div className={styles.square}>
                  <p>mk</p>
                </div>
                <p>
                  <strong>{[item.first_name, item.last_name].join(' ')}</strong>{' '}
                  would like to join this pool
                </p>
              </div>
              <div>{daysPassed} days ago</div>
              <div className={styles.buttons}>
                <button
                  className={classNames('button button-green', styles.button)}
                  onClick={() => joinToPool(item.email)}
                >
                  Accept
                </button>
                <button
                  className={classNames('button button-red', styles.button)}
                  onClick={() => declineJoinToPool(item.user_id)}
                >
                  Decline
                </button>
              </div>
            </div>
          )
        })
      ) : (
        <div className={styles.noData}>You have no requests to join a pool</div>
      )}
    </div>
  )
}
