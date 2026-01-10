import { Box, Button, Container, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

function HomePage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Главная
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Вы успешно вошли. Эту страницу позже заменим на дашборд.
        </Typography>
        <Button component={RouterLink} to="/login" variant="outlined">
          Вернуться к входу
        </Button>
      </Box>
    </Container>
  )
}

export default HomePage
