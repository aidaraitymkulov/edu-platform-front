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

export type TestInput = {
  title: string
  description?: string
  availableFrom: string
  availableTo: string
  durationMinutes: number
}

export type Test = {
  id: string | number
  title?: string
  description?: string
  availableFrom?: string
  availableTo?: string
  durationMinutes?: number
}

export type QuestionOptionInput = {
  text: string
  isCorrect: boolean
}

export type QuestionInput = {
  text: string
  type: 'single' | 'multiple'
  options: QuestionOptionInput[]
}

export type TestResult = {
  id: string | number
  userId?: string | number
  login?: string
  startedAt?: string
  submittedAt?: string
  score?: number
  isPassed?: boolean
}

export type AttemptOption = {
  id: string | number
  text?: string
  isCorrect?: boolean
  isSelected?: boolean
}

export type AttemptQuestion = {
  id: string | number
  text?: string
  type?: string
  isCorrect?: boolean
  options?: AttemptOption[]
}

export type AttemptDetails = {
  attemptId: string | number
  studentId?: string | number
  studentLogin?: string
  testId?: string | number
  testTitle?: string
  score?: number
  isPassed?: boolean
  questions?: AttemptQuestion[]
}

export type GradeInput = {
  studentId: string | number
  value: number
  comment?: string
}

export type Grade = {
  id?: string | number
  studentId?: string | number
  teacherId?: string | number
  value?: number
  comment?: string
  createdAt?: string
}

export type TopicInput = {
  title: string
  content: string
}

export type Topic = {
  id: string | number
  title?: string
  content?: string
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me', 'Teachers', 'Groups', 'Tests', 'Topics', 'Grades'],
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
    createTest: builder.mutation<Test, TestInput>({
      query: (body) => ({
        url: '/tests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tests'],
    }),
    tests: builder.query<Test[], void>({
      query: () => '/tests',
      providesTags: ['Tests'],
    }),
    deleteTest: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/tests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tests'],
    }),
    addTestQuestion: builder.mutation<void, { testId: string | number; data: QuestionInput }>({
      query: ({ testId, data }) => ({
        url: `/tests/${testId}/questions`,
        method: 'POST',
        body: data,
      }),
    }),
    testResults: builder.query<TestResult[], string | number>({
      query: (testId) => `/tests/${testId}/results`,
    }),
    attemptDetails: builder.query<AttemptDetails, string | number>({
      query: (attemptId) => `/attempts/${attemptId}/details`,
    }),
    topics: builder.query<Topic[], void>({
      query: () => '/topics',
      providesTags: ['Topics'],
    }),
    createTopic: builder.mutation<void, TopicInput>({
      query: (body) => ({
        url: '/topics',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Topics'],
    }),
    deleteTopic: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/topics/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Topics'],
    }),
    createGrade: builder.mutation<Grade, GradeInput>({
      query: (body) => ({
        url: '/grades',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Grades'],
    }),
    gradesByGroup: builder.query<Grade[], string | number>({
      query: (groupId) => `/grades/groups/${groupId}`,
      providesTags: ['Grades'],
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
  useCreateTestMutation,
  useTestsQuery,
  useDeleteTestMutation,
  useAddTestQuestionMutation,
  useTestResultsQuery,
  useAttemptDetailsQuery,
  useTopicsQuery,
  useCreateTopicMutation,
  useDeleteTopicMutation,
  useCreateGradeMutation,
  useGradesByGroupQuery,
} = api
