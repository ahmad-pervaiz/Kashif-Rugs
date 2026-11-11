import { useState, useEffect } from 'react'
import { api, setAdminToken, adminHeaders } from '../services/api'
import ReviewModeration from '../components/ReviewModeration'
import { getImageUrl } from '../services/carpetService'
import AdminForm from '../components/AdminForm'
import { getAllCarpets, createCarpet, updateCarpet, deleteCarpet } from '../services/carpetService'

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

  if (!authenticated) return <div className="max-w-lg mx-auto p-8 text-ink"><p className="eyebrow">Kashif Rugs</p><h1 className="page-title">Store administration</h1><form className="space-y-4" onSubmit={async e => {
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
    <button disabled={signingIn} className="bg-ink text-paper rounded-none px-5 py-3 disabled:opacity-50">{signingIn ? 'Signing in…' : 'Sign in'}</button><p role="alert">{authError}</p>
  </form></div>
  return (
    <div className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1
          className="page-title text-center mb-10"
        >
          Admin Panel
        </h1>

        <p className="text-ink mb-2">Signed in as {adminEmail}</p>
        <button className="text-ink mb-6 underline" onClick={async () => {
          try { await api.post('/auth/logout', {}, { headers: adminHeaders() }); }
          catch { setAuthError('Server sign-out could not be confirmed. The session expires automatically within one hour.'); }
          finally { setAdminToken(''); setAuthenticated(false); setAdminEmail(''); }
        }}>Sign out</button>
        {catalogError && <div role="alert" className="text-danger border border-danger rounded-none p-4 mb-6"><p>{catalogError}</p><button className="underline mt-2" onClick={fetchCarpets}>Retry loading rugs</button></div>}
        <ReviewModeration />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div
          >
            <div className="bg-panel border border-line rounded-none  p-8 sticky top-24">
              <h2 className="text-2xl font-medium mb-6 text-ink border-b border-line pb-4">
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
                  className="mt-4 text-muted hover:text-ink hover:underline block text-center w-full transition-colors"
                >
                  Cancel Editing
                </button>
              )}
              {loading && <p className="text-center text-ink mt-4 font-medium animate-pulse">Processing...</p>}
            </div>
          </div>

          <div
          >
            <h2 className="text-2xl font-medium mb-6 text-ink border-b border-line pb-4">All Carpets ({carpets.length})</h2>
            <div className="space-y-4">
              <>
                {carpets.map((carpet) => (
                  <div
                    key={carpet._id}
                    className="bg-panel border border-line rounded-none p-5 flex flex-col sm:flex-row justify-between items-center  hover:border-line transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
                      <div className="w-16 h-16 rounded-none overflow-hidden flex-shrink-0 border border-line">
                        <img
                          src={getImageUrl(carpet.imageUrl)}
                          alt={carpet.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-ink">{carpet.title}</h3>
                        <p className="text-ink font-mono font-medium">${carpet.price}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setEditingCarpet(carpet)}
                        className="bg-tint hover:bg-tint text-ink px-4 py-2 rounded-none transition-colors duration-200 font-medium border border-line"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(carpet._id)}
                        className="bg-danger/10 hover:bg-danger/20 text-danger px-4 py-2 rounded-none transition-colors duration-200 font-medium border border-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </>
              {carpets.length === 0 && (
                <div className="text-center py-12 bg-panel border border-line rounded-none">
                  <p className="text-muted text-lg">No carpets found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
