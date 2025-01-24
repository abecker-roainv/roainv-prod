// app/(protected)/popestate/units/page.js

import UnitsTable from '../../components/UnitsTable';
import UnitsTableMobile from '../../components/UnitsTableMobile';
import TestUnitsComponent from '../../components/TestUnitsComponent';
import { Typography, Box } from '@mui/material';

export default function UnitsPage() {
  return (
  <Box sx={{ p: 0, width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Stock
      </Typography>
      <UnitsTable />
      {/* <UnitsTableMobile /> */}
      {/* <TestUnitsComponent /> */}

    </Box>
  );
}