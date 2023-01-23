import { chakra, Code, FormControl, GridItem, Input } from '@chakra-ui/react';
import React from 'react';
import type { ControllerRenderProps, Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { FormFields } from '../types';

import InputPlaceholder from 'ui/shared/InputPlaceholder';

interface Props {
  control: Control<FormFields>;
  hint?: string;
}

const ContractVerificationFieldName = ({ control, hint }: Props) => {
  const renderControl = React.useCallback(({ field }: {field: ControllerRenderProps<FormFields, 'name'>}) => {
    return (
      <FormControl variant="floating" id={ field.name } isRequired size={{ base: 'md', lg: 'lg' }}>
        <Input
          { ...field }
          required
          maxLength={ 255 }
        />
        <InputPlaceholder text="Contract name"/>
      </FormControl>
    );
  }, []);

  return (
    <>
      <GridItem>
        <Controller
          name="name"
          control={ control }
          render={ renderControl }
          rules={{ required: true }}
        />
      </GridItem>
      <GridItem fontSize="sm">
        { hint || (
          <>
            <span>Must match the name specified in the code. For example, in </span>
            <Code>{ `contract MyContract {..}` }</Code>
            <span>. <chakra.span fontWeight={ 600 }>MyContract</chakra.span> is the contract name.</span>
          </>
        ) }
      </GridItem>
    </>
  );
};

export default React.memo(ContractVerificationFieldName);
