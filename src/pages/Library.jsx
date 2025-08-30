import { useState, useEffect } from 'react'
import Card from '../components/Card'
import Loader from '../components/Loader'
import Notification from '../components/Notification'
import { useLibrary } from '../hooks/useLibrary.js'

const Library = () => {
  const { library, loading, error, removeManhwa, updateManhwa } = useLibrary()
  const [filteredLibrary, setFilteredLibrary] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [notification, setNotification] = useState({ message: '', type: 'success', isVisible: false })

  useEffect(() => {
    applyFilters()
  }, [library, activeFilter, searchQuery])

  // Calculate status counts
  const statusCounts = {
    all: library.length,
    completed: library.filter(item => item.status === 'completed').length,
    reading: library.filter(item => item.status === 'reading').length,
    planned: library.filter(item => item.status === 'planned').length,
    dropped: library.filter(item => item.status === 'dropped').length
  }

  const applyFilters = () => {
    let filtered = library

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.status === activeFilter)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredLibrary(filtered)
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, isVisible: true })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
  }

  const handleMarkAsRead = async (manhwaItem) => {
    try {
      await updateManhwa(manhwaItem.manhwa_id, {
        chapters: (manhwaItem.chapters || 0) + 1,
        status: 'reading'
      })
      showNotification('Chapter marked as read!', 'success')
    } catch (err) {
      showNotification(err.message || 'Failed to update chapter', 'error')
    }
  }

  const handleRemoveFromLibrary = async (manhwaItem) => {
    try {
      await removeManhwa(manhwaItem.manhwa_id)
      showNotification(`${manhwaItem.title} removed from library`, 'success')
    } catch (err) {
      showNotification(err.message || 'Failed to remove from library', 'error')
    }
  }

  if (error) {
    const isTableError = error.includes('Failed to fetch library') || error.includes('relation "user_library" does not exist')
    
    return (
      <div className="container" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            {isTableError ? 'Database Setup Required' : 'Error Loading Library'}
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            {isTableError 
              ? 'The library database table needs to be created in Supabase.'
              : `Error: ${error}`
            }
          </p>
          
          {isTableError && (
            <div style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              padding: '1.5rem', 
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Setup Instructions:</h3>
              <ol style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>Supabase Dashboard</a></li>
                <li>Navigate to "SQL Editor" in the left sidebar</li>
                <li>Click "New Query"</li>
                <li>Copy the contents of <code>supabase_migration.sql</code> from your project</li>
                <li>Paste and run the query</li>
              </ol>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Retry
            </button>
            
            {error.includes('duplicate key') && (
              <button 
                onClick={() => {
                  console.log('🧹 Clearing localStorage to fix duplicate key error...')
                  localStorage.removeItem('manhwaLibrary')
                  console.log('✅ localStorage cleared, reloading page...')
                  window.location.reload()
                }}
                className="btn btn-secondary"
                style={{ 
                  backgroundColor: 'var(--accent-color)', 
                  color: 'white',
                  border: 'none'
                }}
              >
                Clear Local Data & Retry
              </button>
            )}
            
            {isTableError && (
              <button 
                onClick={() => {
                  console.log('🔍 Check browser console for database errors')
                  console.log('Make sure you have run the Supabase migration SQL')
                }}
                className="btn btn-secondary"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                Debug in Console
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <h1 style={{
          fontSize: '2rem',
          marginBottom: '2rem',
          color: 'var(--text-primary)'
        }}>
          My Library
        </h1>



        {loading && <Loader />}

      {/* Search Bar - only show if library has items */}
      {library.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search your library..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  minHeight: '48px'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearch('')}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    minHeight: '48px',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--border-color)'
                    e.target.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--bg-secondary)'
                    e.target.style.color = 'var(--text-secondary)'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </form>
          
          {/* Status Filter Section */}
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {[
              { key: 'all', label: 'All', color: '#4A90E2' },
              { key: 'completed', label: 'Completed', color: '#7ED321' },
              { key: 'reading', label: 'Reading', color: '#50E3C2' },
              { key: 'planned', label: 'Planned', color: '#9013FE' },
              { key: 'dropped', label: 'Dropped', color: '#F5A623' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '20px',
                  backgroundColor: activeFilter === filter.key ? filter.color : 'var(--bg-secondary)',
                  color: activeFilter === filter.key ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  minHeight: '36px'
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== filter.key) {
                    e.target.style.backgroundColor = 'var(--border-color)'
                    e.target.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== filter.key) {
                    e.target.style.backgroundColor = 'var(--bg-secondary)'
                    e.target.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                <span>{filter.label}</span>
                <span style={{
                  backgroundColor: activeFilter === filter.key ? 'rgba(255,255,255,0.2)' : 'var(--border-color)',
                  color: activeFilter === filter.key ? 'white' : 'var(--text-primary)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {statusCounts[filter.key]}
                </span>
              </button>
            ))}
          </div>
          
          {/* Search results info */}
          {searchQuery && (
            <div style={{ 
              marginTop: '1rem',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem'
            }}>
              {filteredLibrary.length === 0 
                ? `No manhwa found matching "${searchQuery}" in your library`
                : `${filteredLibrary.length} manhwa found matching "${searchQuery}"`
              }
            </div>
          )}
        </div>
      )}

      {!loading && library.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--text-secondary)'
        }}>
          <p>Your library is empty. Start adding manhwa from the search page!</p>
        </div>
      ) : !loading && filteredLibrary.length === 0 && searchQuery ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--text-secondary)'
        }}>
          <p>No manhwa found matching "{searchQuery}" in your library.</p>
          <button
            onClick={() => {
              handleSearch('')
              handleFilterChange('all')
            }}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Show All Library
          </button>
        </div>
      ) : !loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '1rem',
          alignItems: 'start'
        }}>
          {filteredLibrary.map((item, index) => (
            <Card
              key={item.manhwa_id || index}
              title={item.title}
              image={item.image}
              status={item.status}
              chapters={item.chapters}
              averageScore={item.average_score}
              progress={item.progress || 0}
              onRead={() => handleRemoveFromLibrary(item)}
              onStatusChange={async (newStatus, newProgress) => {
                try {
                  await updateManhwa(item.manhwa_id, {
                    status: newStatus,
                    progress: newProgress !== null ? newProgress : item.progress || 0
                  })
                  showNotification('Status updated!', 'success')
                } catch (err) {
                  showNotification(err.message || 'Failed to update status', 'error')
                }
              }}
              cardType="library"
            />
          ))}
        </div>
      )}
      </div>
    </>
  )
}

export default Library