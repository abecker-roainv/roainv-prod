// app/(protected)/popestate/contracts/page.js

import { Typography, Box } from '@mui/material';
import ContractsTable from '../../components/ContractsTable';
export default function ContractsPage() {
  return (
  <Box sx={{ p: 0, width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Contratos
      </Typography>
      <ContractsTable/>

    </Box>
  );
}