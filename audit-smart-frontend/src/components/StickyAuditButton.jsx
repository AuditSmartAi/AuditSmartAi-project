import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import './StickyAuditButton.css'

export default function StickyAuditButton() {
  const navigate = useNavigate()

  return (
    <button 
      className="sticky-audit-btn"
      onClick={() => navigate('/audit')}
    >
      <Upload size={18} />
      <span>Start Audit</span>
    </button>
  )
}