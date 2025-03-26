import * as React from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/th'; // Import Thai locale
import Grid from "@mui/material/Grid2";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import Box from '@mui/material/Box';

// Extend dayjs to support Buddhist Era (พ.ศ.)
dayjs.locale('th');

// Custom function to adjust year to Buddhist Era (B.E.)
dayjs.prototype.buddhistEra = function () {
  return this.year();
};

// styles
import styles from '@/styles/common/calendar.module.css'

const DateMounthYear = () => {
    const [anchorElMb, setAnchorElMb] = React.useState<null | HTMLElement>(null);
    return (
        <Grid container>
            <Button
                onClick={(e) => setAnchorElMb(e.currentTarget)}
                className={[styles.pillButton, anchorElMb? styles.active : ''].join(' ')}
            >
                Wanapon
            </Button>

            <Menu
                anchorEl={anchorElMb}
                open={Boolean(anchorElMb)}
                onClose={() => setAnchorElMb(null)}
                className={['calendarDateMonthYear'].join(' ')}
            >
                <Box onClick={() => setAnchorElMb(null)} className={[styles.datePicker, 'aaaaaaaaaaaaaaaaa'].join(' ')}>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                        <DemoContainer components={['DatePicker']} >
                            <StaticDatePicker className={styles.datePicker} />
                        </DemoContainer>
                    </LocalizationProvider>
                </Box>
            </Menu>
            
    
        </Grid>
    );
};

export default DateMounthYear
