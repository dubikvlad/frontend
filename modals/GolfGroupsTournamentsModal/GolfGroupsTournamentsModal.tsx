import classNames from 'classnames'
import { useState } from 'react'
import { FieldValues, useForm, UseFormRegister } from 'react-hook-form'
import { KeyedMutator } from 'swr'

import {
  api,
  GolfAddGroupData,
  GolfGridTournament,
  GolfGroupsResponseData,
  QueryId,
  ResponseData,
} from '@/api'
import { Cross } from '@/assets/icons'
import { errR } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { Checkbox, RHFInput } from '@/features/ui'

import styles from './GolfGroupsTournamentsModal.module.scss'

export type GolfGroupsTournamentsModalProps = {
  data: GolfGridTournament[]
  countRows?: number
  poolId: QueryId
  updateGroups: KeyedMutator<ResponseData<GolfGroupsResponseData[]>>
}

export function GolfGroupsTournamentsModal({
  data,
  countRows = 10,
  poolId,
  updateGroups,
}: GolfGroupsTournamentsModalProps) {
  const [error, setError] = useState<boolean>(false)

  const copyData = [...data]
  const totalTournaments = copyData.length

  const { closeModal } = useOpenModal()

  let golfAllTournaments = [copyData]

  if (copyData.length > countRows) {
    golfAllTournaments = [
      ...Array(Math.ceil(totalTournaments / countRows)),
    ].map((item, i) => copyData.slice(i * countRows, i * countRows + countRows))
  }

  const { register, getValues, handleSubmit, reset, control } =
    useForm<GolfAddGroupData>()

  const formValues: GolfAddGroupData = getValues()

  async function createGroup(dataForm: GolfAddGroupData) {
    if (dataForm.tournaments.length) {
      const res = await api.golf.addGroup(String(poolId), dataForm)

      if (!res.error) {
        reset()
        closeModal()
        updateGroups()
      }
    } else {
      setError(true)

      setTimeout(() => {
        setError(false)
      }, 3000)
    }
  }

  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <h3>Create a new group</h3>
        <div onClick={() => closeModal()}>
          <Cross width={16} height={16} stroke="var(--stroke-color)" />
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(createGroup)}>
        <RHFInput
          control={control}
          name="name"
          placeholder="Group Name"
          withLabel
          required={errR.required}
        />

        <div className={styles.checkboxesWrap}>
          {golfAllTournaments.map((item, i) => (
            <div key={i}>
              {item.map((data) => (
                <CheckboxOption
                  key={data.id}
                  title={data.name}
                  register={register}
                  name={data.id}
                  formValues={formValues}
                />
              ))}
            </div>
          ))}
        </div>

        {error ? (
          <div className="alert alert-danger">
            You must pick at least one tournament for this grouping
          </div>
        ) : (
          <></>
        )}

        <button
          className={classNames('button button-blue', styles.createGroupBtn)}
        >
          Create a Group
        </button>
      </form>
    </div>
  )
}

function CheckboxOption({
  title,
  register,
  name,
  formValues,
}: {
  title: string
  register: UseFormRegister<GolfAddGroupData>
  name: number
  formValues: FieldValues
}) {
  const initialState =
    formValues && 'tournaments' in formValues && formValues.tournaments.length
      ? formValues.tournaments.includes(String(name))
      : false

  const [isActive, setIsActive] = useState(initialState)

  return (
    <div className={styles.checkboxWrap}>
      <label
        htmlFor={String(name)}
        className={styles.listOption}
        onClick={() => setIsActive(!isActive)}
      >
        <Checkbox value={isActive} onChange={() => setIsActive(!isActive)}>
          <span>{title}</span>
        </Checkbox>
      </label>

      <input
        className={styles.input}
        type="checkbox"
        {...register('tournaments')}
        value={name}
        defaultChecked={isActive}
        id={String(name)}
      />
    </div>
  )
}
