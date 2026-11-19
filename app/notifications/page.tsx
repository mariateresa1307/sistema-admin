import { Snackbar, Alert } from '@mui/material';

export const Notification = ({ open, message, severity, onClose }: any) => {
  console.log(open, message, severity)
  return <><Snackbar open={open} autoHideDuration={5000} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
    <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
  </>
};