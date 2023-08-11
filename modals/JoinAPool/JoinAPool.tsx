import classNames from 'classnames'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import qs from 'qs'
import { useState } from 'react'

import { api } from '@/api'
import { routes } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { Input } from '@/features/ui'
import { useGetUser } from '@/helpers'

import styles from './JoinAPool.module.scss'

const {
  publicRuntimeConfig: { appUrl },
} = getConfig()

export function JoinAPool() {
  const { push } = useRouter()
  const { userData } = useGetUser()

  const [value, setValue] = useState('')

  const { closeModal } = useOpenModal()

  const [isLoading, setIsLoading] = useState(false)

  async function joinPool() {
    if (!userData) return

    try {
      setIsLoading(true)

      const { pool_id, password } = qs.parse(value.split('?')[1])

      const res = await api.pools.join({
        pool_id: Number(pool_id),
        code: String(password),
        name: `${userData.username} #1`,
      })

      if (!res.error) {
        push(routes.account.overview(Number(pool_id)))
        closeModal()
      }

      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
    }
  }

  const isValidString =
    value.includes(`${appUrl}/attach`) &&
    value.includes('pool_id') &&
    value.includes('password')

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Join a pool</h3>

      <p className={styles.subtitle}>
        Enter referral link below to join your friend&apos;s pool and enjoy it
      </p>

      <Input
        value={value}
        onChange={setValue}
        placeholder="Join link"
        withLabel
        className={styles.input}
      />

      <button
        className={classNames('button', 'button-blue-light', styles.button, {
          disabled: isLoading || !isValidString,
        })}
        onClick={joinPool}
      >
        Join
      </button>
    </div>
  )
}
