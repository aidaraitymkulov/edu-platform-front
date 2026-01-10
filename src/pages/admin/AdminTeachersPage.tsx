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
import {
  useCreateTeacherMutation,
  useDeleteTeacherMutation,
  useTeachersQuery,
} from '../../store/api'

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

function AdminTeachersPage() {
  const { data: teachers = [], isLoading } = useTeachersQuery()
  const [createTeacher] = useCreateTeacherMutation()
  const [deleteTeacher] = useDeleteTeacherMutation()
  const [form, setForm] = useState({
    login: '',
    password: '',
    firstName: '',
    lastName: '',
    birthDate: '',
  })
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setError('')
    if (
      !form.login.trim() ||
      !form.password.trim() ||
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.birthDate.trim()
    ) {
      setError('Заполните логин, пароль, имя, фамилию и дату рождения.')
      return
    }
    try {
      await createTeacher({
        login: form.login,
        password: form.password,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        birthDate: form.birthDate || undefined,
      }).unwrap()
      setForm({
        login: '',
        password: '',
        firstName: '',
        lastName: '',
        birthDate: '',
      })
    } catch (createError) {
      setError(getErrorMessage(createError))
    }
  }

  const handleDelete = async (id: string | number) => {
    setError('')
    try {
      await deleteTeacher(id).unwrap()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Учителя
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Добавляйте новых учителей и управляйте существующими аккаунтами.
        </Typography>
        <Button component={RouterLink} to="/" variant="outlined" sx={{ mb: 3 }}>
          Назад в дашборд
        </Button>

        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Создать учителя
              </Typography>
              {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : null}
              <Stack spacing={2}>
                <TextField
                  label="Логин"
                  value={form.login}
                  onChange={(event) => setForm((prev) => ({ ...prev, login: event.target.value }))}
                />
                <TextField
                  label="Пароль"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                />
                <TextField
                  label="Имя"
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                />
                <TextField
                  label="Фамилия"
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                />
                <TextField
                  label="Дата рождения"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.birthDate}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, birthDate: event.target.value }))
                  }
                />
                <Button variant="contained" onClick={handleCreate}>
                  Создать учителя
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Список учителей
              </Typography>
              {isLoading ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Загружаем список...
                </Typography>
              ) : teachers.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Учителей пока нет.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {teachers.map((teacher) => (
                    <Box
                      key={teacher.id}
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
                          {teacher.firstName || teacher.lastName
                            ? `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim()
                            : 'Без имени'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {teacher.login || `ID: ${teacher.id}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {teacher.birthDate ? `Дата рождения: ${teacher.birthDate}` : ''}
                        </Typography>
                      </Box>
                      <IconButton
                        aria-label="Удалить"
                        color="error"
                        onClick={() => handleDelete(teacher.id)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  )
}

export default AdminTeachersPage
