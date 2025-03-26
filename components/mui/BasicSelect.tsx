import React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface SelectOption {
  value: string;
  label: string;
}

interface BasicSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];

  // 1) add this
  className?: string;
}

export default function BasicSelect(props: BasicSelectProps) {
  const { label = 'Select an option', value, onChange, options, className } = props;

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <Box>
      <FormControl
        fullWidth
        variant="outlined"
        size="small"
        className={className}
        sx={{
          // Force the outer container to 43px
          height: '43px',
          '.MuiOutlinedInput-root': {
            height: '100%',
          },
          // Adjust the floating label so it doesn’t push things taller
          '.MuiInputLabel-root': {
            lineHeight: 1,
            // You might need to tweak top/transform for perfect alignment
          },
          '.MuiOutlinedInput-input': {
            padding: '8px 14px',
            lineHeight: 1.2,
          },
        }}
      >
        <InputLabel id="basic-select-label">{label}</InputLabel>
        <Select
          labelId="basic-select-label"
          id="basic-select"
          value={value}
          label={label}
          onChange={handleChange}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

    </Box>
  );
}
