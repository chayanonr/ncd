import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Noto Sans Thai", sans-serif',
  },
  components: {
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D4D1D3', // Default
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D4D1D3', // Hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D4D1D3', // Custom focus color (matches your "moreInfo" button border)
          },
        },
      },
    },
  },
});

export default theme;