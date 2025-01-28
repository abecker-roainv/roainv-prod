import React, { useMemo } from 'react';
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

  return (
    <MonthlyGrid 
      year={2025}
      data={monthlyData}
      title="Vencimientos 2025, por mes"
      contracts={contracts}
    />
  );
};

export default ContractExpirations;