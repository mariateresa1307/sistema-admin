import { Fab, Zoom } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface Props {
  onClick: () => void;
}

export const FloatingAddButton = ({ onClick }: Props) => {
  return (
    <Zoom in={true} unmountOnExit>
      <Fab
       
        aria-label="add"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          boxShadow: 4,
          backgroundColor: "#080769",
          color: "#fff",
          '&:hover': {transform: 'scale(1.1)', backgroundColor: "#060554" },
          transition: 'transform 0.2s'
        }}
      >
        <AddIcon />
      </Fab>
    </Zoom>
  );
};