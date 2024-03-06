import {
  Box,
  Card,
  Select,
  Button,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  CardHeader,
  CardContent,
  CardActions,
  FormControl,
  CircularProgress,
  Unstable_Grid2 as Grid
} from '@mui/material';
import * as Yup from 'yup';
import { useCallback, useEffect } from 'react';
import { useFormik } from 'formik';
import useAppDispatch from '../../hooks/useAppDispatch';
import useAppSelector from '../../hooks/useAppSelector';
import { CreateMonitoringPointDto, createMonitoringPointDto } from '@dynamox-challenge/dto';
import { createMonitoringPoint, getMonitoringPoints, getMachines, getSensors } from '../../lib/api';

export const AddMonitoringPointForm = () => {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector(state => state.user);
  const { status: sensorStatus, data: sensors } = useAppSelector(state => state.sensors);
  const { status: machineStatus, data: machines } = useAppSelector(state => state.machines);
  const { status: mPStatus, data: monitoringPoints } = useAppSelector(state => state.monitoringPoints);

  const formik = useFormik({
    initialValues: {
      name: '',
      machineId: 0,
      sensorId: 0,
    },
    validationSchema: Yup.object({
      name: Yup
        .string()
        .max(255)
        .required('Name is required'),
      machineId: Yup
        .number()
        .required('Machine is required'),
      sensorId: Yup
        .number()
        .required('Type is required'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const newMonitoringPoint: CreateMonitoringPointDto = {
          ...values
        };

        const body = createMonitoringPointDto.safeParse(newMonitoringPoint);

        if (!body.success) {
          helpers.setStatus({ success: false });
          helpers.setSubmitting(false);
          console.log('body.errors: ', body.error);
          return;
        }
        dispatch(createMonitoringPoint({ body: body.data, accessToken: accessToken as string }));
        formik.resetForm();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
      }
    }
  });

  const getSensorOptions = useCallback(() => {
    const currentMachine = machines.find((machine) => machine.id === formik.values.machineId);
    if (sensorStatus === 'loading') {
      return <MenuItem value={0} disabled selected>Loading sensors...</MenuItem>;
    } else if (sensorStatus === 'error') {
      return <MenuItem value={0} disabled selected>Error loading sensors</MenuItem>;
    } else if (sensorStatus === 'ready') {
      if (monitoringPoints.length > 0 && sensors.length > 0) {
        return sensors
          .filter((sensor) => {
            if (currentMachine && currentMachine.type === 'Pump') {
              return sensor.model === 'HF+'
            } else if (currentMachine && currentMachine.type === 'Fan') {
              return sensor.model !== 'HF+'
            } else {
              return true;
            }
          })
          .filter((sensor) => !sensor.inUse)
          .map((sensor) => (
            <MenuItem key={sensor.id} value={sensor.id}>
              {sensor.id} - {sensor.model}
            </MenuItem>
          ));
      } else if (sensors.length > 0) {
        return sensors
          .filter((sensor) => {
            if (currentMachine && currentMachine.type === 'Pump') {
              return sensor.model === 'HF+'
            } else if (currentMachine && currentMachine.type === 'Fan') {
              return sensor.model !== 'HF+'
            } else {
              return true;
            }
          })
          .map((sensor) => (
            <MenuItem key={sensor.id} value={sensor.id}>
              {sensor.id} - {sensor.model}
            </MenuItem>
          ));
      } else {
        return <MenuItem value={0} disabled selected>No sensors available</MenuItem>;
      }
    }
  }, [sensorStatus, sensors, monitoringPoints, machines, formik.values.machineId]);

  const getMachineOptions = useCallback(() => {
    if (machineStatus === 'loading') {
      return <MenuItem value={0} disabled selected>Loading machines...</MenuItem>;
    } else if (machineStatus === 'error') {
      return <MenuItem value={0} disabled selected>Error loading machines</MenuItem>;
    } else if (machineStatus === 'ready') {
      if (machines.length > 0) {
        return machines.map((machine) => (
          <MenuItem key={machine.id} value={machine.id}>
            {machine.type} - {machine.name}
          </MenuItem>
        ));
      } else {
        return <MenuItem value={0} disabled selected>No machines available</MenuItem>;
      }
    }
  }, [machineStatus, machines]);

  const updateData = useCallback(() => {
    if (accessToken === null) return;
    dispatch(getSensors({ accessToken: accessToken as string }));
    dispatch(getMachines({ accessToken: accessToken as string }));
    dispatch(getMonitoringPoints({ accessToken: accessToken as string }));
  }, [dispatch, accessToken]);

  useEffect(() => {
    updateData()
  }, [updateData]);

  return (
    <form
      autoComplete='off'
      noValidate
      onSubmit={formik.handleSubmit}
    >
      <Card>
        <CardHeader
          subheader='The information can be edited'
          title='Add a new monitoring point'
        />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ m: -1.5 }}>
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                // md={6}
              >
                <TextField
                  error={!!(formik.touched.name && formik.errors.name)}
                  fullWidth
                  helperText={formik.touched.name && formik.errors.name}
                  label='Name'
                  name='name'
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  required
                  value={formik.values.name}
                  variant='filled'
                />
              </Grid>
              <Grid
                xs={12}
                // md={6}
              >
                <FormControl fullWidth>
                  <InputLabel variant='filled' htmlFor='machineId'>Machine</InputLabel>
                  <Select
                    error={!!(formik.touched.machineId && formik.errors.machineId)}
                    fullWidth
                    label='Machine'
                    inputProps={{
                      name: 'machineId',
                      id: 'machineId',
                    }}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.machineId}
                    required
                  >
                    {getMachineOptions()}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                xs={12}
                // md={6}
              >
                <FormControl fullWidth>
                  <InputLabel variant='filled' htmlFor='sensorId'>Sensor</InputLabel>
                  <Select
                    error={!!(formik.touched.sensorId && formik.errors.sensorId)}
                    fullWidth
                    label='Sensor'
                    inputProps={{
                      name: 'sensorId',
                      id: 'sensorId',
                    }}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.sensorId}
                    required
                  >
                    {getSensorOptions()}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Button variant='contained' type='submit' disabled={mPStatus === 'loading'}>
            Add Monitoring Point {' '} { mPStatus === 'loading' && <CircularProgress size={13} />}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};
