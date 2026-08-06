import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080/devices'

const initialForm = {
  name: '',
  type: '',
  serialNumber: '',
  location: '',
  status: 'aktiv',
}

function App() {
  const [devices, setDevices] = useState([])
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingDevice, setEditingDevice] = useState(null)
  const [error, setError] = useState('')

  const loadDevices = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error('Geräte konnten nicht geladen werden.')
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
  }

  const cancelEdit = () => {
    setEditingDevice(null)
    setForm(initialForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

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
        throw new Error(editingDevice ? 'Gerät konnte nicht aktualisiert werden.' : 'Gerät konnte nicht gespeichert werden.')
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
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (deviceId) => {
    setDeletingId(deviceId)
    setError('')

    try {
      const response = await fetch(`${API_URL}/${deviceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Gerät konnte nicht gelöscht werden.')
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
      </header>

      {error && <p className="message error">{error}</p>}

      <section className="device-layout">
        <form className="device-form" onSubmit={handleSubmit}>
          <h2>{editingDevice ? 'Gerät bearbeiten' : 'Neues Gerät'}</h2>

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

          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Speichern...' : editingDevice ? 'Aktualisieren' : 'Gerät speichern'}
          </button>
          {editingDevice && (
            <button type="button" className="cancel-button" onClick={cancelEdit}>
              Abbrechen
            </button>
          )}
        </form>

        <section className="device-list">
          <div className="list-header">
            <h2>Geräte</h2>
            <span>{devices.length}</span>
          </div>

          {isLoading ? (
            <p className="message">Geräte werden geladen...</p>
          ) : devices.length === 0 ? (
            <p className="message">Noch keine Geräte erfasst.</p>
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
                  {devices.map((device) => (
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
                        <button
                          className="edit-button"
                          type="button"
                          onClick={() => startEdit(device)}
                          disabled={deletingId === device.id}
                        >
                          Bearbeiten
                        </button>
                        <button
                          className="delete-button"
                          type="button"
                          onClick={() => handleDelete(device.id)}
                          disabled={deletingId === device.id}
                        >
                          {deletingId === device.id ? 'Löschen...' : 'Löschen'}
                        </button>
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
