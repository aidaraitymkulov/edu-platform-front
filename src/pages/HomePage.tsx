import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useMeQuery } from '../store/api'

function HomePage() {
  const { data: user } = useMeQuery()

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Главная
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Вы успешно вошли. Эту страницу позже заменим на дашборд.
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {user?.role === 'admin' ? (
            <>
              <Button component={RouterLink} to="/admin/teachers" variant="contained">
                Учителя
              </Button>
              <Button component={RouterLink} to="/admin/students" variant="contained">
                Студенты
              </Button>
              <Button component={RouterLink} to="/admin/groups" variant="contained">
                Группы
              </Button>
              <Button component={RouterLink} to="/teacher/dashboard" variant="contained">
                Кабинет преподавателя
              </Button>
            </>
          ) : null}
          {user?.role === 'teacher' ? (
            <>
              <Button component={RouterLink} to="/teacher/dashboard" variant="contained">
                Кабинет преподавателя
              </Button>
              <Button component={RouterLink} to="/admin/teachers" variant="contained">
                Учителя
              </Button>
              <Button component={RouterLink} to="/admin/students" variant="contained">
                Студенты
              </Button>
              <Button component={RouterLink} to="/admin/groups" variant="contained">
                Группы
              </Button>
            </>
          ) : null}
          <Button component={RouterLink} to="/login" variant="outlined">
            Вернуться к входу
          </Button>
        </Stack>
      </Box>
    </Container>
  )
}

export default HomePage
