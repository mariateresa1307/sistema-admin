import Grid from "@mui/material/Grid";
import { Typography, Card, CardContent} from "@mui/material";


export const KpiCard = ({ title, value, color, subtitle }: { title: string; value: string | number, color: string, subtitle?: string }) => (
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <Card elevation={0} sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        transition: '0.3s',
        '&:hover': { boxShadow: 2 },
        height: '100%'
      }}>
        <CardContent sx={{ pb: 2 }}>
          <Typography variant="overline" sx={{ color: color, fontWeight: 800, display: 'block' }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </CardContent>
      </Card>
    </Grid>
  );