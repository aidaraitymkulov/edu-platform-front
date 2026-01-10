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
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useCreateGroupMutation, useGroupsQuery, useTeachersQuery } from '../../store/api'
import { Link as RouterLink } from 'react-router-dom'

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

function AdminGroupsPage() {
  const { data: groups = [], isLoading } = useGroupsQuery()
  const { data: teachers = [], isLoading: isTeachersLoading } = useTeachersQuery()
  const [createGroup] = useCreateGroupMutation()
  const [form, setForm] = useState({ name: '', curatorId: '' })
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setError('')
    if (!form.name.trim()) {
      setError('Введите название группы.')
      return
    }
    try {
      await createGroup({
        name: form.name,
        curatorId: form.curatorId || undefined,
      }).unwrap()
      setForm({ name: '', curatorId: '' })
    } catch (createError) {
      setError(getErrorMessage(createError))
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Группы
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Создавайте учебные группы и контролируйте их структуру.
        </Typography>
        <Button component={RouterLink} to="/" variant="outlined" sx={{ mb: 3 }}>
          Назад в дашборд
        </Button>

        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Создать группу
              </Typography>
              {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : null}
              <Stack spacing={2}>
                <TextField
                  label="Название группы"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <FormControl fullWidth>
                  <InputLabel id="curator-select-label">Куратор (опционально)</InputLabel>
                  <Select
                    labelId="curator-select-label"
                    label="Куратор (опционально)"
                    value={form.curatorId}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, curatorId: event.target.value }))
                    }
                  >
                    <MenuItem value="">
                      <em>Без куратора</em>
                    </MenuItem>
                    {teachers.map((teacher) => (
                      <MenuItem key={teacher.id} value={String(teacher.id)}>
                        {teacher.firstName || teacher.lastName
                          ? `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim()
                          : teacher.login || `ID: ${teacher.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {isTeachersLoading ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Загружаем список кураторов...
                  </Typography>
                ) : null}
                <Button variant="contained" onClick={handleCreate}>
                  Создать группу
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Список групп
              </Typography>
              {isLoading ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Загружаем список...
                </Typography>
              ) : groups.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Группы пока не созданы.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {groups.map((group) => (
                    <Box
                      key={group.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'rgba(25, 118, 210, 0.06)',
                      }}
                    >
                      <Typography variant="subtitle1">
                        {group.name || `Группа #${group.id}`}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        ID: {group.id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {group.curatorId ? `Куратор: ${group.curatorId}` : ''}
                      </Typography>
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

export default AdminGroupsPage
