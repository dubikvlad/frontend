import classNames from 'classnames'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { EditUserData, SportCodes, UserEmailPreferences, api } from '@/api'
import { Info } from '@/assets/icons'
import {
  leadToMonetaryDivision,
  rf,
  routes,
  sportsIconsByCode,
  writeErrorToState,
} from '@/config/constants'
import { Checkbox, RHFInput, Switcher } from '@/features/ui'
import {
  useGetPoolTypes,
  useGetSports,
  useGetUserInfo,
  useMessage,
} from '@/helpers'

import styles from './AccountPage.module.scss'

const mailPrefs: { title: string; name: UserEmailPreferences }[] = [
  { title: 'Newsletters', name: 'newsletters' },
  { title: 'Product Updates', name: 'product_updates' },
  { title: 'Season Start Notices', name: 'season_start_notices' },
  { title: 'Deals & Special Offers', name: 'deals_special_offers' },
]

type Tournaments = { [key: string]: string[] }

type FormValues = {
  first_name: string
  last_name: string
  username: string
  email: string
}

const defaultValues: FormValues = {
  first_name: '',
  last_name: '',
  username: '',
  email: '',
}

type ChangePasswordFormValues = {
  old_password: string
  password: string
  password_confirmation: string
}

const changePasswordDefaultValues: ChangePasswordFormValues = {
  old_password: '',
  password: '',
  password_confirmation: '',
}

let timeout: NodeJS.Timeout | null = null

export function AccountPage() {
  const { userInfoData, userInfoMutate } = useGetUserInfo()
  const { sportsData } = useGetSports()
  const { poolTypesData } = useGetPoolTypes()

  const {
    control,
    setValue,
    handleSubmit,
    setError: setFormError,
    watch,
  } = useForm<FormValues>({ defaultValues })

  const formValues = watch()

  const {
    control: passwordControl,
    watch: passwordWatch,
    handleSubmit: passwordHandleSubmit,
    setError: passwordSetFormError,
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormValues>({
    defaultValues: changePasswordDefaultValues,
  })

  const changePasswordFormValues = passwordWatch()

  const tournamentsObj: Tournaments | null = useMemo(() => {
    if (!sportsData.length || !poolTypesData.length) return null

    return poolTypesData.reduce<Tournaments>((acc, poolTypes) => {
      const externalId = poolTypes.sport.external_id

      if (acc[externalId]) {
        if (acc[externalId].includes(poolTypes.tournament.name)) {
          return acc
        } else {
          acc[externalId].push(poolTypes.tournament.name)
          return acc
        }
      }

      acc[externalId] = []
      acc[externalId].push(poolTypes.tournament.name)

      return acc
    }, {})
  }, [sportsData, poolTypesData])

  const [isNoEmailsWhatsoever, setIsNoEmailsWhatsoever] = useState(false)
  const [mailPrefsArr, setMailPrefsArr] = useState<
    EditUserData['user_email_preferences']
  >([])

  useEffect(() => {
    setMailPrefsArr([])
  }, [isNoEmailsWhatsoever])

  const [sportInterests, setSportInterests] = useState<SportCodes[]>([])

  useEffect(() => {
    if (userInfoData && setValue) {
      setValue('first_name', userInfoData.first_name)
      setValue('last_name', userInfoData.last_name)
      setValue('username', userInfoData.username)
      setValue('email', userInfoData.email)

      if (userInfoData.user_email_preferences?.length) {
        setMailPrefsArr(userInfoData.user_email_preferences)
      } else {
        setIsNoEmailsWhatsoever(true)
      }

      if (userInfoData.sport_interests)
        setSportInterests(userInfoData.sport_interests)
    }
  }, [userInfoData, setValue])

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useMessage()

  const alertSuccessRef = useRef<HTMLDivElement>(null)

  const [alertSuccessIsVisible, setAlertSuccessIsVisible] = useState(false)
  const [alertSuccessText, setAlertSuccessText] = useState<null | string>(null)

  const [changeYourPasswordBlockIsOpen, setChangeYourPasswordBlockIsOpen] =
    useState(false)

  const [changePasswordIsLoading, setChangePasswordIsLoading] = useState(false)
  const [changePasswordError, setChangePasswordError] = useMessage()

  if (!userInfoData) return null

  const realWallet = userInfoData.wallets.find((item) => item.type === 'real')

  function timeoutFunc() {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => setAlertSuccessIsVisible(false), 5000)
  }

  async function sendData({
    first_name,
    last_name,
    username,
    email,
  }: FormValues) {
    try {
      setIsLoading(true)

      const res = await api.editUser({
        first_name,
        last_name,
        email,
        username,
        sport_interests: sportInterests,
        user_email_preferences: mailPrefsArr,
      })

      if (!!res.data && typeof res.data === 'object' && 'errors' in res.data) {
        Object.entries(res.data.errors).forEach(([fieldName, arrValues]) => {
          if (fieldName in formValues) {
            setFormError(fieldName as keyof FormValues, {
              message: arrValues.join(' '),
            })
          }
        })
      }

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

      setAlertSuccessIsVisible(true)
      setAlertSuccessText(rf.settingsHaveBeenSuccessfullySaved)

      setIsLoading(false)
      userInfoMutate()

      if (alertSuccessRef.current) {
        window.scrollTo({ left: 0, top: 0 })
        timeoutFunc()
      }
    } catch (err) {
      setIsLoading(false)
      writeErrorToState(err, setError)
    }
  }

  // todo: добавить api запрос /change-password
  async function changePassword(data: ChangePasswordFormValues) {
    if (isChangePasswordButtonDisabled) return

    try {
      setChangePasswordIsLoading(true)

      const res = await api.changePassword({
        old_password: data.old_password,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })

      const error = res.error
      const resData = res.data

      if (!!error) {
        if ('errorsObj' in error) {
          Object.entries(error.errorsObj).map(([key, message]) => {
            passwordSetFormError(key as keyof ChangePasswordFormValues, {
              message,
            })
          })
        }

        if (!!resData) {
          if ('errors' in resData) {
            Object.entries(resData.errors).map(([key, array]) => {
              let message = ''
              array.forEach((err) => (message = message + ` ${err}`))

              passwordSetFormError(key as keyof ChangePasswordFormValues, {
                message,
              })
            })
          }
        }
        setChangePasswordIsLoading(false)
        return
      }

      setChangePasswordIsLoading(false)

      setAlertSuccessIsVisible(true)
      setAlertSuccessText(rf.passwordWasSuccessfullyChanged)

      if (alertSuccessRef.current) {
        window.scrollTo({ left: 0, top: 0 })
        timeoutFunc()
      }

      setChangeYourPasswordBlockIsOpen(false)
    } catch (err) {
      setChangePasswordIsLoading(false)
      writeErrorToState(err, setChangePasswordError)
    }
  }

  const isSaveButtonDisabled = (() => {
    const condition1 =
      userInfoData.first_name.trim() === formValues.first_name.trim() &&
      userInfoData.last_name.trim() === formValues.last_name.trim() &&
      userInfoData.username.trim() === formValues.username.trim() &&
      userInfoData.email.trim() === formValues.email.trim()

    const condition2 = isNoEmailsWhatsoever
      ? !userInfoData.user_email_preferences?.length
      : Array.isArray(userInfoData.user_email_preferences) &&
        mailPrefsArr.length === userInfoData.user_email_preferences.length &&
        userInfoData.user_email_preferences.every((item) =>
          mailPrefsArr.includes(item),
        )

    const condition3 = !userInfoData.sport_interests
      ? !sportInterests.length
      : userInfoData.sport_interests.length === sportInterests.length &&
        userInfoData.sport_interests.every((item) =>
          sportInterests.includes(item),
        )

    return condition1 && condition2 && condition3
  })()

  const isChangePasswordButtonDisabled =
    !changePasswordFormValues.old_password.trim() ||
    !changePasswordFormValues.password.trim() ||
    !changePasswordFormValues.password_confirmation.trim() ||
    changePasswordIsLoading

  return (
    <div className={styles.wrapper}>
      <div
        ref={alertSuccessRef}
        className={classNames('alert alert-success', styles.alertSuccess, {
          [styles.alertSuccessVisible]: alertSuccessIsVisible,
        })}
      >
        <p className="alert-title">{alertSuccessText}</p>
      </div>

      <h1>Edit account</h1>

      <div className={styles.accountInfoWrapper}>
        <div className={styles.mainInformationWrapper}>
          <p className={styles.mainInformationTitle}>Main Information</p>

          <div className={styles.mainInformationForm}>
            {!!error && <div className="alert alert-danger">{error}</div>}

            <div className={styles.twoColumn}>
              <RHFInput
                control={control}
                name="first_name"
                placeholder="First Name"
                withLabel
                required
              />

              <RHFInput
                control={control}
                name="last_name"
                placeholder="Last Name"
                withLabel
                required
              />
            </div>

            <RHFInput
              control={control}
              name="username"
              placeholder="Username"
              withLabel
              required
            />

            <RHFInput
              type="email"
              control={control}
              name="email"
              placeholder="Email"
              withLabel
              required
            />

            {!changeYourPasswordBlockIsOpen ? (
              <p
                className={styles.resetPasswordBtn}
                onClick={() => setChangeYourPasswordBlockIsOpen(true)}
              >
                Change your password here
              </p>
            ) : (
              <div className={styles.changePasswordWrapper}>
                {!!changePasswordError && (
                  <div className="alert alert-danger">
                    {changePasswordError}
                  </div>
                )}

                <RHFInput
                  type="password"
                  control={passwordControl}
                  name="old_password"
                  placeholder="Current Password"
                  withLabel
                  required
                />

                <RHFInput
                  type="password"
                  control={passwordControl}
                  name="password"
                  placeholder="New Password"
                  withLabel
                  required
                />

                <RHFInput
                  type="password"
                  control={passwordControl}
                  name="password_confirmation"
                  placeholder="Repeat the new password"
                  withLabel
                  required
                />

                <div className={styles.changePasswordBtnWrapper}>
                  <button
                    className={classNames('button button-red-outline', {
                      disabled: changePasswordIsLoading,
                    })}
                    onClick={() => (
                      setChangeYourPasswordBlockIsOpen(false),
                      resetPasswordForm()
                    )}
                  >
                    Cancel
                  </button>

                  <button
                    className={classNames('button button-blue-light', {
                      disabled: isChangePasswordButtonDisabled,
                    })}
                    onClick={passwordHandleSubmit(changePassword)}
                  >
                    Change password
                  </button>
                </div>
              </div>
            )}

            <div className={styles.emailPreferencesWrapper}>
              <p className={styles.emailPreferencesTitle}>Email Preferences</p>

              <Switcher
                value={isNoEmailsWhatsoever}
                onChange={setIsNoEmailsWhatsoever}
              />

              <p className={styles.noEmailsWhatsoeverText}>
                No Emails Whatsoever
              </p>

              <div className={styles.infoWrapper}>
                <Info />

                <p className={styles.info}>
                  Select <span>&apos;No Emails Whatsoever&apos;</span> in the
                  &apos;Manage Entries&apos; portion of any specific pool to not
                  receive pick reminder emails even if you opted for the pool.
                  If not, you still receive password reset requests and other
                  transactional emails.
                </p>
              </div>
            </div>

            <div
              className={classNames(styles.mailPrefsWrapper, {
                [styles.mailPrefsWrapperHide]: isNoEmailsWhatsoever,
              })}
            >
              {mailPrefs.map((item) => (
                <Checkbox
                  key={item.name}
                  value={mailPrefsArr.includes(item.name)}
                  onChange={() =>
                    setMailPrefsArr((prev) => {
                      if (prev.includes(item.name)) {
                        const arr = [...prev]
                        arr.splice(prev.indexOf(item.name), 1)
                        return arr
                      } else {
                        return [...prev, item.name]
                      }
                    })
                  }
                >
                  {item.title}
                </Checkbox>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.balanceAndSportInterestWrapper}>
          <div className={styles.balanceWrapper}>
            <p className={styles.balanceTitle}>Actual balance</p>
            <div className={styles.balanceValueWrapper}>
              <p className={styles.balanceValue}>
                $
                {realWallet
                  ? leadToMonetaryDivision(realWallet.amount)
                  : '0.00'}
              </p>
              <Link
                className={styles.replenishText}
                href={routes.account.replenish()}
              >
                Replenish
              </Link>
            </div>
          </div>

          <div className={styles.sportInterestsWrapper}>
            <p className={styles.sportTitle}>Sport Interests</p>

            <div className={styles.sportList}>
              {sportsData.map((sport) => {
                const Icon = sportsIconsByCode[sport.sport_code]

                return (
                  <div
                    key={sport.id}
                    className={classNames(styles.sportItem, {
                      [styles.sportItemActive]: sportInterests.includes(
                        sport.sport_code,
                      ),
                    })}
                    onClick={() =>
                      setSportInterests((prev) => {
                        if (prev.includes(sport.sport_code)) {
                          const arr = [...prev]
                          arr.splice(prev.indexOf(sport.sport_code), 1)
                          return arr
                        } else {
                          return [...prev, sport.sport_code]
                        }
                      })
                    }
                  >
                    <div>{!!Icon && <Icon />}</div>

                    <div className={styles.sportWrapper}>
                      <p className={styles.sportName}>{sport.name}</p>
                      {tournamentsObj !== null &&
                        tournamentsObj[sport.external_id] && (
                          <p className={styles.tournamentText}>
                            {tournamentsObj[sport.external_id].join(', ')}
                          </p>
                        )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <button
        className={classNames('button button-blue-light', styles.saveButton, {
          disabled: isLoading || isSaveButtonDisabled,
        })}
        onClick={handleSubmit(sendData)}
      >
        Save
      </button>
    </div>
  )
}
