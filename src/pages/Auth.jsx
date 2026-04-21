import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useFormik } from 'formik'
import { z } from 'zod'
import { useAuthStore } from '../stores'

const loginSchema = z.object({
  username: z.string().min(1, 'أدخل اسم المستخدم'),
  password: z.string().min(1, 'أدخل كلمة المرور'),
})

const registerSchema = z.object({
  username: z.string().min(3, 'الاسم لازم يكون 3 حروف على الأقل').max(20, 'الاسم طويل جداً'),
  password: z.string().min(6, 'كلمة المرور لازم تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
})

function zodValidate(schema) {
  return (values) => {
    const result = schema.safeParse(values)
    if (result.success) return {}
    const errors = {}
    result.error.issues.forEach(issue => {
      errors[issue.path[0]] = issue.message
    })
    return errors
  }
}

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [serverError, setServerError] = useState('')
  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const loginForm = useFormik({
    initialValues: { username: '', password: '' },
    validate: zodValidate(loginSchema),
    onSubmit: (values, { setSubmitting }) => {
      setServerError('')
      const result = login(values.username, values.password)
      setSubmitting(false)
      if (result.success) navigate('/')
      else setServerError(result.error || 'خطأ في تسجيل الدخول')
    },
  })

  const registerForm = useFormik({
    initialValues: { username: '', password: '', confirmPassword: '' },
    validate: zodValidate(registerSchema),
    onSubmit: (values, { setSubmitting }) => {
      setServerError('')
      const result = register(values.username, values.password)
      setSubmitting(false)
      if (result.success) navigate('/')
      else setServerError(result.error || 'خطأ في إنشاء الحساب')
    },
  })

  const InputField = ({ form, name, label, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm text-mist-400 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={form.values[name]}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        placeholder={placeholder}
        className={`input-dark ${form.touched[name] && form.errors[name] ? 'border-red-500/60' : ''}`}
      />
      {form.touched[name] && form.errors[name] && (
        <p className="text-xs text-red-400 mt-1">{form.errors[name]}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-ember-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">📖</span>
            <span className="font-display font-bold text-2xl text-gradient-gold">StoryFlow</span>
          </Link>
          <p className="text-mist-500 text-sm mt-2">قصص تفاعلية بالفيديو</p>
        </div>

        {/* Card */}
        <div className="card-dark p-8">
          {/* Tab Switch */}
          <div className="flex bg-ink-900 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode('login'); setServerError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-ink-700 text-mist-100 shadow-sm' : 'text-mist-500 hover:text-mist-300'
              }`}
            >
              دخول
            </button>
            <button
              onClick={() => { setMode('register'); setServerError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'register' ? 'bg-ink-700 text-mist-100 shadow-sm' : 'text-mist-500 hover:text-mist-300'
              }`}
            >
              حساب جديد
            </button>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {serverError}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit} className="space-y-4">
              <InputField form={loginForm} name="username" label="اسم المستخدم" placeholder="أدخل اسمك" />
              <InputField form={loginForm} name="password" label="كلمة المرور" type="password" placeholder="••••••••" />
              <button
                type="submit"
                disabled={loginForm.isSubmitting}
                className="w-full btn-gold py-3 rounded-xl mt-2 disabled:opacity-50"
              >
                {loginForm.isSubmitting ? 'جاري الدخول...' : 'دخول ←'}
              </button>
              {/* Admin hint */}
              <p className="text-xs text-center text-mist-600 mt-2">
                أدمن: admin / admin123
              </p>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit} className="space-y-4">
              <InputField form={registerForm} name="username" label="اسم المستخدم" placeholder="اختر اسماً مميزاً" />
              <InputField form={registerForm} name="password" label="كلمة المرور" type="password" placeholder="6 أحرف على الأقل" />
              <InputField form={registerForm} name="confirmPassword" label="تأكيد كلمة المرور" type="password" placeholder="أعد كتابة كلمة المرور" />
              <button
                type="submit"
                disabled={registerForm.isSubmitting}
                className="w-full btn-gold py-3 rounded-xl mt-2 disabled:opacity-50"
              >
                {registerForm.isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الحساب ←'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-mist-600 mt-6">
          بإنشاء حساب، أنت توافق على شروط الاستخدام
        </p>
      </div>
    </div>
  )
}
