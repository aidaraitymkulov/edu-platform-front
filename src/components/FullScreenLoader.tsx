import { Box, CircularProgress, Typography } from '@mui/material'

type FullScreenLoaderProps = {
  label?: string
}

function FullScreenLoader({ label = 'Проверяем сессию...' }: FullScreenLoaderProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  )
}

export default FullScreenLoader
