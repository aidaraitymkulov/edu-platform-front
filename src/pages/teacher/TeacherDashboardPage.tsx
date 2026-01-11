import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

function TeacherDashboardPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Кабинет преподавателя
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Управляйте тестами и заданиями для студентов.
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button component={RouterLink} to="/teacher/tests" variant="contained">
            Создать тест
          </Button>
          <Button component={RouterLink} to="/teacher/topics" variant="contained">
            Темы и уроки
          </Button>
          <Button component={RouterLink} to="/teacher/grades" variant="contained">
            Оценки
          </Button>
          <Button component={RouterLink} to="/" variant="outlined">
            Назад в дашборд
          </Button>
        </Stack>
      </Box>
    </Container>
  )
}

export default TeacherDashboardPage
