import {
  Box,
  Card,
  Divider,
  Skeleton,
  IconButton,
  Typography,
  CardContent,
} from '@mui/material';
import { useMemo } from 'react';
import { Sensor } from '@prisma/client';
import { EditSensorModal } from './EditSensorModal';
import useAppDispatch from '../../hooks/useAppDispatch';
import useAppSelector from '../../hooks/useAppSelector';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { selectSensor } from '../../lib/redux/features/sensorsSlice';
import PencilSquareIcon from '@heroicons/react/24/solid/PencilSquareIcon';

export const SensorsTable = () => {
  const dispatch = useAppDispatch();
  const {status, data: sensors, sensorSelected} = useAppSelector(state => state.sensors);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'id', headerName: 'Sensor ID', width: 200 },
    { field: 'model', headerName: 'Model', width: 200 },
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
            dispatch(selectSensor(params.row as Sensor));
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
            Your Sensors
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
              rows={sensors}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              localeText={{
                noRowsLabel: 'No sensors found',
                noResultsOverlayLabel: 'No sensors found'
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
      { sensorSelected && <EditSensorModal /> }
    </Card>
  );
};
