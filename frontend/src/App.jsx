import { useEffect, useState, useMemo } from 'react'
import './App.css'
import Button from './components/Button'
import Modal from './components/Modal'

const API_URL = 'http://localhost:8080/devices'

const initialForm = {
  name: '',
  type: '',
  serialNumber: '',
  location: '',
  status: 'aktiv',
}

const readErrorMessage = async (response, fallbackMessage) => {
  const contentType = response.headers.get('Content-Type') || ''

  try {
    if (contentType.includes('application/json')) {
      const errorBody = await response.json()

      if (Array.isArray(errorBody.details) && errorBody.details.length > 0) {
        return errorBody.details.join('\n')
      }

      return errorBody.message || errorBody.detail || fallbackMessage
    }

    const text = await response.text()
    return text || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

function App() {
  const [devices, setDevices] = useState([])
  const [form, setForm] = useState(initialForm)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingDevice, setEditingDevice] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const loadDevices = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Geräte konnten nicht geladen werden.'))
      }
      const data = await response.json()
      setDevices(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDevices()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
    if (formError) {
      setFormError('')
    }
  }

  const startEdit = (device) => {
    setEditingDevice(device)
    setForm({
      name: device.name,
      type: device.type,
      serialNumber: device.serialNumber,
      location: device.location,
      status: device.status,
    })
    setShowModal(true)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const cancelEdit = () => {
    setEditingDevice(null)
    setForm(initialForm)
    setFormError('')
    setShowModal(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setFormError('')

    try {
      const url = editingDevice ? `${API_URL}/${editingDevice.id}` : API_URL
      const method = editingDevice ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const message = await readErrorMessage(response, 'Gerät konnte nicht gespeichert werden.')
        if (response.status === 409 || /bereits|existiert|unique|serial/i.test(message)) {
          setFormError(message)
          return
        }
        throw new Error(message)
      }

      const savedDevice = await response.json()
      setDevices((currentDevices) => {
        if (editingDevice) {
          return currentDevices.map((device) => (device.id === savedDevice.id ? savedDevice : device))
        }
        return [...currentDevices, savedDevice]
      })
      setForm(initialForm)
      setEditingDevice(null)
      setShowModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredDevices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) {
      return devices
    }

    return devices.filter((device) =>
      device.name.toLowerCase().includes(term) ||
      device.serialNumber.toLowerCase().includes(term),
    )
  }, [devices, searchTerm])

  const handleDelete = async (deviceId) => {
    setDeletingId(deviceId)
    setError('')

    try {
      const response = await fetch(`${API_URL}/${deviceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Gerät konnte nicht gelöscht werden.'))
      }

      setDevices((currentDevices) =>
        currentDevices.filter((device) => device.id !== deviceId),
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="device-app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Inventar</p>
          <h1>Geräteverwaltung</h1>
        </div>
        <div>
          <Button onClick={() => { setEditingDevice(null); setForm(initialForm); setShowModal(true); }}>Gerät anlegen</Button>
        </div>
      </header>

      {error && <p className="message error">{error}</p>}

      <Modal isOpen={showModal} onClose={() => { cancelEdit(); }}>
        <form className="device-form" onSubmit={handleSubmit}>
          <h2>{editingDevice ? 'Gerät bearbeiten' : 'Neues Gerät'}</h2>

{formError && (
  <div className="form-error">
    {formError}
  </div>
)}


          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Typ
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Seriennummer
            <input
              name="serialNumber"
              value={form.serialNumber}
              onChange={handleChange}
              maxLength="100"
              required
            />
          </label>

          <label>
            Standort
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="aktiv">aktiv</option>
              <option value="inaktiv">inaktiv</option>
            </select>
          </label>

          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? 'Speichern...' : editingDevice ? 'Aktualisieren' : 'Gerät speichern'}
          </Button>
          {editingDevice && (
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Abbrechen
            </Button>
          )}
        </form>
      </Modal>

      <section className="device-layout">

        <section className="device-list">
          <div className="list-header">
            <div className="list-header-title">
              <h2>Geräte</h2>
              <span>{filteredDevices.length}</span>
            </div>
            <label className="search-label">
              Suche
              <input
                className="search-input"
                type="search"
                name="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Name oder Seriennummer"
              />
            </label>
          </div>

          {isLoading ? (
            <p className="message">Geräte werden geladen...</p>
          ) : devices.length === 0 ? (
            <p className="message">Noch keine Geräte erfasst.</p>
          ) : filteredDevices.length === 0 ? (
            <p className="message">Keine Geräte gefunden.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Typ</th>
                    <th>Seriennummer</th>
                    <th>Standort</th>
                    <th>Status</th>
                    <th>Erfasst am</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device) => (
                    <tr key={device.id}>
                      <td>{device.name}</td>
                      <td>{device.type}</td>
                      <td>{device.serialNumber}</td>
                      <td>{device.location}</td>
                      <td>
                        <span className={`status ${device.status}`}>
                          {device.status}
                        </span>
                      </td>
                      <td>{device.createdAt}</td>
                      <td>
                        <Button
                          variant="secondary"
                          type="button"
                          className="icon-button"
                          onClick={() => startEdit(device)}
                          disabled={deletingId === device.id}
                          aria-label={`Gerät ${device.name} bearbeiten`}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 17.25V21h3.75L17.81 8.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </Button>
                        <Button
                          variant="danger"
                          type="button"
                          className="icon-button"
                          onClick={() => handleDelete(device.id)}
                          disabled={deletingId === device.id}
                          aria-label={`Gerät ${device.name} löschen`}
                        >
                          {deletingId === device.id ? (
                            <span className="icon-button__spinner" aria-hidden="true" />
                          ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M9 3h6a1 1 0 0 1 1 1v1h3a1 1 0 1 1 0 2h-1v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7H5a1 1 0 1 1 0-2h3V4a1 1 0 0 1 1-1zm2 4h2v10h-2V7zm-3 0h2v10H8V7zm7 0h2v10h-2V7z" />
                            </svg>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
