import { Dispatch, SetStateAction } from 'react'
import {
  Control,
  UseControllerProps,
  RegisterOptions,
  FieldValues,
  useController,
  FieldPath,
  PathValue,
} from 'react-hook-form'

import { Select } from '@/features/ui/Select'
import { SelectProps } from '@/features/ui/Select/Select'

type RHFSelectProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  name: UseControllerProps['name']
  options: SelectProps['options']
  placeholder?: SelectProps['placeholder']
  required?: RegisterOptions['required']
  titleDisplayFormat?: SelectProps['titleDisplayFormat']
  withLabel?: SelectProps['withLabel']
  defaultValue?: PathValue<FieldValues, FieldPath<FieldValues>>
  onChangeEvent?: SelectProps['onChangeEvent']
  disabled?: SelectProps['disabled']
  tooltipTitle?: SelectProps['tooltipTitle']
  tooltipContent?: SelectProps['tooltipContent']
  onChangeSetCurrentState?: Dispatch<
    SetStateAction<string | number | boolean | number[] | undefined>
  >
}

export function RHFSelect({
  control,
  name,
  options,
  placeholder,
  required = false,
  defaultValue = '',
  withLabel,
  onChangeEvent,
  disabled,
  tooltipTitle,
  tooltipContent,
  onChangeSetCurrentState,
}: RHFSelectProps) {
  const {
    field: { value, onChange },
  } = useController({
    control,
    name,
    defaultValue: String(defaultValue),
    rules: { required },
  })

  const onChangeSelect = (value: string) => {
    if (onChangeSetCurrentState) onChangeSetCurrentState(value)
    onChange(value)
  }

  return (
    <Select
      value={value}
      onChange={onChangeSelect}
      options={options}
      placeholder={placeholder}
      withLabel={withLabel}
      onChangeEvent={onChangeEvent}
      disabled={disabled}
      tooltipTitle={tooltipTitle}
      tooltipContent={tooltipContent}
    />
  )
}
