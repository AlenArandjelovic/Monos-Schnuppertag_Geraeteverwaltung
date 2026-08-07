import Button from './Button'

function DeviceRow({ device, onEdit, onDelete, isDeleting }) {
  return (
    <tr>
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
          onClick={() => onEdit(device)}
          disabled={isDeleting}
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
          onClick={() => onDelete(device.id)}
          disabled={isDeleting}
          aria-label={`Gerät ${device.name} löschen`}
        >
          {isDeleting ? (
            <span className="icon-button__spinner" aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 3h6a1 1 0 0 1 1 1v1h3a1 1 0 1 1 0 2h-1v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7H5a1 1 0 1 1 0-2h3V4a1 1 0 0 1 1-1zm2 4h2v10h-2V7zm-3 0h2v10H8V7zm7 0h2v10h-2V7z" />
            </svg>
          )}
        </Button>
      </td>
    </tr>
  )
}

export default DeviceRow
