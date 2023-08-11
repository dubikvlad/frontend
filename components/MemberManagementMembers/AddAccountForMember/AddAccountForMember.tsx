import classNames from 'classnames'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import type { RegisterUser } from '@/api'
import { api } from '@/api'
import { RHFInput, RHFSwitcher } from '@/features/ui'

import styles from './AddAccountForMember.module.scss'

const defaultValues: RegisterUser = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
  entry_name_using: false,
  entry_name: '',
  password_confirmation: '',
}

export function AddAccountForMember({
  setShowAllMembers,
}: {
  setShowAllMembers: Dispatch<SetStateAction<boolean>>
}) {
  const [errorResponse, setErrorResponse] = useState<string>('')
  const { control, watch, setValue, getValues, handleSubmit, setError } =
    useForm({
      defaultValues,
    })

  const {
    query: { poolId },
  } = useRouter()

  const showName = watch('entry_name_using')

  async function sendData() {
    const values = getValues()

    const res = await api.registerUser(values)

    if (!!res.error) {
      if (!!res.data?.errors) {
        Object.entries(res.data?.errors).map(([key, message]) => {
          setError(key as keyof RegisterUser, { message: message[0] })
        })
      }
    } else {
      const user = res.data?.user

      const attachResult =
        user &&
        (await api.pools.attachUser(Number(poolId), {
          email_or_username: user.email,
        }))

      setShowAllMembers(true)

      if (!attachResult?.error) {
      } else {
        if ('message' in attachResult?.error) {
          setErrorResponse(attachResult.error.message)
        }
      }
    }
  }

  useEffect(() => {
    if (!showName) {
      setValue('entry_name', `${watch('first_name')} ${watch('last_name')}`)
    } else {
      setValue('entry_name', '')
    }
  }, [showName, watch(['first_name', 'last_name'])])

  return (
    <div className={styles.wrapper}>
      {errorResponse && (
        <div className={styles.error}>
          <p className={styles.errorTitle}>Something went wrong</p>
          <p>Error</p>
        </div>
      )}
      <div className={styles.forms}>
        <RHFInput
          control={control}
          placeholder="Member First Name*"
          withLabel
          required
          name="first_name"
          className={styles.form}
        />
        <RHFInput
          control={control}
          placeholder="Member Last Name*"
          withLabel
          required
          name="last_name"
          className={styles.form}
        />
        <RHFInput
          control={control}
          placeholder="Display Name*"
          withLabel
          required
          name="username"
          className={styles.form}
        />
      </div>
      <div className={styles.forms}>
        <RHFInput
          control={control}
          placeholder="Member Email Address*"
          withLabel
          required
          name="email"
          className={styles.form}
        />
        <RHFInput
          control={control}
          placeholder="Member Password*"
          withLabel
          required
          name="password"
          className={styles.form}
          onBlurEvent={() => {
            setValue('password_confirmation', watch('password'))
          }}
        />
        <RHFInput
          control={control}
          placeholder="Member Password*"
          withLabel
          required
          name="password_confirmation"
          className={styles.hideInput}
        />
      </div>
      <div className={styles.checkbox}>
        <RHFSwitcher control={control} name="entry_name_using" />
        <span>Use an entry name on reports</span>
      </div>
      <div className={styles.formsEnd}>
        <div>
          <RHFInput
            name="entry_name"
            control={control}
            placeholder="Entry Name*"
            withLabel
            required
            className={classNames({ [styles.hideInput]: !showName })}
          />
        </div>
        <div>
          <button
            className={classNames('button button-blue', styles.button)}
            onClick={handleSubmit(sendData)}
          >
            add member
          </button>
        </div>
      </div>
    </div>
  )
}
