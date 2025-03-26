import { useState, JSX } from "react";
import { Box } from "@mui/material";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import styles from '@/styles/common/input-select.module.css';

const InputSelect = ({
  width = 300,
  height = 43,
  value = "", // Changed default to "" to align with CompareSection1.tsx
  dataItem = [],
  disabled = false,
  placeholder = "", // New prop with a default placeholder
}: {
  width?: number | string;
  height?: number | string;
  value?: string | number;
  dataItem?: JSX.Element[];
  disabled?: boolean;
  placeholder?: string; // Optional placeholder
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Box style={{ maxWidth: width, width: '100%', height: '100%', minWidth: width }} className={styles.btnInputSelect}>
      <FormControl style={{ maxWidth: width, width: '100%', height: height }}>
        <Select
          disabled={disabled}
          value={value}
          className={[styles.customSelect, open && styles.open, disabled ? styles.disabled : ''].join(' ')}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          IconComponent={KeyboardArrowDownIcon}
          displayEmpty // Enable empty display
          renderValue={(selected) => {
            if (!selected && placeholder) return <em style={{ color: '#757575' }}>{placeholder}</em>;
            const selectedItem = dataItem.find((item) => item.props['data-id'] === selected);
            return selectedItem ? selectedItem.props['data-value'] : selected;
          }}
        >
          {dataItem.map((item: JSX.Element, index) => (
            <MenuItem
              className={value === item.props['data-id'] ? styles.menuItem : ''}
              onClick={() => item.props.onClick()}
              key={index}
              value={item.props['data-id']}
            >
              {item.props['data-value']}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default InputSelect;