/* eslint-disable @typescript-eslint/no-explicit-any */
import classNames from 'classnames'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { Control, UseFormHandleSubmit, useForm } from 'react-hook-form'
import { IResolveParams } from 'reactjs-social-login'

import { LoginSocialNetworkData } from '@/api'
import { Facebook, Google, Instagram, Twitter } from '@/assets/icons'
import { errR, routes, writeErrorToState } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { SignInMdTabs } from '@/features/components'
import { RHFInput } from '@/features/ui'
import { useAuth, useMessage } from '@/helpers'
import { useGetSocialNetworks } from '@/helpers/hooks/useGetSocialNetworks'

import { USER_MODAL_TYPES } from '../ModalWrapper'

import styles from './SignIn.module.scss'

type DefaultValues = {
  username: string
  password: string
}

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

const defaultValues: DefaultValues = {
  username: '',
  password: '',
}

const REDIRECT_URI = 'http://localhost:3000/'

export type SignInProps = {
  breakpoint?: 'md' | 'source' | null
  functionAfterSignIn?: () => void
}

export function SignIn({ functionAfterSignIn, breakpoint }: SignInProps) {
  const { control, handleSubmit, reset } = useForm<DefaultValues>({
    defaultValues,
  })

  const { closeModal, openModal } = useOpenModal()

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

  function handlingCloseModal() {
    reset(defaultValues)
    closeModal()
  }

  const { login, loginBySocialNetwork } = useAuth({
    redirectIfAuthenticated: !functionAfterSignIn
      ? routes.account.dashboard
      : undefined,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useMessage()

  async function sendData({ password, username }: DefaultValues) {
    try {
      setIsLoading(true)

      const { error } = await login({ username, password })

      if (error) {
        if ('message' in error) {
          setError(error.message)
        }

        if ('messages' in error) {
          setError(error.getFirstMessage())
        }

        setIsLoading(false)
        return
      }

      setIsLoading(false)
      handlingCloseModal()

      if (functionAfterSignIn) functionAfterSignIn()
    } catch (err) {
      setIsLoading(false)
      writeErrorToState(err, setError)
    }
  }

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

  const openForgotPasswordModal = () =>
    openModal({ type: USER_MODAL_TYPES.FORGOT_PASSWORD })

  const openSignUpModal = () =>
    openModal({ type: USER_MODAL_TYPES.CREATE_AN_ACCOUNT, props: {} })

  const getModalContent = () => {
    switch (breakpoint) {
      case 'md':
        return (
          <SignInMd
            error={error}
            control={control}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            openForgotPasswordModal={openForgotPasswordModal}
            sendData={sendData}
            signInBySocialNetwork={signInBySocialNetwork}
            socialNetworksButtons={socialNetworksButtons}
            openSignUpModal={openSignUpModal}
          />
        )
      default:
        return (
          <SignInSource
            error={error}
            control={control}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            openForgotPasswordModal={openForgotPasswordModal}
            openSignUpModal={openSignUpModal}
            sendData={sendData}
            signInBySocialNetwork={signInBySocialNetwork}
            socialNetworksButtons={socialNetworksButtons}
          />
        )
    }
  }

  return getModalContent()
}

const SignInSource = ({
  error,
  control,
  isLoading,
  socialNetworksButtons,
  handleSubmit,
  sendData,
  signInBySocialNetwork,
  openForgotPasswordModal,
  openSignUpModal,
}: {
  error: string | null
  control: Control<DefaultValues, any>
  isLoading: boolean
  socialNetworksButtons: TypeSocialLinks[]
  sendData: ({ password, username }: DefaultValues) => Promise<void>
  signInBySocialNetwork: ({ provider, data }: IResolveParams) => Promise<void>
  handleSubmit: UseFormHandleSubmit<DefaultValues>
  openForgotPasswordModal: () => void
  openSignUpModal: () => void
}) => {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>sign in</h3>

      <span className={styles.titleAdd}>To start or join a Pool</span>

      <form onSubmit={(e) => e.preventDefault()}>
        {!!error && <div className="alert alert-danger">{error}</div>}

        <RHFInput
          control={control}
          name="username"
          placeholder="Username"
          withLabel
          required={errR.required}
        />

        <RHFInput
          control={control}
          name="password"
          placeholder="Password"
          withLabel
          required={errR.required}
          type="password"
          showPasswordComplexity={false}
        />

        <button
          className={classNames('button button-blue', styles.button, {
            disabled: isLoading,
          })}
          onClick={() => !isLoading && handleSubmit(sendData)()}
        >
          Continue
        </button>
      </form>

      <div className={styles.separator}>
        <span>or</span>
      </div>

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
                <Icon className={classNames(styles.icon, styles.source)} />
              </Social>
            )
          })}
      </div>

      <div className={styles.create}>
        Don&apos;t have an account??&nbsp;
        <span className={styles.createBtn} onClick={() => openSignUpModal()}>
          Create it
        </span>
      </div>

      <p
        className={styles.forgotPassword}
        onClick={() => openForgotPasswordModal()}
      >
        Forgot your password?
      </p>
    </div>
  )
}

const SignInMd = ({
  error,
  control,
  isLoading,
  socialNetworksButtons,
  handleSubmit,
  sendData,
  signInBySocialNetwork,
  openForgotPasswordModal,
  openSignUpModal,
}: {
  error: string | null
  control: Control<DefaultValues, any>
  isLoading: boolean
  socialNetworksButtons: TypeSocialLinks[]
  sendData: ({ password, username }: DefaultValues) => Promise<void>
  signInBySocialNetwork: ({ provider, data }: IResolveParams) => Promise<void>
  handleSubmit: UseFormHandleSubmit<DefaultValues>
  openForgotPasswordModal: () => void
  openSignUpModal: () => void
}) => {
  return (
    <div className={classNames(styles.wrapper, styles.md)}>
      <SignInMdTabs
        active="sign-in"
        openSignUpModal={() => openSignUpModal()}
      />
      <div className={styles.main}>
        <h3 className={styles.title}>Welcome back</h3>

        <span className={styles.titleAdd}>Sign in to start or join a Pool</span>

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

        <form onSubmit={(e) => e.preventDefault()}>
          {!!error && <div className="alert alert-danger">{error}</div>}

          <RHFInput
            control={control}
            name="username"
            placeholder="Username"
            withLabel
            required={errR.required}
          />

          <RHFInput
            control={control}
            name="password"
            placeholder="Password"
            withLabel
            required={errR.required}
            type="password"
            showPasswordComplexity={false}
          />

          <button
            className={classNames('button button-blue', styles.button, {
              disabled: isLoading,
            })}
            onClick={() => !isLoading && handleSubmit(sendData)()}
          >
            Continue
          </button>
        </form>

        <p
          className={styles.forgotPassword}
          onClick={() => openForgotPasswordModal()}
        >
          Forgot your password?
        </p>
      </div>
    </div>
  )
}
