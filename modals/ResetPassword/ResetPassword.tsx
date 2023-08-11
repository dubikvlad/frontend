import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { api } from '@/api'
import { errR, rf, routes, writeErrorToState } from '@/config/constants'
import { RHFInput } from '@/features/ui'

import styles from './ResetPassword.module.scss'

export type ResetPasswordProps = {
  resetToken?: string
  resetEmail?: string
  isOpen?: boolean
}

type DefaultResetValues = {
  password: string
  confirm: string
}

const defaultResetValues = {
  password: '',
  confirm: '',
}

export function ResetPassword({ resetEmail, resetToken }: ResetPasswordProps) {
  const { push } = useRouter()

  const { control, handleSubmit, setError } = useForm<DefaultResetValues>({
    defaultValues: defaultResetValues,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [successfulNotification, setSuccessfulNotification] = useState('')
  const [modalError, setModalError] = useState('')

  const handleChangeRoute = () => {
    setTimeout(() => {
      push(routes.index)
    }, 3000)
  }

  const sendData = async ({ confirm, password }: DefaultResetValues) => {
    if (password !== confirm) {
      setError('confirm', { message: rf.passwordNotMatch })

      return
    }

    setIsLoading(true)

    try {
      if (resetEmail && resetToken) {
        const { error } = await api.resetPassword({
          email: resetEmail,
          password: password,
          token: resetToken,
          password_confirmation: confirm,
        })

        setIsLoading(false)

        if (error) {
          writeErrorToState(error, setModalError)
          return
        }
        setSuccessfulNotification(rf.passwordWasSuccessfullyChanged)

        handleChangeRoute()
      }
    } catch (error) {
      setIsLoading(false)
      writeErrorToState(error, setModalError)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Create a new password </div>
      <div className={styles.description}>
        Great, now come up with a new password to complete the recovery
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <RHFInput
          type="password"
          control={control}
          name="password"
          key="password"
          placeholder="Password"
          withLabel
          required={errR.required}
        />

        <RHFInput
          type="confirm-password"
          control={control}
          name="confirm"
          key="confirm"
          placeholder="Confirm"
          withLabel
          required={errR.required}
        />

        {modalError && <div className={styles.error}>{modalError}</div>}
        {successfulNotification && (
          <div className={styles.success}>{successfulNotification}</div>
        )}
        <button
          className={classNames('button button-blue', styles.button, {
            disabled: isLoading,
          })}
          onClick={() => !isLoading && handleSubmit(sendData)()}
        >
          Continue
        </button>
      </form>
    </div>
  )
}
