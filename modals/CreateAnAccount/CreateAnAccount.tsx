/* eslint-disable @typescript-eslint/no-explicit-any */
import classNames from 'classnames'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { Control, UseFormHandleSubmit, useForm } from 'react-hook-form'
import { IResolveParams } from 'reactjs-social-login'

import { LoginSocialNetworkData, api } from '@/api'
import { Facebook, Twitter, Google, Instagram } from '@/assets/icons'
import { errR, rf, routes, writeErrorToState } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { SignInMdTabs } from '@/features/components'
import { RHFCheckbox, RHFInput } from '@/features/ui'
import { useAuth, useMessage } from '@/helpers'
import { useGetSocialNetworks } from '@/helpers/hooks/useGetSocialNetworks'

import { USER_MODAL_TYPES } from '../ModalWrapper'

import styles from './CreateAnAccount.module.scss'

const LoginSocialGoogle = dynamic(
  () => import('reactjs-social-login').then((mod) => mod.LoginSocialGoogle),
  {
    ssr: false,
  },
)

const LoginSocialTwitter = dynamic(
  () => import('reactjs-social-login').then((mod) => mod.LoginSocialTwitter),
  {
    ssr: false,
  },
)

const LoginSocialFacebook = dynamic(
  () => import('reactjs-social-login').then((mod) => mod.LoginSocialFacebook),
  {
    ssr: false,
  },
)

const LoginSocialInstagram = dynamic(
  () => import('reactjs-social-login').then((mod) => mod.LoginSocialInstagram),
  {
    ssr: false,
  },
)

const { publicRuntimeConfig } = getConfig()

const socialLinks = [
  {
    name: 'Facebook',
    icon: Facebook,
    social: LoginSocialFacebook,
    app_id: publicRuntimeConfig.facebookAppId,
  },
  {
    name: 'Twitter',
    icon: Twitter,
    social: LoginSocialTwitter,
    client_id: publicRuntimeConfig.twitterV2ClientId,
  },
  {
    name: 'Google',
    icon: Google,
    social: LoginSocialGoogle,
    client_id: publicRuntimeConfig.googleClientId,
  },
  {
    name: 'Google',
    icon: Instagram,
    social: LoginSocialInstagram,
    client_id: publicRuntimeConfig.instagramClientId,
    client_secret: publicRuntimeConfig.instagramClientSecret,
  },
]

type TypeSocialLinks = {
  name: string
  icon: typeof Facebook | typeof Twitter | typeof Google | typeof Instagram
  social:
    | typeof LoginSocialGoogle
    | typeof LoginSocialTwitter
    | typeof LoginSocialFacebook
    | typeof LoginSocialInstagram
  app_id?: string
  client_id?: string
  client_secret?: string
}

const REDIRECT_URI = 'http://localhost:3000/'

function passwordComparison(
  password: DefaultValues['password'],
  confirmPassword: DefaultValues['confirm'],
) {
  if (
    password.length !== confirmPassword.length ||
    password !== confirmPassword
  ) {
    return false
  }
  return true
}

type DefaultValues = {
  first_name: string
  last_name: string
  display_name: string
  username: string
  email: string
  password: string
  confirm: string
  checkbox: boolean
}

const defaultValues: DefaultValues = {
  first_name: '',
  last_name: '',
  display_name: '',
  username: '',
  email: '',
  password: '',
  confirm: '',
  checkbox: false,
}

export type CreateAnAccountProps = {
  poolName?: string | null
  breakpoint?: 'md' | 'source' | null
  functionAfterCreateAnAccount?: () => void
  functionAfterSignIn?: () => void
}

export function CreateAnAccount({
  poolName,
  functionAfterCreateAnAccount,
  functionAfterSignIn,
  breakpoint,
}: CreateAnAccountProps) {
  const { push } = useRouter()

  const { closeModal, openModal } = useOpenModal()
  const {
    control,
    handleSubmit,
    setError: setFormError,
    getValues,
    reset,
  } = useForm<DefaultValues>({ defaultValues })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useMessage()

  async function sendData({
    first_name,
    last_name,
    display_name,
    email,
    password,
    username,
    confirm,
  }: DefaultValues) {
    try {
      if (!passwordComparison(password, confirm)) {
        setFormError('confirm', { message: rf.passwordNotMatch })
        return
      }

      setIsLoading(true)

      const { error } = await api.register({
        email,
        username,
        display_name,
        first_name,
        last_name,
        password,
      })

      if (!!error) {
        if ('errorsObj' in error) {
          Object.entries(error.errorsObj).map(([key, message]) => {
            setFormError(key as keyof DefaultValues, { message })
          })
        }

        if ('message' in error && error.message === rf.alreadyAuthenticated) {
          handlingCloseModal()
          push(routes.account.dashboard)
        }

        setIsLoading(false)
        return
      }

      setIsLoading(false)
      handlingCloseModal()

      if (functionAfterCreateAnAccount) functionAfterCreateAnAccount()
    } catch (err) {
      setIsLoading(false)
      writeErrorToState(err, setError)
    }
  }

  const openSignInModal = () =>
    openModal({
      type: USER_MODAL_TYPES.SIGN_IN,
      props: {
        functionAfterSignIn: () => functionAfterSignIn && functionAfterSignIn(),
      },
    })

  async function handleErrors() {
    const { password, confirm } = getValues()

    if (!passwordComparison(password, confirm)) {
      setFormError('confirm', { message: rf.passwordNotMatch })
    }
  }

  function handlingCloseModal() {
    reset(defaultValues)
    closeModal()
  }

  const renderContent = () => {
    switch (breakpoint) {
      case 'md':
        return (
          <CreateAnAccountMd
            control={control}
            handleErrors={handleErrors}
            handleSubmit={handleSubmit}
            handlingCloseModal={handlingCloseModal}
            isLoading={isLoading}
            openSignInModal={openSignInModal}
            sendData={sendData}
            error={error}
            poolName={poolName}
            functionAfterCreateAnAccount={functionAfterCreateAnAccount}
          />
        )
      default:
        return (
          <CreateAnAccountSource
            control={control}
            handleErrors={handleErrors}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            openSignInModal={openSignInModal}
            sendData={sendData}
            error={error}
            poolName={poolName}
          />
        )
    }
  }

  return renderContent()
}

const CreateAnAccountSource = ({
  control,
  handleErrors,
  openSignInModal,
  sendData,
  error,
  poolName,
  handleSubmit,
  isLoading,
}: {
  isLoading: boolean
  poolName?: string | null
  control: Control<DefaultValues, any>
  error: string | null
  openSignInModal: () => void
  sendData: ({
    first_name,
    last_name,
    display_name,
    email,
    password,
    username,
    confirm,
  }: DefaultValues) => Promise<void>
  handleErrors: () => void
  handleSubmit: UseFormHandleSubmit<DefaultValues>
}) => {
  return (
    <div className={styles.wrapper}>
      <h1>
        {poolName ? (
          <>
            Sign up and kick <span>{poolName}</span> off
          </>
        ) : (
          'Create an account'
        )}
      </h1>

      <form onSubmit={(e) => e.preventDefault()}>
        {!!error && <div className="alert alert-danger">{error}</div>}

        <div className={styles.inputsWrapper}>
          <RHFInput
            control={control}
            name="first_name"
            placeholder="First Name"
            withLabel
            required={errR.required}
            small
          />

          <RHFInput
            control={control}
            name="last_name"
            placeholder="Last Name"
            withLabel
            required={errR.required}
            small
          />
        </div>

        <div className={styles.inputsWrapper}>
          <RHFInput
            control={control}
            name="display_name"
            placeholder="Display name"
            withLabel
            required={errR.required}
            small
          />

          <RHFInput
            control={control}
            name="username"
            placeholder="Username"
            withLabel
            required={errR.required}
            small
          />
        </div>

        <RHFInput
          control={control}
          name="email"
          placeholder="Email"
          withLabel
          required={errR.required}
          small
        />

        <div className={styles.inputsWrapper}>
          <RHFInput
            type="password"
            control={control}
            name="password"
            placeholder="Password"
            withLabel
            required={errR.required}
            small
          />

          <RHFInput
            type="confirm-password"
            control={control}
            name="confirm"
            placeholder="Confirm"
            withLabel
            required={errR.required}
            small
          />
        </div>

        <RHFCheckbox
          control={control}
          name="checkbox"
          required="Please accept and agree to the Terms of Service and Privacy Policy by checking the box"
        >
          I accept and agree to UPool’s{' '}
          <Link href={routes.index}>Terms of Service</Link> and{' '}
          <Link href={routes.index}>Privacy Policy</Link> and to the processing
          of my information as described therein.
        </RHFCheckbox>

        <div className={styles.buttonsWrapper}>
          <p onClick={() => openSignInModal()}>Sign in instead</p>
          <button
            className={classNames('button button-blue', {
              disabled: isLoading,
            })}
            onClick={() => !isLoading && handleSubmit(sendData, handleErrors)()}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}

const CreateAnAccountMd = ({
  control,
  handleErrors,
  handlingCloseModal,
  openSignInModal,
  sendData,
  error,
  poolName,
  handleSubmit,
  isLoading,
  functionAfterCreateAnAccount,
}: {
  isLoading: boolean
  handlingCloseModal: () => void
  poolName?: string | null
  control: Control<DefaultValues, any>
  error: string | null
  openSignInModal: () => void
  sendData: ({
    first_name,
    last_name,
    display_name,
    email,
    password,
    username,
    confirm,
  }: DefaultValues) => Promise<void>
  handleErrors: () => void
  handleSubmit: UseFormHandleSubmit<DefaultValues>
  functionAfterCreateAnAccount?: () => void
}) => {
  const [step, setStep] = useState<'name' | 'submit'>('name')

  const { socialNetworks } = useGetSocialNetworks()

  const socialNetworksButtons: TypeSocialLinks[] = useMemo(() => {
    if (socialNetworks) {
      return socialLinks
      const enabledSocialNetwork = socialNetworks?.map(
        (socialNetwork) => socialNetwork?.name,
      )
      return (
        socialLinks?.filter((item) =>
          enabledSocialNetwork.includes(item?.name),
        ) ?? []
      )
    }
    return []
  }, [socialNetworks])

  const handleChangeSteps = () => {
    if (step === 'name') {
      setStep('submit')
    } else {
      !isLoading &&
        handleSubmit(sendData, handleErrors)().then(() => {
          setStep('name')
        })
    }
  }

  const { loginBySocialNetwork } = useAuth({
    redirectIfAuthenticated: !functionAfterCreateAnAccount
      ? routes.account.dashboard
      : undefined,
  })

  async function signInBySocialNetwork({ provider, data }: IResolveParams) {
    const sendData: LoginSocialNetworkData = {
      token: data?.access_token ?? data?.accessToken,
      driver: provider,
    }
    const { error } = await loginBySocialNetwork(sendData)

    if (!!error) {
      return
    }

    handlingCloseModal()
  }

  const renderStepContent = () => {
    switch (step) {
      case 'name':
        return (
          <>
            <div className={styles.social}>
              {!!socialNetworksButtons.length &&
                socialNetworksButtons?.map((link, i) => {
                  const Social = link.social
                  const Icon = link.icon
                  return (
                    <Social
                      key={i}
                      isOnlyGetToken
                      redirect_uri={REDIRECT_URI}
                      appId={link?.app_id ?? ''}
                      client_id={link?.client_id ?? ''}
                      client_secret={link?.client_secret ?? ''}
                      onResolve={({ provider, data }: IResolveParams) =>
                        signInBySocialNetwork({ provider, data })
                      }
                      onReject={(err) => {
                        console.log(err)
                      }}
                    >
                      <Icon className={styles.icon} />
                    </Social>
                  )
                })}
            </div>
            <div className={styles.separator}>
              <span>or</span>
            </div>

            <RHFInput
              control={control}
              name="username"
              key="username"
              placeholder="Username"
              withLabel
              required={errR.required}
              small
            />
            <RHFInput
              control={control}
              name="email"
              key="email"
              placeholder="Email"
              withLabel
              required={errR.required}
              small
            />
            <RHFInput
              type="password"
              control={control}
              name="password"
              key="password"
              placeholder="Password"
              withLabel
              required={errR.required}
              small
            />
            <RHFInput
              type="confirm-password"
              control={control}
              name="confirm"
              key="confirm"
              placeholder="Confirm"
              withLabel
              required={errR.required}
              small
            />
          </>
        )
      case 'submit':
        return (
          <>
            <RHFInput
              control={control}
              name="first_name"
              key="first_name"
              placeholder="First Name"
              withLabel
              required={errR.required}
              small
            />
            <RHFInput
              control={control}
              name="last_name"
              key="last_name"
              placeholder="Last Name"
              withLabel
              required={errR.required}
              small
            />
            <RHFInput
              control={control}
              name="display_name"
              key="display_name"
              placeholder="Display name"
              withLabel
              required={errR.required}
              small
            />
            <RHFCheckbox
              control={control}
              name="checkbox"
              required="Please accept and agree to the Terms of Service and Privacy Policy by checking the box"
            >
              <div className={styles.acceptance}>
                I accept and agree to UPool’s{' '}
                <Link href={routes.index}>Terms of Service</Link> and{' '}
                <Link href={routes.index}>Privacy Policy</Link> and to the
                processing of my information as described therein.
              </div>
            </RHFCheckbox>
          </>
        )
    }
  }

  useEffect(() => {
    setStep('name')
  }, [])

  return (
    <div className={classNames(styles.wrapper, styles.md)}>
      <SignInMdTabs
        active="sign-up"
        openSignInModal={() => openSignInModal()}
      />
      <div className={styles.main}>
        <div className={styles.title}>
          {poolName ? (
            <>
              Sign up and kick <span>{poolName}</span> off
            </>
          ) : (
            'Create an account'
          )}
        </div>

        <span className={styles.titleAdd}>Sign in to start or join a Pool</span>

        <form onSubmit={(e) => e.preventDefault()}>
          {!!error && <div className="alert alert-danger">{error}</div>}
          {renderStepContent()}
          <div className={styles.buttonsWrapper}>
            {/* <p
                onClick={() => {
                  closeModal()
                  openSignInModal(true)
                }}
              >
                Sign in instead
              </p> */}
            <button
              className={classNames('button button-blue', {
                disabled: isLoading,
              })}
              onClick={() => handleChangeSteps()}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
