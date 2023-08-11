import {
  useController,
  UseControllerProps,
  RegisterOptions,
  FieldValues,
  Control,
  PathValue,
  FieldPath,
} from 'react-hook-form'

import { SelectWithSearch } from '@/features/ui/SelectWithSearch'
import type { SelectWithSearchProps } from '@/features/ui/SelectWithSearch'

type RHFSelectWithSearchProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  name: UseControllerProps['name']
  options: SelectWithSearchProps['options']
  placeholder?: SelectWithSearchProps['placeholder']
  required?: RegisterOptions['required']
  defaultValue?: PathValue<FieldValues, FieldPath<FieldValues>>
}

export function RHFSelectWithSearch({
  control,
  name,
  options,
  placeholder = 'Select',
  required = false,
  defaultValue = '',
}: RHFSelectWithSearchProps) {
  const {
    field: { onChange, value },
  } = useController({ control, name, defaultValue, rules: { required } })

  return (
    <SelectWithSearch
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
    />
  )
}
