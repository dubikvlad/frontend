import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

import { api, InviteUsersData } from '@/api'
import { Cross, Facebook, Twitter } from '@/assets/icons'
import { emailRegexp } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { Input, RHFInput } from '@/features/ui'
import { useGetUser, useMessage, usePool } from '@/helpers'

import styles from './InviteMembers.module.scss'

export function InviteMembers() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))
  const { userData } = useGetUser()

  const { modalType } = useOpenModal()

  const { control, getValues, resetField, reset } = useForm<{
    [key: string]: string
  }>({
    defaultValues: {},
  })

  // при изменении видимости модального окна
  // будут сбрасываться состояния
  useEffect(() => {
    reset({})
    setValue('')
    setEmails([])
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalType])

  const [value, setValue] = useState('')
  const [valueError, setValueError] = useState('')

  const [emails, setEmails] = useState<InviteUsersData['emails']>([])

  const [error, setError] = useState('')
  const [message, setMessage] = useMessage()

  const emailsWrapperRef = useRef<HTMLDivElement>(null)
  const [isScroll, setIsScroll] = useState(false)

  useEffect(() => {
    const current = emailsWrapperRef.current

    if (current) {
      setIsScroll(current.scrollHeight > current.clientHeight)
    }
  }, [emails, emailsWrapperRef])

  const [isLoading, setIsLoading] = useState(false)

  const addToEmailList = useCallback(() => {
    const valuesArr = value
      .split(',')
      .map((email) => email.trim())
      .filter((email) => !!email.trim())

    // проверка на правильность написания email
    if (valuesArr.filter((email) => !emailRegexp.test(email)).length) {
      setValueError('Invalid email')
      return
    }
    setValueError('')

    const emailsList = valuesArr
      .map((email) => ({
        email,
        name: email.split('@')[0],
      }))
      .filter(
        (emailObj) => !emails.find((item) => item.email === emailObj.email),
      )

    setEmails((prev) => [...prev, ...emailsList])
    setValue('')
  }, [emails, value])

  // если значение инпута будет содержать в тексте запятую,
  // то тогда сработает функция добавления email в список
  useEffect(() => {
    if (value.includes(',')) addToEmailList()
  }, [value, addToEmailList])

  async function inviteUsers() {
    if (!userData) return

    try {
      setIsLoading(true)

      const formValues = getValues()
      const emailsArr = emails.map((item) => {
        const name: string | undefined =
          formValues[item.email.replace(/\./, '_')]

        return {
          email: item.email,
          name: !!name?.trim() ? name.trim() : item.name,
        }
      })

      const res = await api.pools.inviteUsers(Number(poolId), {
        exists_users: [],
        emails: emailsArr,
      })

      if (!res.error) {
        setError('')
        setMessage('Invites sent successfully')
        setEmails([])
      } else {
        if ('message' in res.error) setError(res.error.message)
        if ('messages' in res.error) setError(res.error.getFirstMessage())
      }

      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
    }
  }

  function removeEmailFromList(fieldKey: string, currentEmail: string) {
    setEmails((prev) => prev.filter((item) => item.email !== currentEmail))
    if (getValues()[fieldKey]) resetField(fieldKey)
  }

  const isPublic = !!poolData?.is_public

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Invite your friends </h3>

      <p className={styles.subtitle}>
        Directly invite your friends using email
      </p>

      {error && (
        <div className={classNames('alert alert-danger', styles.alert)}>
          {error}
        </div>
      )}

      <Input
        value={value}
        onChange={setValue}
        placeholder="Enter emails here separated by comma or Enter button"
        withLabel
        className={styles.input}
        onKeyDown={(e) => String(e.key) === 'Enter' && addToEmailList()}
        error={valueError}
      />

      <div
        className={classNames(styles.inputsWrapper, {
          [styles.inputsWrapperScroll]: isScroll,
        })}
        ref={emailsWrapperRef}
      >
        {emails.map((emailObj) => {
          const fieldKey = emailObj.email.replace(/\./, '_')

          return (
            <div className={styles.row} key={emailObj.email}>
              <div className={styles.emailTextWrapper}>
                <p className={styles.emailText}>{emailObj.email}</p>
                <div
                  className={styles.crossIcon}
                  onClick={() => removeEmailFromList(fieldKey, emailObj.email)}
                >
                  <Cross />
                </div>
              </div>

              <RHFInput
                control={control}
                name={fieldKey}
                placeholder="Name"
                defaultValue={emailObj.name}
                required
              />
            </div>
          )
        })}
      </div>

      {!!message && (
        <p className={styles.successText}>
          {message ?? 'Invites sent successfully'}
        </p>
      )}

      <button
        className={classNames('button', 'button-blue-light', styles.button, {
          disabled: isLoading || !emails.length,
        })}
        onClick={inviteUsers}
      >
        Send Invites
      </button>

      {isPublic && (
        <>
          <div className={styles.or}>
            <p>Or</p>
          </div>

          <div className={styles.socialWrapper}>
            <div className={styles.twitter}>
              <Twitter />
              <p>Tweet</p>
            </div>

            <div className={styles.facebook}>
              <Facebook />
              <p>Share on Facebook</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
