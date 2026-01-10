import { useState } from 'react'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Link as RouterLink } from 'react-router-dom'
import {
  useCreateStudentMutation,
  useDeleteStudentMutation,
  useGroupStudentsQuery,
  useGroupsQuery,
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

function AdminStudentsPage() {
  const { data: groups = [], isLoading: isGroupsLoading } = useGroupsQuery()
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const { data: students = [], isLoading: isStudentsLoading } = useGroupStudentsQuery(
    selectedGroupId,
    { skip: !selectedGroupId },
  )
  const [createStudent] = useCreateStudentMutation()
  const [deleteStudent] = useDeleteStudentMutation()
  const [form, setForm] = useState({
    login: '',
    password: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    groupId: '',
  })
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setError('')
    if (
      !form.login.trim() ||
      !form.password.trim() ||
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.birthDate.trim() ||
      !form.groupId.trim()
    ) {
      setError('Заполните логин, пароль, имя, фамилию, дату рождения и выберите группу.')
      return
    }
    try {
      await createStudent({
        login: form.login,
        password: form.password,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        birthDate: form.birthDate || undefined,
        groupId: form.groupId || undefined,
      }).unwrap()
      setForm({
        login: '',
        password: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        groupId: '',
      })
    } catch (createError) {
      setError(getErrorMessage(createError))
    }
  }

  const handleDelete = async (id: string | number) => {
    setError('')
    try {
      await deleteStudent(id).unwrap()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Студенты
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Добавляйте новых студентов и удаляйте учетные записи при необходимости.
        </Typography>
        <Button component={RouterLink} to="/" variant="outlined" sx={{ mb: 3 }}>
          Назад в дашборд
        </Button>

        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Студенты выбранной группы
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="group-select-label">Группа</InputLabel>
                  <Select
                    labelId="group-select-label"
                    label="Группа"
                    value={selectedGroupId}
                    onChange={(event) => setSelectedGroupId(event.target.value)}
                  >
                    {groups.map((group) => (
                      <MenuItem key={group.id} value={String(group.id)}>
                        {group.name || `Группа #${group.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {isGroupsLoading ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Загружаем группы...
                  </Typography>
                ) : null}
                {selectedGroupId ? (
                  isStudentsLoading ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Загружаем студентов...
                    </Typography>
                  ) : students.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      В этой группе пока нет студентов.
                    </Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {students.map((student) => (
                        <Box
                          key={student.id}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'rgba(25, 118, 210, 0.06)',
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1">
                              {student.firstName || student.lastName
                                ? `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim()
                                : 'Без имени'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {student.login || `ID: ${student.id}`}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {student.birthDate ? `Дата рождения: ${student.birthDate}` : ''}
                            </Typography>
                          </Box>
                          <IconButton
                            aria-label="Удалить"
                            color="error"
                            onClick={() => handleDelete(student.id)}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  )
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Выберите группу, чтобы увидеть список студентов.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Создать студента
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
                <FormControl fullWidth>
                  <InputLabel id="group-create-label">Группа</InputLabel>
                  <Select
                    labelId="group-create-label"
                    label="Группа"
                    value={form.groupId}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, groupId: event.target.value }))
                    }
                  >
                    {groups.map((group) => (
                      <MenuItem key={group.id} value={String(group.id)}>
                        {group.name || `Группа #${group.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={handleCreate}>
                  Создать студента
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  )
}

export default AdminStudentsPage
