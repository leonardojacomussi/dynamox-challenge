import {
  Box,
  Card,
  Divider,
  Skeleton,
  Typography,
  IconButton,
  CardContent,
} from '@mui/material';
import { useMemo } from 'react';
import { Machine } from '@prisma/client';
import { EditMachineModal } from './EditMachineModal';
import useAppDispatch from '../../hooks/useAppDispatch';
import useAppSelector from '../../hooks/useAppSelector';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { selectMachine } from '../../lib/redux/features/machinesSlice';
import PencilSquareIcon from '@heroicons/react/24/solid/PencilSquareIcon';

export const MachinesTable = () => {
  const dispatch = useAppDispatch();
  const {status, data: machines, machineSelected} = useAppSelector(state => state.machines);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'Sensor ID', width: 200 },
    { field: 'type', headerName: 'Type', width: 200 },
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'inUse',
      headerName: 'Availability',
      width: 200,
      renderCell: (params) => (
        <Typography
          color={params.value ? 'textSecondary' : 'textPrimary'}
          variant='body2'
        >
          {params.value ? 'In use' : 'Available'}
        </Typography>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          aria-label='edit'
          onClick={() => {
            dispatch(selectMachine(params.row as Machine));
          }}
        >
          <PencilSquareIcon style={{ fill: '#000', width: '20px' }} />
        </IconButton>
      ),
    },
  ], [dispatch]);

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <CardContent>
        <Box
          sx={{
            alignItems: 'start',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography
            gutterBottom
            variant='h5'
          >
            Your machines
          </Typography>
        </Box>
      </CardContent>
      <Divider />
      {
        status === 'loading' ? (
          <Box>
            <Skeleton height={50} width={'100%'} />
            <Skeleton height={50} width={'100%'} />
            <Skeleton height={50} width={'100%'} />
            <Skeleton height={50} width={'100%'} />
            <Skeleton height={50} width={'100%'} />
            <Skeleton height={50} width={'100%'} />
            <Skeleton height={50} width={'100%'} />
          </Box>
        ) : (
          <Box>
            <DataGrid
              autoHeight
              rows={machines}
              columns={columns}

              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              localeText={{
                noRowsLabel: 'No machines found',
                noResultsOverlayLabel: 'No machines found'
              }}
              pageSizeOptions={[5, 10]}
            />
          </Box>
        )
      }
      {
        status === 'error' ? (
          <Box>
            <Typography
              color='textSecondary'
              variant='body2'
            >
              Something went wrong. Please try again later.
            </Typography>
          </Box>
        ) : null
      }
      { machineSelected && <EditMachineModal /> }
    </Card>
  );
};
