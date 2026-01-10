import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const baseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: 'include',
})

let refreshPromise: Promise<boolean> | null = null

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions)
  const requestUrl = typeof args === 'string' ? args : args.url
  const shouldSkipRefresh =
    requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh')

  if (!shouldSkipRefresh && result.error && result.error.status === 401) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions,
        )
        refreshPromise = null
        return !refreshResult.error
      })()
    }

    const refreshed = await refreshPromise
    if (refreshed) {
      result = await baseQuery(args, api, extraOptions)
    }
  }
  return result
}

export type LoginPayload = {
  login: string
  password: string
}

export type AuthUser = {
  id?: string | number
  login?: string
  firstName?: string
  lastName?: string
  birthDate?: string
  role?: string
}

export type TeacherInput = {
  login: string
  password: string
  firstName?: string
  lastName?: string
  birthDate?: string
}

export type StudentInput = {
  login: string
  password: string
  firstName?: string
  lastName?: string
  birthDate?: string
  groupId?: string | number
}

export type Teacher = {
  id: string | number
  login?: string
  firstName?: string
  lastName?: string
  birthDate?: string
  role?: string
  groupId?: string | number | null
}

export type Student = {
  id: string | number
  login?: string
  firstName?: string
  lastName?: string
  birthDate?: string
  role?: string
  groupId?: string | number
}

export type Group = {
  id: string | number
  name?: string
  curatorId?: string | number | null
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me', 'Teachers', 'Groups'],
  endpoints: (builder) => ({
    login: builder.mutation<void, LoginPayload>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
    me: builder.query<AuthUser, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
    }),
    teachers: builder.query<Teacher[], void>({
      query: () => '/users/teachers',
      providesTags: ['Teachers'],
    }),
    createTeacher: builder.mutation<void, TeacherInput>({
      query: (body) => ({
        url: '/users/teachers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Teachers'],
    }),
    deleteTeacher: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/users/teachers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Teachers'],
    }),
    createStudent: builder.mutation<void, StudentInput>({
      query: (body) => ({
        url: '/users/students',
        method: 'POST',
        body,
      }),
    }),
    deleteStudent: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/users/students/${id}`,
        method: 'DELETE',
      }),
    }),
    groups: builder.query<Group[], void>({
      query: () => '/groups',
      providesTags: ['Groups'],
    }),
    groupStudents: builder.query<Student[], string | number>({
      query: (groupId) => `/groups/${groupId}/students`,
    }),
    createGroup: builder.mutation<void, { name: string; curatorId?: string | number }>({
      query: (body) => ({
        url: '/groups',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Groups'],
    }),
  }),
})

export const {
  useLoginMutation,
  useMeQuery,
  useTeachersQuery,
  useCreateTeacherMutation,
  useDeleteTeacherMutation,
  useCreateStudentMutation,
  useDeleteStudentMutation,
  useGroupsQuery,
  useCreateGroupMutation,
  useGroupStudentsQuery,
} = api
