import Home from './pages/Home'
import Library from './pages/Library'
import Search from './pages/Search'
import CreateAccount from './pages/CreateAccount'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'

export const routes = [
  {
    path: '/',
    element: Home,
    name: 'Home'
  },
  {
    path: '/library',
    element: Library,
    name: 'Library'
  },
  {
    path: '/search',
    element: Search,
    name: 'Search'
  },
  {
    path: '/create-account',
    element: CreateAccount,
    name: 'Create Account'
  },
  {
    path: '/login',
    element: Login,
    name: 'Login'
  },
  {
    path: '/forgot-password',
    element: ForgotPassword,
    name: 'Forgot Password'
  }
]