import React, { useState, useCallback, memo } from 'react';
import { Grid, Paper, Box, Typography, Modal, Badge } from '@mui/material';
import { DateCalendar, PickersDay } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const ServerDay = memo(({ day, outsideCurrentMonth, dayData, ...other }) => (
  dayData > 0 ? (
    <Badge
      overlap="circular"
      badgeContent={dayData}
      color="primary"
      sx={{
        '& .MuiBadge-badge': {
          backgroundColor: '#ff9800',
          color: 'white',
        }
      }}
    >
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  ) : (
    <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
  )
));

const MonthlyGrid = ({ year, data, title, contracts }) => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [calendarDate, setCalendarDate] = useState(null);

  const handleMonthSelect = useCallback((month) => {
    setSelectedMonth(month);
    setCalendarDate(dayjs().year(year).month(month));
  }, [year]);

  const getDayData = useCallback((day) => {
    if (!contracts || !day.isSame(calendarDate, 'month')) return 0;
    return contracts.filter(contract => {
      const endDate = dayjs(contract.fecha_fin);
      return endDate.month() === selectedMonth && 
             endDate.date() === day.date() &&
             endDate.year() === year &&
             Number(contract.estado_id) === 300;
    }).length;
  }, [contracts, selectedMonth, year, calendarDate]);

  const renderDay = useCallback((props) => (
    <ServerDay {...props} dayData={getDayData(props.day)} />
  ), [getDayData]);

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" gutterBottom>
        {title} <small><i>(según filtros actuales)</i></small>
      </Typography>
      <Grid container spacing={2}>
        {months.map((month) => (
            <Grid item xs={3} sm={3} md={3} lg={3} key={month}>
            <Paper 
                onClick={() => handleMonthSelect(month)}
                sx={{ 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100px',
                borderRadius: '12px',
                overflow: 'hidden',
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: data[month] > 0 ? '#f3f4f6' : '#e5e7eb',
                color: data[month] > 0 ? '#1f2937' : '#6b7280',
                '&:hover': {
                    bgcolor: data[month] > 0 ? '#e5e7eb' : '#d1d5db',
                }
                }}
            >
                <Box 
                sx={{ 
                    width: '100%', 
                    bgcolor: data[month] > 0 ? '#006AC999' : '#9CA3AF', 
                    color: '#ffffff',
                    p: 1,
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase'
                }}
                >
                {dayjs().month(month).format('MMM')}
                </Box>
                <Typography 
                sx={{ 
                    fontWeight: '700', 
                    fontSize: '2rem', 
                    lineHeight: '1', 
                    mt: 'auto',
                    mb: 2
                }}
                >
                {data[month]}
                </Typography>
            </Paper>
            </Grid>
        ))}
        </Grid>


      <Modal
        open={selectedMonth !== null}
        onClose={() => setSelectedMonth(null)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Paper sx={{ p: 3, maxWidth: 400 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <DateCalendar
              value={calendarDate}
              onChange={(newDate) => setCalendarDate(newDate)}
              views={['day']}
              disableHighlightToday
              sx={{
                '& .MuiPickersDay-dayOutsideMonth': {
                  visibility: 'hidden'
                },
                '& .MuiPickersDay-today, & .Mui-selected': {
                  border: 'none',
                  backgroundColor: 'transparent !important',
                  color: 'rgba(0, 0, 0, 0.87)'
                },
                '& .MuiPickersDay-root': {
                  '&.Mui-selected': {
                    backgroundColor: 'transparent'
                  }
                }
              }}
              slots={{
                day: renderDay
              }}
              slotProps={{
                calendarHeader: {
                  sx: {
                    '& .MuiPickersArrowSwitcher-root': {
                      display: 'none'
                    }
                  }
                },
                day: {
                  selected: false
                }
              }}
            />
          </LocalizationProvider>
        </Paper>
      </Modal>
    </Box>
  );
};

export default MonthlyGrid;