import React from 'react';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export interface CircularProgressWithLabelProps extends CircularProgressProps {
  value: number;
  chartColor?: string; // custom color for the filled arc
  labelColor?: string; // optional color for the percentage label
}

function CircularProgressWithLabel(props: CircularProgressWithLabelProps) {
  const {
    value,
    chartColor = '#2196F3',    // default to blue
    labelColor = '#2196F3',
    size = 80,                 // bigger size to match the screenshot
    thickness = 8,             // thicker ring
    ...rest
  } = props;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        sx={{
          color: chartColor,
          '& .MuiCircularProgress-track': {
            color: '#f0f0f0', // light-gray track
          },
        }}
        {...rest}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ color: labelColor, fontWeight: 'bold' }}
        >
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export default CircularProgressWithLabel;
