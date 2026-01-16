import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext)

  const [state, setState] = useState('Sign Up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const navigate = useNavigate()

  // ================= GOOGLE LOGIN =================
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse?.credential

      if (!idToken) {
        toast.error("Google login failed")
        return
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/google-login`,
        { idToken }
      )

      if (data.success) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
        toast.success("Logged in with Google")
      } else {
        toast.error(data.message || "Google login failed")
      }

    } catch (error) {
      console.error(error)
      toast.error("Google authentication error")
    }
  }

  const handleGoogleError = () => {
    toast.error("Google Sign-In failed")
  }
  // =================================================

  // ================= NORMAL LOGIN / SIGNUP =================
  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(
          `${backendUrl}/api/user/register`,
          { name, email, password }
        )

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success("Account created successfully")
        } else {
          toast.error(data.message)
        }

      } else {
        const { data } = await axios.post(
          `${backendUrl}/api/user/login`,
          { email, password }
        )

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success("Login successful")
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    }
  }

  // ================= REDIRECT AFTER LOGIN =================
  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token, navigate])

  // ================= UI =================
  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>

        <p className='text-2xl font-semibold'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </p>

        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>

        {state === 'Sign Up' && (
          <div className='w-full'>
            <p>Full Name</p>
            <input
              className='border rounded w-full p-2 mt-1'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className='w-full'>
          <p>Email</p>
          <input
            className='border rounded w-full p-2 mt-1'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input
            className='border rounded w-full p-2 mt-1'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className='bg-primary text-white w-full py-2 rounded-md text-base'>
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        {/* OR DIVIDER */}
        <div className='flex items-center w-full gap-2'>
          <hr className='flex-1' />
          <span className='text-xs'>OR</span>
          <hr className='flex-1' />
        </div>

        {/* GOOGLE LOGIN */}
        <div className='w-full flex justify-center'>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        {state === 'Sign Up' ? (
          <p>
            Already have an account?{' '}
            <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{' '}
            <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>
              Click here
            </span>
          </p>
        )}

      </div>
    </form>
  )
}

export default Login
