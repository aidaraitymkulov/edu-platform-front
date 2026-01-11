import { useMemo, useState } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import {
  useCreateGradeMutation,
  useGradesByGroupQuery,
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

type GradeFormState = {
  value: string
  comment: string
}

function formatDate(value?: string) {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString('ru-RU')
}

function TeacherGradesPage() {
  const { data: groups = [], isLoading: isGroupsLoading } = useGroupsQuery()
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const { data: students = [], isLoading: isStudentsLoading } = useGroupStudentsQuery(
    selectedGroupId,
    { skip: !selectedGroupId },
  )
  const { data: grades = [], isLoading: isGradesLoading } = useGradesByGroupQuery(
    selectedGroupId,
    { skip: !selectedGroupId },
  )
  const [createGrade] = useCreateGradeMutation()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [gradeForms, setGradeForms] = useState<Record<string, GradeFormState>>({})

  const gradesByStudentId = useMemo(() => {
    const map = new Map<string, typeof grades>()
    grades.forEach((grade) => {
      if (grade.studentId == null) {
        return
      }
      const key = String(grade.studentId)
      const list = map.get(key) ?? []
      list.push(grade)
      map.set(key, list)
    })
    map.forEach((list, key) => {
      list.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bDate - aDate
      })
      map.set(key, list)
    })
    return map
  }, [grades])

  const handleChange = (studentId: string | number, field: keyof GradeFormState, value: string) => {
    setGradeForms((prev) => ({
      ...prev,
      [String(studentId)]: {
        value: prev[String(studentId)]?.value ?? '',
        comment: prev[String(studentId)]?.comment ?? '',
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (studentId: string | number) => {
    setError('')
    setSuccess('')
    const form = gradeForms[String(studentId)]
    if (!form || !form.value.trim()) {
      setError('Введите оценку.')
      return
    }
    const value = Number(form.value)
    if (Number.isNaN(value)) {
      setError('Оценка должна быть числом.')
      return
    }
    try {
      await createGrade({
        studentId,
        value,
        comment: form.comment.trim() || undefined,
      }).unwrap()
      setSuccess('Оценка сохранена.')
      setGradeForms((prev) => ({
        ...prev,
        [String(studentId)]: { value: '', comment: '' },
      }))
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Журнал оценок
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Выберите группу и выставляйте оценки студентам. Все оценки отображаются с датой.
        </Typography>
        <Button component={RouterLink} to="/teacher/dashboard" variant="outlined" sx={{ mb: 3 }}>
          Назад в дашборд преподавателя
        </Button>

        <Card>
          <CardContent>
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
              {error ? (
                <Alert severity="error">{error}</Alert>
              ) : success ? (
                <Alert severity="success">{success}</Alert>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        {selectedGroupId ? (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Студенты и оценки
              </Typography>
              {isStudentsLoading || isGradesLoading ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Загружаем данные...
                </Typography>
              ) : students.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  В группе нет студентов.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Студент</TableCell>
                        <TableCell>Последняя оценка</TableCell>
                        <TableCell>Дата</TableCell>
                        <TableCell>История</TableCell>
                        <TableCell>Новая оценка</TableCell>
                        <TableCell>Комментарий</TableCell>
                        <TableCell align="right">Действие</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student) => {
                        const studentId = String(student.id)
                        const studentGrades = gradesByStudentId.get(studentId) ?? []
                        const lastGrade = studentGrades[0]
                        return (
                          <TableRow key={studentId} hover>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {student.firstName || student.lastName
                                  ? `${student.firstName ?? ''} ${
                                      student.lastName ?? ''
                                    }`.trim()
                                  : 'Без имени'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {student.login || `ID: ${studentId}`}
                              </Typography>
                            </TableCell>
                            <TableCell>{lastGrade?.value ?? '—'}</TableCell>
                            <TableCell>{formatDate(lastGrade?.createdAt)}</TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                {studentGrades.length === 0 ? (
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    — нет оценок —
                                  </Typography>
                                ) : (
                                  studentGrades.map((grade) => (
                                    <Typography
                                      key={String(grade.id ?? grade.createdAt ?? Math.random())}
                                      variant="caption"
                                      sx={{ color: 'text.secondary' }}
                                    >
                                      {formatDate(grade.createdAt)} · {grade.value}
                                      {grade.comment ? ` (${grade.comment})` : ''}
                                    </Typography>
                                  ))
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={gradeForms[studentId]?.value ?? ''}
                                onChange={(event) =>
                                  handleChange(studentId, 'value', event.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={gradeForms[studentId]?.comment ?? ''}
                                onChange={(event) =>
                                  handleChange(studentId, 'comment', event.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                variant="contained"
                                onClick={() => handleSubmit(studentId)}
                              >
                                Сохранить
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        ) : null}
      </Box>
    </Container>
  )
}

export default TeacherGradesPage
