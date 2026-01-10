import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material'
import { useLoginMutation } from '../store/api'

const schema = z.object({
  login: z.string().min(1, 'Введите логин'),
  password: z.string().min(1, 'Введите пароль'),
})

type LoginFormValues = z.infer<typeof schema>

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'status' in error) {
    const baseQueryError = error as FetchBaseQueryError
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
    if (typeof baseQueryError.error === 'string') {
      return baseQueryError.error
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось войти. Проверьте данные и попробуйте снова.'
}

function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [loginMutation] = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      login: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError('')
    try {
      await loginMutation(values).unwrap()
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error))
    }
  })

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          mt: { xs: 6, sm: 10 },
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))',
          boxShadow: '0 18px 40px rgba(20, 33, 61, 0.15)',
          border: '1px solid rgba(255,255,255,0.6)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
          Вход в платформу
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Используйте ваши данные, чтобы продолжить работу.
        </Typography>
        {serverError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        ) : null}
        <TextField
          label="Логин"
          fullWidth
          margin="normal"
          autoComplete="username"
          error={Boolean(errors.login)}
          helperText={errors.login?.message}
          {...register('login')}
        />
        <TextField
          label="Пароль"
          type="password"
          fullWidth
          margin="normal"
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register('password')}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={{
            mt: 3,
            py: 1.2,
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          {isSubmitting ? 'Входим...' : 'Войти'}
        </Button>
      </Box>
    </Container>
  )
}

export default LoginPage
