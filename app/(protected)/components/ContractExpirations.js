import React, { useMemo } from 'react';
import { Grid, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import MonthlyGrid from './MonthlyGrid';
import dayjs from 'dayjs';

const ContractExpirations = ({ contracts }) => {
  const monthlyData = useMemo(() => {
    const today = dayjs();
    const monthsData = {};
    
    for (let i = 0; i < 12; i++) {
      monthsData[i] = 0;
    }

    contracts
      .filter(contract => Number(contract.estado_id) === 300)
      .forEach(contract => {
        if (contract.fecha_fin) {
          const endDate = dayjs(contract.fecha_fin);
          if (endDate.isAfter(today) && endDate.year() === 2025) {
            const month = endDate.month();
            monthsData[month]++;
          }
        }
      });

    return monthsData;
  }, [contracts]);

  const chartData = useMemo(() => (
    Object.entries(monthlyData).map(([month, value]) => ({
      month: dayjs().month(Number(month)).format('MMM'),
      vencimientos: value
    }))
  ), [monthlyData]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <MonthlyGrid 
          year={2025}
          data={monthlyData}
          title="Vencimientos 2025, por mes"
          contracts={contracts}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ height: 400, mt: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vencimientos" fill="#ff9800" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Grid>
    </Grid>
  );
};

export default ContractExpirations;