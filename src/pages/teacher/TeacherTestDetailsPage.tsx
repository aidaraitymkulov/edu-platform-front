import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import {
  useAddTestQuestionMutation,
  useAttemptDetailsQuery,
  useTestResultsQuery,
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

type OptionState = { text: string; isCorrect: boolean }

function TeacherTestDetailsPage() {
  const { testId } = useParams()
  const [addQuestion] = useAddTestQuestionMutation()
  const { data: results = [], isLoading: isResultsLoading } = useTestResultsQuery(testId ?? '', {
    skip: !testId,
  })
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | number | null>(null)
  const { data: attemptDetails, isLoading: isAttemptLoading } = useAttemptDetailsQuery(
    selectedAttemptId ?? '',
    { skip: !selectedAttemptId },
  )

  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState<OptionState[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isReadyToSubmit = useMemo(() => {
    const hasQuestion = questionText.trim().length > 0
    const filledOptions = options.filter((option) => option.text.trim().length > 0)
    const hasCorrect = options.some((option) => option.isCorrect)
    return hasQuestion && filledOptions.length >= 2 && hasCorrect
  }, [options, questionText])

  const handleToggleCorrect = (index: number) => {
    setOptions((prev) =>
      prev.map((option, idx) =>
        idx === index
          ? { ...option, isCorrect: !option.isCorrect }
          : { ...option, isCorrect: false },
      ),
    )
  }

  const handleChangeOption = (index: number, value: string) => {
    setOptions((prev) =>
      prev.map((option, idx) => (idx === index ? { ...option, text: value } : option)),
    )
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!testId) {
      setError('Не удалось определить тест.')
      return
    }
    if (!isReadyToSubmit) {
      setError('Заполните вопрос, минимум 2 варианта и отметьте правильный.')
      return
    }
    const filteredOptions = options
      .filter((option) => option.text.trim().length > 0)
      .map((option) => ({
        text: option.text.trim(),
        isCorrect: option.isCorrect,
      }))
    try {
      await addQuestion({
        testId,
        data: {
          text: questionText.trim(),
          type: 'single',
          options: filteredOptions,
        },
      }).unwrap()
      setQuestionText('')
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ])
      setSuccess('Вопрос добавлен.')
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Тест #{testId}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Добавляйте вопросы и смотрите результаты студентов.
        </Typography>
        <Button component={RouterLink} to="/teacher/tests" variant="outlined" sx={{ mb: 3 }}>
          Назад к тестам
        </Button>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Добавить вопрос
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
                label="Текст вопроса"
                value={questionText}
                onChange={(event) => setQuestionText(event.target.value)}
              />
              {options.map((option, index) => (
                <Box
                  key={index}
                  sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}
                >
                  <TextField
                    label={`Вариант ${index + 1}`}
                    value={option.text}
                    onChange={(event) => handleChangeOption(index, event.target.value)}
                    fullWidth
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={option.isCorrect}
                        onChange={() => handleToggleCorrect(index)}
                      />
                    }
                    label="Верный"
                  />
                </Box>
              ))}
              <Button variant="contained" onClick={handleSubmit} disabled={!isReadyToSubmit}>
                Добавить вопрос
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Результаты теста
            </Typography>
            {isResultsLoading ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Загружаем результаты...
              </Typography>
            ) : results.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Результатов пока нет.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {results.map((result) => (
                  <Box
                    key={result.id}
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
                        {result.login || `Пользователь ${result.userId ?? ''}`}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Балл: {result.score ?? '-'} | Статус:{' '}
                        {result.isPassed ? 'Сдан' : 'Не сдан'}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => setSelectedAttemptId(result.id)}
                    >
                      Детали попытки
                    </Button>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {selectedAttemptId ? (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Детали попытки #{selectedAttemptId}
              </Typography>
              {isAttemptLoading ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Загружаем детали...
                </Typography>
              ) : attemptDetails ? (
                <Stack spacing={2}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Студент: {attemptDetails.studentLogin || attemptDetails.studentId}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Результат: {attemptDetails.score ?? '-'} |{' '}
                    {attemptDetails.isPassed ? 'Сдан' : 'Не сдан'}
                  </Typography>
                  <Divider />
                  {attemptDetails.questions?.map((question, index) => (
                    <Box key={question.id ?? index}>
                      <Typography variant="subtitle1">
                        {index + 1}. {question.text}
                      </Typography>
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        {question.options?.map((option) => (
                          <Typography
                            key={option.id}
                            variant="body2"
                            sx={{
                              color: option.isSelected
                                ? option.isCorrect
                                  ? 'success.main'
                                  : 'error.main'
                                : 'text.secondary',
                            }}
                          >
                            {option.text}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Нет данных для отображения.
                </Typography>
              )}
            </CardContent>
          </Card>
        ) : null}
      </Box>
    </Container>
  )
}

export default TeacherTestDetailsPage
