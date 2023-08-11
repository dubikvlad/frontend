import classNames from 'classnames'
import { useEffect, useState } from 'react'

import { api } from '@/api'
import { emailRegexp, writeErrorToState } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { Input } from '@/features/ui'
import { useMessage } from '@/helpers'

import { USER_MODAL_TYPES } from '../ModalWrapper'

import styles from './ForgotPassword.module.scss'

export function ForgotPassword() {
  const { modalType, openModal } = useOpenModal()

  const [emailValue, setEmailValue] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useMessage()

  const openSignUpModal = () =>
    openModal({ type: USER_MODAL_TYPES.CREATE_AN_ACCOUNT, props: {} })

  const openSignInModal = () =>
    openModal({ type: USER_MODAL_TYPES.SIGN_IN, props: {} })

  async function sendData() {
    try {
      setIsLoading(true)

      const res = await api.forgotPassword(emailValue)

      if (res.error) {
        if ('message' in res.error) {
          setError(res.error.message)
        }

        if ('messages' in res.error) {
          setError(res.error.getFirstMessage())
        }

        setIsLoading(false)
        return
      }

      setIsLoading(false)
      openModal({
        type: USER_MODAL_TYPES.CHECK_YOUR_EMAIL,
        props: { email: emailValue },
      })
    } catch (err) {
      setIsLoading(false)
      writeErrorToState(err, setError)
    }
  }

  useEffect(() => {
    setEmailValue('')
  }, [modalType])

  const isDisabled =
    !emailValue.trim() || !emailRegexp.test(emailValue) || isLoading

  return (
    <div className={styles.wrapper}>
      <h3>Forgot your password?</h3>

      <p className={styles.text}>
        Enter your email address, and we’ll send you a link to reset your
        password.
      </p>

      <form onSubmit={(e) => e.preventDefault()}>
        {!!error && <div className="alert alert-danger">{error}</div>}

        <Input
          value={emailValue}
          onChange={setEmailValue}
          withLabel
          placeholder="Email"
        />

        <button
          className={classNames(
            'button button-blue-light',
            styles.continueBtn,
            { disabled: isDisabled },
          )}
          onClick={() => !isDisabled && sendData()}
        >
          Continue
        </button>
      </form>

      <p className={styles.createAccountText}>
        This page assumes that you previously set up an UPool account. If you
        didn&apos;t,{' '}
        <span onClick={() => openSignUpModal()}>please do so here</span>.
      </p>

      <p
        className={styles.backToTheSignInText}
        onClick={() => openSignInModal()}
      >
        Back to the sign in
      </p>
    </div>
  )
}
