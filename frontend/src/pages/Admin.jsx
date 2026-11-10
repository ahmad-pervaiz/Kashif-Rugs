import { useState, useEffect } from 'react'
import { api, setAdminToken, adminHeaders } from '../services/api'
import ReviewModeration from '../components/ReviewModeration'
import { getImageUrl } from '../services/carpetService'
import AdminForm from '../components/AdminForm'
import { getAllCarpets, createCarpet, updateCarpet, deleteCarpet } from '../services/carpetService'
import { motion, AnimatePresence } from 'framer-motion'

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [authError, setAuthError] = useState('')
  const [formKey, setFormKey] = useState(0)
  const [carpets, setCarpets] = useState([])
  const [catalogError, setCatalogError] = useState('')
  const [editingCarpet, setEditingCarpet] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCarpets()
    const expired = () => { setAuthenticated(false); setAdminEmail(''); setAuthError('Your session expired. Please sign in again.'); }
    window.addEventListener('admin-session-expired', expired)
    return () => window.removeEventListener('admin-session-expired', expired)
  }, [])

  const fetchCarpets = async () => {
    try {
      const data = await getAllCarpets()
      setCarpets(data)
      setCatalogError('')
    } catch (err) {
      setCatalogError(err.response?.data?.message || 'Unable to load rugs. Check the backend and database connection.')
    }
  }

  const handleCreate = async (formData) => {
    try {
      setLoading(true)
      await createCarpet(formData)
      setFormKey(k => k + 1)
      alert('Rug added successfully!')
      fetchCarpets()
      // Clear form logic might be needed here, but AdminForm state might persist.
      // Actually AdminForm state resets if initialData changes or we might need a way to reset it.
      // But for now let's assume it's fine.
    } catch (err) {
      alert('Failed to add rug: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (formData) => {
    try {
      setLoading(true)
      await updateCarpet(editingCarpet._id, formData)
      alert('Carpet updated successfully!')
      setEditingCarpet(null)
      fetchCarpets()
    } catch (err) {
      alert('Failed to update carpet: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this carpet?')) return

    try {
      await deleteCarpet(id)
      alert('Carpet deleted successfully!')
      fetchCarpets()
    } catch (err) {
      alert('Failed to delete carpet: ' + err.message)
    }
  }

  if (!authenticated) return <div className="max-w-lg mx-auto p-8 text-white"><h1 className="text-3xl mb-6">Store administration</h1><form className="space-y-4" onSubmit={async e => {
    e.preventDefault(); setSigningIn(true); setAuthError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAdminToken(data.token); setAdminEmail(data.email); setAuthenticated(true); setPassword(''); fetchCarpets();
    } catch (error) {
      setAdminToken(''); setPassword('');
      setAuthError(error.response?.data?.message || 'Unable to sign in. Check that the backend is running.');
    } finally { setSigningIn(false); }
  }}>
    <label className="block">Admin email<input className="input mt-2" type="email" autoComplete="username" required maxLength="254" value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label className="block">Password<input className="input mt-2" type="password" autoComplete="current-password" required maxLength="1024" value={password} onChange={e => setPassword(e.target.value)} /></label>
    <button disabled={signingIn} className="bg-blue-600 rounded px-5 py-3 disabled:opacity-50">{signingIn ? 'Signing in…' : 'Sign in'}</button><p role="alert">{authError}</p>
  </form></div>
  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-10 text-center text-white"
        >
          Admin Panel
        </motion.h1>

        <p className="text-gray-300 mb-2">Signed in as {adminEmail}</p>
        <button className="text-white mb-6 underline" onClick={async () => {
          try { await api.post('/auth/logout', {}, { headers: adminHeaders() }); }
          catch { setAuthError('Server sign-out could not be confirmed. The session expires automatically within one hour.'); }
          finally { setAdminToken(''); setAuthenticated(false); setAdminEmail(''); }
        }}>Sign out</button>
        {catalogError && <div role="alert" className="text-amber-300 border border-amber-700 rounded p-4 mb-6"><p>{catalogError}</p><button className="underline mt-2" onClick={fetchCarpets}>Retry loading rugs</button></div>}
        <ReviewModeration />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-dark-surface border border-white/5 rounded-xl shadow-xl p-8 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">
                {editingCarpet ? 'Edit Carpet' : 'Add New Carpet'}
              </h2>
              <AdminForm key={formKey}
                onSubmit={editingCarpet ? handleUpdate : handleCreate}
                initialData={editingCarpet}
                buttonText={editingCarpet ? 'Update Carpet' : 'Add Carpet'}
              />
              {editingCarpet && (
                <button
                  onClick={() => setEditingCarpet(null)}
                  className="mt-4 text-gray-400 hover:text-white hover:underline block text-center w-full transition-colors"
                >
                  Cancel Editing
                </button>
              )}
              {loading && <p className="text-center text-accent-blue mt-4 font-medium animate-pulse">Processing...</p>}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">All Carpets ({carpets.length})</h2>
            <div className="space-y-4">
              <AnimatePresence>
                {carpets.map((carpet) => (
                  <motion.div
                    key={carpet._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    layout
                    className="bg-dark-surface border border-white/5 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center shadow-lg hover:border-white/20 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                        <img
                          src={getImageUrl(carpet.imageUrl)}
                          alt={carpet.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white">{carpet.title}</h3>
                        <p className="text-accent-blue font-mono font-medium">${carpet.price}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setEditingCarpet(carpet)}
                        className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-4 py-2 rounded-lg transition-colors duration-200 font-medium border border-blue-500/30"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(carpet._id)}
                        className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg transition-colors duration-200 font-medium border border-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {carpets.length === 0 && (
                <div className="text-center py-12 bg-dark-surface border border-white/5 rounded-xl">
                  <p className="text-gray-400 text-lg">No carpets found.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
