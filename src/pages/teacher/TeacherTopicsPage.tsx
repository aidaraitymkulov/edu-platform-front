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
import { useCreateTopicMutation, useDeleteTopicMutation, useTopicsQuery } from '../../store/api'

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

function TeacherTopicsPage() {
  const { data: topics = [], isLoading } = useTopicsQuery()
  const [createTopic] = useCreateTopicMutation()
  const [deleteTopic] = useDeleteTopicMutation()
  const [form, setForm] = useState({ title: '', content: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCreate = async () => {
    setError('')
    setSuccess('')
    if (!form.title.trim() || !form.content.trim()) {
      setError('Заполните название и содержание темы.')
      return
    }
    try {
      await createTopic({
        title: form.title.trim(),
        content: form.content.trim(),
      }).unwrap()
      setForm({ title: '', content: '' })
      setSuccess('Тема создана.')
    } catch (createError) {
      setError(getErrorMessage(createError))
    }
  }

  const handleDelete = async (id: string | number) => {
    setError('')
    setSuccess('')
    try {
      await deleteTopic(id).unwrap()
      setSuccess('Тема удалена.')
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Темы и уроки
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
          Создавайте материалы для студентов и управляйте ими.
        </Typography>
        <Button component={RouterLink} to="/teacher/dashboard" variant="outlined" sx={{ mb: 3 }}>
          Назад в дашборд преподавателя
        </Button>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Создать тему
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
                label="Название темы"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
              <TextField
                label="Содержание"
                multiline
                minRows={4}
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              />
              <Button variant="contained" onClick={handleCreate}>
                Создать тему
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Список тем
            </Typography>
            {isLoading ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Загружаем список...
              </Typography>
            ) : topics.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Тем пока нет.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {topics.map((topic) => (
                  <Box
                    key={topic.id}
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
                        {topic.title || 'Без названия'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {topic.content ? topic.content.slice(0, 120) : ''}
                      </Typography>
                    </Box>
                    <IconButton
                      aria-label="Удалить"
                      color="error"
                      onClick={() => handleDelete(topic.id)}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
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

export default TeacherTopicsPage
