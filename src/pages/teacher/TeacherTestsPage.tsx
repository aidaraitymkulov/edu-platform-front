import { useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Link as RouterLink } from 'react-router-dom'
import { useCreateTestMutation, useDeleteTestMutation, useTestsQuery } from '../../store/api'

type ApiError = FetchBaseQueryError | { status?: string; data?: unknown }

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'status' in error) {
    const baseQueryError = error as ApiError
    const data = baseQueryError.data
    if (typeof data === 'string') {
      return data
    }
    if (data && typeof data === 'object') {
      const message = (data as { message?: unknown }).message
      if (typeof message === 'string') {
        return message
      }
      const errorText = (data as { error?: unknown }).error
      if (typeof errorText === 'string') {
        return errorText
      }
    }
    if (typeof baseQueryError.status === 'string') {
      return baseQueryError.status
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Произошла ошибка. Попробуйте еще раз.'
}

function toIsoDateTime(value: string) {
  if (!value) {
    return ''
  }
  const date = new Date(value)
  return date.toISOString()
}

function TeacherTestsPage() {
  const { data: tests = [], isLoading } = useTestsQuery()
  const [createTest] = useCreateTestMutation()
  const [deleteTest] = useDeleteTestMutation()
  const [form, setForm] = useState({
    title: '',
    description: '',
    availableFrom: '',
    availableTo: '',
    durationMinutes: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCreate = async () => {
    setError('')
    setSuccess('')
    if (
      !form.title.trim() ||
      !form.availableFrom.trim() ||
      !form.availableTo.trim() ||
      !form.durationMinutes.trim()
    ) {
      setError('Заполните название, дату начала, дату окончания и длительность.')
      return
    }
    const duration = Number(form.durationMinutes)
    if (Number.isNaN(duration) || duration <= 0) {
      setError('Длительность должна быть числом больше нуля.')
      return
    }
    try {
      await createTest({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        availableFrom: toIsoDateTime(form.availableFrom),
        availableTo: toIsoDateTime(form.availableTo),
        durationMinutes: duration,
      }).unwrap()
      setSuccess('Тест создан.')
      setForm({
        title: '',
        description: '',
        availableFrom: '',
        availableTo: '',
        durationMinutes: '',
      })
    } catch (createError) {
      setError(getErrorMessage(createError))
    }
  }

  const handleDelete = async (id: string | number) => {
    setError('')
    setSuccess('')
    try {
      await deleteTest(id).unwrap()
      setSuccess('Тест удален.')
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Тесты
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Создавайте новые тесты для студентов.
        </Typography>
        <Button component={RouterLink} to="/teacher/dashboard" variant="outlined" sx={{ mb: 3 }}>
          Назад в дашборд преподавателя
        </Button>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Создать тест
            </Typography>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}
            {success ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            ) : null}
            <Stack spacing={2}>
              <TextField
                label="Название теста"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
              <TextField
                label="Описание (опционально)"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
              <TextField
                label="Дата начала"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={form.availableFrom}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, availableFrom: event.target.value }))
                }
              />
              <TextField
                label="Дата окончания"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={form.availableTo}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, availableTo: event.target.value }))
                }
              />
              <TextField
                label="Длительность (минуты)"
                type="number"
                value={form.durationMinutes}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, durationMinutes: event.target.value }))
                }
              />
              <Button variant="contained" onClick={handleCreate}>
                Создать тест
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Список тестов
            </Typography>
            {isLoading ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Загружаем список...
              </Typography>
            ) : tests.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Тестов пока нет.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {tests.map((test) => (
                  <Box
                    key={test.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: 'rgba(25, 118, 210, 0.06)',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {test.title || 'Без названия'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Длительность: {test.durationMinutes ?? '-'} мин
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {test.availableFrom ? `Начало: ${test.availableFrom}` : ''}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                        {test.availableTo ? `Окончание: ${test.availableTo}` : ''}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        component={RouterLink}
                        to={`/teacher/tests/${test.id}`}
                        variant="outlined"
                      >
                        Открыть
                      </Button>
                      <IconButton
                        aria-label="Удалить"
                        color="error"
                        onClick={() => handleDelete(test.id)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default TeacherTestsPage
