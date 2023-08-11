import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { api } from '@/api'
import { Input } from '@/features/ui'

import styles from './UserHasAccount.module.scss'

export function UserHasAccount() {
  const {
    query: { poolId },
  } = useRouter()

  const [input, setInput] = useState('')

  async function attachUser() {
    await api.pools.attachUser(Number(poolId), {
      email_or_username: input,
    })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <Input
          withLabel
          placeholder="Member Email Address or Username"
          value={input}
          onChange={setInput}
          className={styles.input}
        />

        <button
          className={classNames('button button-blue', styles.button)}
          onClick={attachUser}
        >
          add member
        </button>
      </div>
    </div>
  )
}
